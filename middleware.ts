import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is authenticated and accessing admin routes
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    // Skip check for reset password page
    if (request.nextUrl.pathname === '/auth/reset-password') {
      return response
    }

    // Check if admin user needs to reset password
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('password_reset_required')
      .eq('email', user.email)
      .single()

    if (adminUser?.password_reset_required) {
      // Redirect to reset password page
      return NextResponse.redirect(new URL('/auth/reset-password', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/reset-password',
  ],
}
