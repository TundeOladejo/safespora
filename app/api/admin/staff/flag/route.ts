import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { staffId, reason } = await request.json()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update staff verification status
    const { error: updateError } = await supabase
      .from('staff_records')
      .update({
        verification_status: 'flagged',
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', staffId)

    if (updateError) {
      throw updateError
    }

    // Log admin activity
    await supabase.from('admin_activity_logs').insert({
      admin_id: adminUser.id,
      action: 'flag_staff',
      target_type: 'staff',
      target_id: staffId,
      details: { reason },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error flagging staff:', error)
    return NextResponse.json(
      { error: 'Failed to flag staff' },
      { status: 500 }
    )
  }
}
