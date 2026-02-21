import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { staffId, notes } = await request.json()

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
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        background_check_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', staffId)

    if (updateError) {
      throw updateError
    }

    // Log admin activity
    await supabase.from('admin_activity_logs').insert({
      admin_id: adminUser.id,
      action: 'verify_staff',
      target_type: 'staff',
      target_id: staffId,
      details: { notes },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error verifying staff:', error)
    return NextResponse.json(
      { error: 'Failed to verify staff' },
      { status: 500 }
    )
  }
}
