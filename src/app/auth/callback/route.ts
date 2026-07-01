import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/en/dashboard'

  // On Vercel, request.url has http:// but the real host is in x-forwarded-host
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost ? `https://${forwardedHost}` : requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const pendingCookies: ResponseCookie[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            pendingCookies.push(...(cookiesToSet as ResponseCookie[]))
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const response = NextResponse.redirect(`${host}${next}`)
      // Explicitly copy session cookies onto the redirect response
      pendingCookies.forEach((cookie) => response.cookies.set(cookie))
      return response
    }
    console.error('[auth/callback] error:', error.message)
  }

  return NextResponse.redirect(`${host}/en/login?error=auth`)
}
