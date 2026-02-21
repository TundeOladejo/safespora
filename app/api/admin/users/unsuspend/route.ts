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
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Unsuspend user
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_suspended: false,
        suspension_reason: null,
        suspended_at: null,
        suspended_by: null,
      })
      .eq('id', userId)

    if (updateError) throw updateError

    // Log activity
    await supabase.from('admin_activity_logs').insert({
      admin_id: adminData.id,
      action: 'unsuspend_user',
      resource_type: 'user',
      resource_id: userId,
      details: {},
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Unsuspend user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to unsuspend user' },
      { status: 500 }
    )
  }
}
