import type { ReactNode } from 'react'
import { BottomNav } from './bottom-nav'

/**
 * The phone-style frame: centered 430px column on every viewport.
 * On desktop the void canvas (warm taupe) shows around it; on mobile it fills the screen.
 */
export function MobileShell({ locale, children }: { locale: string; children: ReactNode }) {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px] bg-night shadow-[0_0_60px_rgba(62,45,35,0.20)] sm:border-x sm:border-hairline">
      <div className="min-h-screen pb-24">{children}</div>
      <BottomNav locale={locale} />
    </div>
  )
}
