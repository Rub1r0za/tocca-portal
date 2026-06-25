'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { X, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { navItems } from './nav-items'
import { LocaleSwitch } from './locale-switch'

export function MenuDrawer({
  open,
  onClose,
  locale,
}: {
  open: boolean
  onClose: () => void
  locale: string
}) {
  const t = useTranslations('mobileNav')
  const tMenu = useTranslations('menu')
  const pathname = usePathname()
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)

  // Lock body scroll + ESC to close while open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    onClose()
    router.push(`/${locale}/login`)
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex justify-center transition-opacity duration-300',
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      inert={!open}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label={tMenu('close')}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        tabIndex={open ? 0 : -1}
      />
      <div className="relative h-full w-full max-w-[430px]">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={tMenu('title')}
          tabIndex={-1}
          className={cn(
            'absolute inset-y-0 left-0 flex h-full w-[84%] max-w-[320px] flex-col border-r border-hairline bg-night shadow-2xl outline-none transition-transform duration-300',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-5">
            <div>
              <p className="text-[0.65rem] tracking-[0.25em] text-azure uppercase">Tocca</p>
              <p
                className="text-2xl text-foreground"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Amalfi Coast
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={tMenu('close')}
              className="rounded-full p-1.5 text-mist transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          {/* Nav */}
          <nav aria-label={t('label')} className="flex-1 overflow-y-auto px-3">
            <ul className="space-y-0.5">
              {navItems.map(({ key, path, Icon }) => {
                const href = `/${locale}${path}`
                const active = pathname === href || pathname.startsWith(`${href}/`)
                return (
                  <li key={key}>
                    <Link
                      href={href}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
                        active
                          ? 'bg-panel-2 text-gold'
                          : 'text-mist hover:bg-panel hover:text-foreground'
                      )}
                    >
                      <Icon className="size-[18px] shrink-0" strokeWidth={1.7} aria-hidden />
                      {t(key)}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="space-y-4 border-t border-hairline px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wide text-mist uppercase">{tMenu('language')}</span>
              <LocaleSwitch current={locale} />
            </div>
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-xl border border-hairline px-3 py-2.5 text-sm text-mist transition-colors hover:border-destructive/40 hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            >
              <LogOut className="size-4" aria-hidden />
              {tMenu('signOut')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
