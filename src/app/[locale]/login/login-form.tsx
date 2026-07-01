'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Mail, Loader2, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'

const emailSchema = z.string().email()

export default function LoginForm() {
  const t = useTranslations('login')
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') ?? ''
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) return
    setStatus('sending')
    const supabase = createClient()
    const callbackUrl = nextPath
      ? `${location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
      : `${location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    })
    setStatus(error ? 'error' : 'sent')
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6"
      style={{ background: 'linear-gradient(160deg, #EFEAE4 0%, #FAFAF8 60%, #F0EDE8 100%)' }}
    >
      {/* Wordmark */}
      <div className="mb-8 text-center sm:mb-10">
        <p className="text-[0.6rem] font-semibold tracking-[0.45em] text-azure uppercase">
          Tocca
        </p>
        <h1
          className="mt-2 text-[2.6rem] leading-tight text-foreground sm:text-5xl"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic' }}
        >
          Amalfi Coast
        </h1>
        <div className="mx-auto mt-4 flex items-center gap-3 px-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
          <span className="text-[0.6rem] tracking-[0.3em] text-gold/80 uppercase">
            Private Portal
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-[360px] sm:max-w-sm">
        {status === 'sent' ? (
          <div className="rounded-2xl border border-hairline bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(62,45,35,0.10)] sm:px-8">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-azure/10">
              <Mail className="size-6 text-azure" aria-hidden />
            </div>
            <h2
              className="text-xl text-foreground"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              {t('checkEmail')}
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-mist">
              {t('checkEmailDesc', { email })}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-hairline bg-white px-6 py-8 shadow-[0_4px_24px_rgba(62,45,35,0.10)] sm:px-8">
            <p className="mb-6 text-center text-sm leading-relaxed text-mist">
              {t('subtitle')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[0.7rem] font-semibold tracking-[0.2em] text-mist uppercase"
                >
                  {t('emailLabel')}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-3 text-sm text-foreground placeholder:text-mist/50 focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure/20"
                />
              </div>

              {status === 'error' && (
                <p className="text-xs text-destructive">{t('error')}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-azure/50"
                style={{ background: 'linear-gradient(135deg, #23374D 0%, #1a2d3f 100%)' }}
              >
                {status === 'sending' ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-4" aria-hidden />
                )}
                {status === 'sending' ? t('sending') : t('submit')}
              </button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-[0.65rem] tracking-wide text-mist/60">
          © Tocca Amalfi Coast · Private Client Portal
        </p>
      </div>
    </div>
  )
}
