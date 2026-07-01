'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { navItems } from './nav-items'

export function BottomNav({ locale }: { locale: string }) {
  const t = useTranslations('mobileNav')
  const pathname = usePathname()

  return (
    <nav
      aria-label={t('label')}
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-hairline bg-white/95 backdrop-blur-md"
    >
      <ul className="flex items-stretch pb-safe">
        {navItems.map(({ key, path, Icon }) => {
          const href = `/${locale}${path}`
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 px-1 pt-2.5 pb-2 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-azure/40',
                  active ? 'text-azure' : 'text-mist hover:text-foreground'
                )}
              >
                <span className="relative">
                  <Icon
                    className="size-5 shrink-0"
                    strokeWidth={active ? 2 : 1.6}
                    aria-hidden
                  />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-azure" />
                  )}
                </span>
                <span className="w-full truncate text-[0.6rem] leading-tight tracking-wide">
                  {t(key)}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
