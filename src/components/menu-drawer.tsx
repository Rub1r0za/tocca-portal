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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
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
            'absolute inset-y-0 left-0 flex h-full w-[80%] max-w-[300px] flex-col border-r border-hairline bg-white shadow-[4px_0_32px_rgba(62,45,35,0.15)] outline-none transition-transform duration-300',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Header */}
          <div
            className="flex items-end justify-between px-5 pt-8 pb-6"
            style={{ background: 'linear-gradient(135deg, #23374D 0%, #1a2d3f 100%)' }}
          >
            <div>
              <p className="text-[0.6rem] tracking-[0.4em] text-white/50 uppercase">Tocca</p>
              <p
                className="text-2xl text-white"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic' }}
              >
                Amalfi Coast
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={tMenu('close')}
              className="mb-0.5 rounded-full p-1.5 text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          {/* Nav */}
          <nav aria-label={t('label')} className="flex-1 overflow-y-auto px-3 py-4">
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
                        'flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-azure/40',
                        active
                          ? 'bg-azure/10 text-azure font-medium'
                          : 'text-mist hover:bg-panel-2 hover:text-foreground'
                      )}
                    >
                      <Icon
                        className={cn('size-[18px] shrink-0', active ? 'text-azure' : 'text-mist')}
                        strokeWidth={active ? 2 : 1.7}
                        aria-hidden
                      />
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
              className="flex w-full items-center gap-2 rounded-xl border border-hairline px-3 py-2.5 text-sm text-mist transition-colors hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-azure/40"
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
