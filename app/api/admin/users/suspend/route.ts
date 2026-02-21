import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .eq('is_active', true)
      .single()

    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const { userId, reason } = await request.json()

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Suspend user
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_suspended: true,
        suspension_reason: reason,
        suspended_at: new Date().toISOString(),
        suspended_by: adminData.id,
      })
      .eq('id', userId)

    if (updateError) throw updateError

    // Log activity
    await supabase.from('admin_activity_logs').insert({
      admin_id: adminData.id,
      action: 'suspend_user',
      resource_type: 'user',
      resource_id: userId,
      details: { reason },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Suspend user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to suspend user' },
      { status: 500 }
    )
  }
}
