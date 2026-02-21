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

    // Delete confirmations first (foreign key constraint)
    await supabase
      .from('alert_confirmations')
      .delete()
      .eq('alert_id', incidentId)

    // Delete the incident
    const { error: deleteError } = await supabase
      .from('alerts')
      .delete()
      .eq('id', incidentId)

    if (deleteError) throw deleteError

    // Log activity
    await supabase.from('admin_activity_logs').insert({
      admin_id: adminData.id,
      action: 'delete_incident',
      resource_type: 'incident',
      resource_id: incidentId,
      details: {},
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete incident error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete incident' },
      { status: 500 }
    )
  }
}
