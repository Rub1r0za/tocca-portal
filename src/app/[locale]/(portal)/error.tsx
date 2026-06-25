'use client'

import { useTranslations } from 'next-intl'
import { AlertCircle } from 'lucide-react'

export default function PortalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('common')
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <AlertCircle className="mb-3 size-8 text-destructive" aria-hidden />
      <p className="text-lg text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
        {t('error')}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-xl border border-hairline px-4 py-2.5 text-sm text-mist transition-colors hover:border-gold/40 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
      >
        {t('retry')}
      </button>
    </div>
  )
}
