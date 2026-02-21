import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

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

    const { incidentId } = await request.json()

    if (!incidentId) {
      return NextResponse.json({ error: 'Missing incidentId' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('alerts')
      .update({
        status: 'false_report',
        resolved_at: new Date().toISOString(),
        resolved_by: adminData.id,
      })
      .eq('id', incidentId)

    if (updateError) throw updateError

    await supabase.from('admin_activity_logs').insert({
      admin_id: adminData.id,
      action: 'mark_false_report',
      resource_type: 'incident',
      resource_id: incidentId,
      details: {},
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('False report error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark as false report' },
      { status: 500 }
    )
  }
}
