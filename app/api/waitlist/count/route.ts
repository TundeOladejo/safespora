import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create service client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the current count
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      count: count || 0
    })
  } catch (error: any) {
    console.error('Error getting waitlist count:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get waitlist count' },
      { status: 500 }
    )
  }
}