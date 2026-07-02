'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-3 text-sm text-foreground placeholder:text-mist/50 focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure/20'
const labelClass = 'mb-2 block text-[0.7rem] font-semibold tracking-[0.2em] text-mist uppercase'

export function PasswordForm() {
  const t = useTranslations('account')
  const tLogin = useTranslations('login')
  const locale = useLocale()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'busy' | 'done'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError(tLogin('passwordTooShort'))
      return
    }
    if (password !== confirm) {
      setError(t('mismatch'))
      return
    }
    setStatus('busy')
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError(tLogin('error'))
      setStatus('idle')
      return
    }
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div className="rounded-2xl border border-hairline bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(62,45,35,0.10)]">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-azure/10">
          <CheckCircle2 className="size-6 text-azure" aria-hidden />
        </div>
        <p className="text-sm leading-relaxed text-mist">{t('saved')}</p>
        <Link
          href={`/${locale}/dashboard`}
          className="mt-5 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #23374D 0%, #1a2d3f 100%)' }}
        >
          {t('goToDashboard')}
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-hairline bg-white px-6 py-8 shadow-[0_4px_24px_rgba(62,45,35,0.10)]">
      <p className="mb-6 text-center text-sm leading-relaxed text-mist">{t('passwordSubtitle')}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className={labelClass}>
            {t('newPassword')}
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className={labelClass}>
            {t('confirmPassword')}
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={status === 'busy'}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #23374D 0%, #1a2d3f 100%)' }}
        >
          {status === 'busy' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <KeyRound className="size-4" aria-hidden />
          )}
          {status === 'busy' ? t('saving') : t('save')}
        </button>
      </form>
    </div>
  )
}
