'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
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
    <div className="min-h-screen bg-chalk flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <p className="text-xs tracking-[0.25em] text-[#2F7E72] uppercase mb-2">Tocca</p>
          <h1
            className="text-4xl text-ink"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Amalfi Coast
          </h1>
          <div className="mt-3 mx-auto h-px w-16 bg-sand" />
        </div>

        {status === 'sent' ? (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#2F7E72]/10 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-[#2F7E72]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
              {t('checkEmail')}
            </h2>
            <p className="text-sm text-[#6b7280]">
              {t('checkEmailDesc', { email })}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-sm text-[#6b7280] text-center mb-6">{t('subtitle')}</p>
              <label htmlFor="email" className="block text-xs tracking-widest text-[#6b7280] uppercase mb-2">
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
                className="w-full border border-sand rounded px-4 py-3 text-sm bg-white text-ink placeholder:text-sand focus:outline-none focus:ring-2 focus:ring-[#11487E]/30 focus:border-[#11487E] transition-colors"
              />
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-600">{t('error')}</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-[#11487E] text-white rounded px-4 py-3 text-sm tracking-wide hover:bg-[#0d3a66] focus:outline-none focus:ring-2 focus:ring-[#11487E]/40 focus:ring-offset-2 transition-colors disabled:opacity-60"
            >
              {status === 'sending' ? t('sending') : t('submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
