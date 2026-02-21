import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { emails, downloadLink } = await request.json()

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

    // Check if user has permission (super admin or settings edit)
    const canNotify = adminUser.role === 'super_admin' || 
      adminUser.permissions?.settings?.edit === true

    if (!canNotify) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Create service client
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

    const { emailService } = await import('@/lib/email-service')
    const { EMAIL_TEMPLATES } = await import('@/lib/email-templates')

    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    // Send emails
    for (const email of emails) {
      try {
        await emailService.sendEmail({
          to: email,
          subject: '🚀 SafeSpora is Live! Download Now',
          html: EMAIL_TEMPLATES.WAITLIST_LAUNCH(email, downloadLink),
        })

        // Update waitlist status
        await supabaseAdmin
          .from('waitlist')
          .update({ 
            status: 'invited',
            invited_at: new Date().toISOString()
          })
          .eq('email', email)

        successCount++
        console.log('✅ Launch notification sent to', email)
      } catch (error: any) {
        failCount++
        errors.push(`${email}: ${error.message}`)
        console.error('❌ Failed to send to', email, error)
      }
    }

    // Log activity
    await supabase.from('admin_activity_logs').insert({
      admin_id: adminUser.id,
      action: 'notify_waitlist',
      target_type: 'waitlist',
      target_id: 'bulk',
      details: { 
        total: emails.length,
        success: successCount,
        failed: failCount,
        downloadLink
      },
    })

    return NextResponse.json({
      success: true,
      total: emails.length,
      sent: successCount,
      failed: failCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error: any) {
    console.error('Error notifying waitlist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to notify waitlist' },
      { status: 500 }
    )
  }
}
