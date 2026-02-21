import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Nigerian states list
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 
  'Federal Capital Territory'
]

export async function POST(request: Request) {
  try {
    const { email, fullName, phone, state, city, referralSource } = await request.json()

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    if (!state) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 })
    }

    if (!NIGERIAN_STATES.includes(state)) {
      return NextResponse.json({ error: 'Please select a valid Nigerian state' }, { status: 400 })
    }

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

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id, status, position')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        position: existing.position,
        status: existing.status,
        message: 'You are already on the waitlist!'
      })
    }

    // Get the current count to calculate position
    const { count, error: countError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw countError
    }

    // Calculate next position (current count + 1)
    const nextPosition = (count || 0) + 1

    // Add to waitlist with explicit position
    const { data: waitlistEntry, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase(),
        full_name: fullName,
        phone,
        state,
        city: city || null,
        referral_source: referralSource,
        status: 'pending',
        position: nextPosition // Make sure position is set
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Send confirmation email
    try {
      const { emailService } = await import('@/lib/email-service')
      const { EMAIL_TEMPLATES } = await import('@/lib/email-templates')
      
      await emailService.sendEmail({
        to: email,
        subject: 'Welcome to SafeSpora Waitlist!',
        html: EMAIL_TEMPLATES.WAITLIST_CONFIRMATION(email, waitlistEntry.position),
      })
      
      console.log('✅ Waitlist confirmation email sent to', email)
    } catch (emailError) {
      console.error('⚠️ Failed to send waitlist confirmation email:', emailError)
      // Don't fail the signup if email fails
    }

    return NextResponse.json({
      success: true,
      position: waitlistEntry.position, // This should now be defined
      message: 'Successfully joined the waitlist!'
    })
  } catch (error: any) {
    console.error('Error joining waitlist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}