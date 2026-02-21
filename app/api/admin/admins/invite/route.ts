import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { email, fullName, role, permissions } = await request.json()

    // Create service role client to bypass RLS
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, role, permissions')
      .eq('email', user.email)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to invite admins
    const canInvite = adminUser.role === 'super_admin' || 
      adminUser.permissions?.admins?.invite === true

    if (!canInvite) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Validate required fields
    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    // Check if email already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      return NextResponse.json({ error: 'Admin with this email already exists' }, { status: 400 })
    }

    // Check if there's a pending invitation
    const { data: existingInvitation } = await supabaseAdmin
      .from('admin_invitations')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json({ error: 'Pending invitation already exists for this email' }, { status: 400 })
    }

    // Generate temporary password
    const tempPassword = generateTempPassword()

    // Create invitation
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('admin_invitations')
      .insert({
        email,
        role,
        permissions: role === 'super_admin' ? {} : permissions,
        invited_by: adminUser.id,
        temp_password: tempPassword,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single()

    if (invitationError) {
      throw invitationError
    }

    // Create auth user with temporary password
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        invited_by: user.email
      }
    })

    if (authError) {
      // Rollback invitation if auth user creation fails
      await supabaseAdmin
        .from('admin_invitations')
        .delete()
        .eq('id', invitation.id)
      
      throw authError
    }

    // Create admin user record using service role to bypass RLS
    const { error: adminError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email,
        full_name: fullName.trim(),
        role,
        permissions: role === 'super_admin' ? {} : permissions,
        invited_by: adminUser.id,
        password_reset_required: true,
        is_active: true
      })

    if (adminError) {
      // Rollback if admin user creation fails
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id)
      await supabaseAdmin
        .from('admin_invitations')
        .delete()
        .eq('id', invitation.id)
      
      throw adminError
    }

    // Update invitation status
    await supabaseAdmin
      .from('admin_invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invitation.id)

    // Log admin activity (use regular client for this)
    await supabase.from('admin_activity_logs').insert({
      admin_id: adminUser.id,
      action: 'invite_admin',
      target_type: 'admin',
      target_id: email,
      details: { role, has_permissions: Object.keys(permissions || {}).length > 0 },
    })

    // Send invitation email
    try {
      const { emailService } = await import('@/lib/email-service')
      const { EMAIL_TEMPLATES } = await import('@/lib/email-templates')
      
      await emailService.sendEmail({
        to: email,
        subject: 'You\'ve been invited to SafeSpora Admin Portal',
        html: EMAIL_TEMPLATES.ADMIN_INVITATION(
          email,
          tempPassword,
          role,
          user.email!
        ),
      })
      
      console.log('✅ Invitation email sent to', email)
    } catch (emailError) {
      console.error('⚠️ Failed to send invitation email:', emailError)
      // Don't fail the invitation if email fails
    }

    return NextResponse.json({ 
      success: true,
      tempPassword,
      message: 'Invitation sent successfully'
    })
  } catch (error) {
    console.error('Error inviting admin:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
