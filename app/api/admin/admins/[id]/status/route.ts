import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { isActive } = await request.json()
    const resolvedParams = await params

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, email, role, permissions')
      .eq('email', user.email)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to delete/deactivate admins
    const canDelete = adminUser.role === 'super_admin' || 
      adminUser.permissions?.admins?.delete === true

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Prevent self-deactivation
    if (adminUser.id === resolvedParams.id) {
      return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
    }

    // Get target admin email
    const { data: targetAdmin } = await supabase
      .from('admin_users')
      .select('email')
      .eq('id', resolvedParams.id)
      .single()

    if (!targetAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Update status
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ is_active: isActive })
      .eq('id', resolvedParams.id)

    if (updateError) {
      throw updateError
    }

    // Log activity
    await supabase.from('admin_activity_logs').insert({
      admin_id: adminUser.id,
      action: isActive ? 'activate_admin' : 'deactivate_admin',
      target_type: 'admin',
      target_id: resolvedParams.id,
    })

    // Send email notification
    try {
      const { emailService } = await import('@/lib/email-service')
      const { EMAIL_TEMPLATES } = await import('@/lib/email-templates')
      
      await emailService.sendEmail({
        to: targetAdmin.email,
        subject: `Your SafeSpora Admin Account Has Been ${isActive ? 'Activated' : 'Deactivated'}`,
        html: EMAIL_TEMPLATES.ACCOUNT_STATUS_CHANGE(
          targetAdmin.email,
          isActive,
          adminUser.email
        ),
      })
      
      console.log('✅ Status change email sent to', targetAdmin.email)
    } catch (emailError) {
      console.error('⚠️ Failed to send status change email:', emailError)
      // Don't fail the update if email fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating admin status:', error)
    return NextResponse.json(
      { error: 'Failed to update admin status' },
      { status: 500 }
    )
  }
}
