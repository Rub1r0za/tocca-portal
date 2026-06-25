'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

export function LocaleSwitch({ current }: { current: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchTo(locale: string) {
    if (locale === current) return
    const next = pathname.replace(/^\/(en|es)/, `/${locale}`)
    startTransition(() => router.push(next))
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex rounded-full border border-hairline bg-panel-2 p-0.5"
    >
      {routing.locales.map((locale) => {
        const active = locale === current
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchTo(locale)}
            disabled={isPending}
            aria-pressed={active}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-60',
              active ? 'bg-gold text-accent-foreground' : 'text-mist hover:text-foreground'
            )}
          >
            {locale}
          </button>
        )
      })}
    </div>
  )
}
