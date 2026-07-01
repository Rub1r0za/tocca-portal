'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Menu, ChevronLeft } from 'lucide-react'
import { MenuDrawer } from './menu-drawer'

export function AppHeader({
  title,
  locale,
  subtitle,
  backHref,
}: {
  title: string
  locale: string
  subtitle?: string
  backHref?: string
}) {
  const [open, setOpen] = useState(false)
  const tMenu = useTranslations('menu')

  return (
    <>
      <header
        className="sticky top-0 z-30"
        style={{ background: 'linear-gradient(135deg, #23374D 0%, #1a2d3f 100%)' }}
      >
        <div className="flex items-center gap-3 px-4 pt-5 pb-5">
          {backHref ? (
            <Link
              href={backHref}
              aria-label={tMenu('back')}
              className="-ml-1.5 rounded-full p-1.5 text-white/80 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <ChevronLeft className="size-6" aria-hidden />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={tMenu('open')}
              aria-haspopup="dialog"
              aria-expanded={open}
              className="-ml-1.5 rounded-full p-1.5 text-white/80 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <Menu className="size-6" aria-hidden />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1
              className="truncate text-[1.55rem] leading-tight text-white"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-xs tracking-wide text-white/65">{subtitle}</p>
            )}
          </div>
          {/* Tocca wordmark */}
          <span className="shrink-0 text-[0.55rem] tracking-[0.35em] text-white/40 uppercase select-none">
            Tocca
          </span>
        </div>
      </header>

      {!backHref && <MenuDrawer open={open} onClose={() => setOpen(false)} locale={locale} />}
    </>
  )
}
