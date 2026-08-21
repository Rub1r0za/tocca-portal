import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null

  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost ? `https://${forwardedHost}` : requestUrl.origin

  // Resolve `next` to a safe, same-origin path (guards against open redirects).
  // Sin locale: que el idioma lo decida el navegador del viajero.
  let next = '/dashboard'
  const rawNext = requestUrl.searchParams.get('next')
  if (rawNext) {
    try {
      const nextUrl = new URL(rawNext, host)
      if (nextUrl.origin === new URL(host).origin) {
        next = nextUrl.pathname + nextUrl.search
      }
    } catch {
      // keep default
    }
  }

  if (tokenHash && type) {
    const cookieStore = await cookies()
    const pendingCookies: Array<{ name: string; value: string; options?: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              pendingCookies.push({ name, value, options })
            })
          },
        },
      }
    )

    // token_hash flow: no PKCE code_verifier needed, so it works cross-device
    // and inside in-app/embedded browsers.
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      const response = NextResponse.redirect(`${host}${next}`)
      pendingCookies.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
      )
      return response
    }
    console.error('[auth/confirm] error:', error.message)
  }

  return NextResponse.redirect(`${host}/login?error=auth`)
}
