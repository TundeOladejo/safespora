import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { validateEmail } from '@/utils/email-validation'
import { sendWaitlistConfirmation } from '@/utils/email'

const waitlistSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name contains invalid characters'),
  email: z.string()
    .email('Invalid email address')
    .max(254, 'Email is too long'),
  city: z.string()
    .max(100, 'City name is too long')
    .regex(/^[a-zA-Z\s\-',.]*$/, 'City contains invalid characters')
    .optional(),
})

// Rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const MAX_REQUESTS_PER_IP = 5;

export async function POST(request: Request) {
  try {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Rate limiting
    const now = Date.now();
    const userRateLimit = rateLimit.get(ip);
    
    if (userRateLimit) {
      if (now - userRateLimit.timestamp > RATE_LIMIT_WINDOW) {
        rateLimit.set(ip, { count: 1, timestamp: now });
      } else if (userRateLimit.count >= MAX_REQUESTS_PER_IP) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      } else {
        userRateLimit.count++;
        rateLimit.set(ip, userRateLimit);
      }
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }
    
    const body = await request.json()
    const validatedData = waitlistSchema.parse(body)
    
    // Email validation
    const emailValidation = validateEmail(validatedData.email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.reason || 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Spam check
    const spamKeywords = ['test', 'asdf', 'qwerty', '1234', 'aaaa'];
    if (spamKeywords.some(keyword => validatedData.name.toLowerCase().includes(keyword))) {
      return NextResponse.json(
        { error: 'Please enter a valid name' },
        { status: 400 }
      );
    }
    
    // Insert into Supabase
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        city: validatedData.city || null,
        ip_address: ip,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error);
      
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      );
    }
    
    // Send confirmation email (don't await - fire and forget)
    sendWaitlistConfirmation(validatedData).catch(error => {
      console.error('Email sending failed:', error);
    });
    
    return NextResponse.json(
      { 
        message: 'Successfully joined waitlist',
        data: data 
      },
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}