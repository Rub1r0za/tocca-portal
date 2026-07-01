import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { routing } from './i18n/routing'

const intlProxy = createMiddleware(routing)

const protectedRoutes = ['/dashboard', '/journey', '/meals', '/activities', '/timeline', '/wellness', '/admin']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let auth callback pass through without locale handling
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  const pathnameWithoutLocale = pathname.replace(/^\/(en|es)/, '') || '/'
  const isProtected = protectedRoutes.some(
    (r) => pathnameWithoutLocale === r || pathnameWithoutLocale.startsWith(r + '/')
  )

  if (isProtected) {
    let refreshedCookies: Array<{ name: string; value: string; options?: object }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            refreshedCookies = cookiesToSet
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const locale = pathname.match(/^\/(en|es)/)?.[1] ?? routing.defaultLocale
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }

    // Merge any refreshed auth cookies into the intl response
    const response = intlProxy(request)
    refreshedCookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options)
    )
    return response
  }

  return intlProxy(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
