import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/en/dashboard'

  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost ? `https://${forwardedHost}` : requestUrl.origin

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const response = NextResponse.redirect(`${host}${next}`)
      // Copy session cookies with correct options (name, value, options spread separately)
      pendingCookies.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
      )
      return response
    }
    console.error('[auth/callback] error:', error.message)
  }

  return NextResponse.redirect(`${host}/en/login?error=auth`)
}
