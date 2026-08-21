import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

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

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) console.error('[auth/callback] error:', error.message)
  }

  // Redirect to `next` whenever a session exists — freshly exchanged above, or
  // already set by /auth/confirm (token_hash flow) before landing here.
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const response = NextResponse.redirect(`${host}${next}`)
    // Copy session cookies with correct options (name, value, options spread separately)
    pendingCookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
    )
    return response
  }

  const locale = next.match(/^\/(en|es)(\/|$)/)?.[1]
  return NextResponse.redirect(`${host}${locale ? `/${locale}` : ''}/login?error=auth`)
}
