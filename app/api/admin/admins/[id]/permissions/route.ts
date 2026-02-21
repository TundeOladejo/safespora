import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { permissions } = await request.json()
    const resolvedParams = await params

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, role, permissions, email')
      .eq('email', user.email)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admins can edit permissions
    if (adminUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get the target admin's current permissions and email
    const { data: targetAdmin } = await supabase
      .from('admin_users')
      .select('email, permissions')
      .eq('id', resolvedParams.id)
      .single()

    if (!targetAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Calculate permission changes
    const changes: { module: string; action: string; oldValue: boolean; newValue: boolean }[] = []
    const oldPermissions = targetAdmin.permissions || {}
    
    Object.keys(permissions).forEach(module => {
      Object.keys(permissions[module]).forEach(action => {
        const oldValue = oldPermissions[module]?.[action] || false
        const newValue = permissions[module][action]
        
        if (oldValue !== newValue) {
          changes.push({
            module,
            action,
            oldValue,
            newValue
          })
        }
      })
    })

    // Update permissions
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ permissions })
      .eq('id', resolvedParams.id)

    if (updateError) {
      throw updateError
    }

    // Log activity
    await supabase.from('admin_activity_logs').insert({
      admin_id: adminUser.id,
      action: 'update_admin_permissions',
      target_type: 'admin',
      target_id: resolvedParams.id,
      details: { permissions, changes_count: changes.length },
    })

    // Send email notification if there are changes
    if (changes.length > 0) {
      try {
        const { emailService } = await import('@/lib/email-service')
        const { EMAIL_TEMPLATES } = await import('@/lib/email-templates')
        
        await emailService.sendEmail({
          to: targetAdmin.email,
          subject: 'Your SafeSpora Admin Permissions Have Been Updated',
          html: EMAIL_TEMPLATES.PERMISSION_UPDATE(
            targetAdmin.email,
            adminUser.email,
            changes
          ),
        })
        
        console.log('✅ Permission update email sent to', targetAdmin.email)
      } catch (emailError) {
        console.error('⚠️ Failed to send permission update email:', emailError)
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating permissions:', error)
    return NextResponse.json(
      { error: 'Failed to update permissions' },
      { status: 500 }
    )
  }
}
