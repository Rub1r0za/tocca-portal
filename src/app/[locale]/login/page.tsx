'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Mail, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'

const emailSchema = z.string().email()

export default function LoginPage() {
  const t = useTranslations('login')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) return

    setStatus('sending')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    setStatus(error ? 'error' : 'sent')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-night px-5">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs tracking-[0.3em] text-azure uppercase">Tocca</p>
          <h1 className="text-4xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            Amalfi Coast
          </h1>
          <div className="mx-auto mt-3 h-px w-16 bg-gold/60" />
        </div>

        {status === 'sent' ? (
          <div className="space-y-3 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-azure/15">
              <Mail className="size-6 text-azure" aria-hidden />
            </div>
            <h2 className="text-xl text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              {t('checkEmail')}
            </h2>
            <p className="text-sm text-mist">{t('checkEmailDesc', { email })}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="mb-2 text-center text-sm text-mist">{t('subtitle')}</p>
            <div>
              <label htmlFor="email" className="mb-2 block text-xs tracking-widest text-mist uppercase">
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
                className="w-full rounded-xl border border-input bg-panel-2 px-4 py-3 text-sm text-foreground placeholder:text-mist/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </div>

            {status === 'error' && <p className="text-xs text-destructive">{t('error')}</p>}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-night"
            >
              {status === 'sending' && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {status === 'sending' ? t('sending') : t('submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
