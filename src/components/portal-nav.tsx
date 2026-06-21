'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { key: 'dashboard' as const, path: '/dashboard' },
  { key: 'journey' as const, path: '/journey' },
  { key: 'meals' as const, path: '/meals' },
  { key: 'activities' as const, path: '/activities' },
]

export function PortalNav({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  return (
    <header className="border-b border-sand bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Wordmark */}
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 shrink-0">
          <span
            className="text-lg text-ink"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Tocca
          </span>
          <span className="hidden sm:block text-xs tracking-[0.2em] text-[#2F7E72] uppercase mt-0.5">
            Amalfi
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1" aria-label="Portal navigation">
          {navItems.map(({ key, path }) => {
            const href = `/${locale}${path}`
            const active = pathname.startsWith(href)
            return (
              <Link
                key={key}
                href={href}
                className={`px-3 py-1.5 text-xs tracking-wide rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#11487E]/30 ${
                  active
                    ? 'text-[#11487E] font-medium bg-[#11487E]/6'
                    : 'text-[#6b7280] hover:text-ink'
                }`}
              >
                {t(key)}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="text-xs text-[#6b7280] hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-[#11487E]/30 rounded px-2 py-1"
        >
          {t('signOut')}
        </button>
      </div>
    </header>
  )
}
