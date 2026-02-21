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

    const { incidentId, note } = await request.json()

    if (!incidentId) {
      return NextResponse.json({ error: 'Missing incidentId' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('alerts')
      .update({
        admin_notes: note || null,
      })
      .eq('id', incidentId)

    if (updateError) throw updateError

    await supabase.from('admin_activity_logs').insert({
      admin_id: adminData.id,
      action: 'add_incident_note',
      resource_type: 'incident',
      resource_id: incidentId,
      details: { note_length: note?.length || 0 },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Add note error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add note' },
      { status: 500 }
    )
  }
}
