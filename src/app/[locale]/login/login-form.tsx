'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Mail, Loader2, Send, LogIn, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'

const emailSchema = z.string().email()

type Mode = 'signin' | 'signup' | 'magic'
type Status = 'idle' | 'busy' | 'sent' | 'confirm-sent' | 'reset-sent'

export default function LoginForm() {
  const t = useTranslations('login')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') ?? ''
  const destination = nextPath || `/${locale}/dashboard`
  // Email links must land on /auth/callback so the server can exchange the
  // auth code for a session before hitting a protected route.
  const callbackUrl = (next: string) =>
    `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState(searchParams.get('error') === 'auth' ? t('linkExpired') : '')

  /**
   * Traduce el error de Supabase a algo accionable. Antes todo lo que no fuera
   * "Invalid login credentials" caía en el genérico "algo salió mal", que
   * escondía la causa real (típicamente la cuenta sin confirmar).
   */
  function messageFor(err: { code?: string; message: string }): string {
    switch (err.code) {
      case 'invalid_credentials':
        return t('invalidCredentials')
      case 'email_not_confirmed':
        return t('emailNotConfirmed')
      case 'over_email_send_rate_limit':
      case 'over_request_rate_limit':
        return t('rateLimited')
      case 'user_already_exists':
        return t('userExists')
      case 'weak_password':
        return t('passwordTooShort')
      case 'email_address_invalid':
        return t('invalidEmail')
      default:
        // Sin código conocido: al menos dejarlo en consola para poder depurar.
        console.error('[auth]', err.code ?? 'sin-código', err.message)
        return err.message.includes('Invalid login credentials')
          ? t('invalidCredentials')
          : t('error')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!emailSchema.safeParse(email).success) return

    const supabase = createClient()

    if (mode === 'magic') {
      setStatus('busy')
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callbackUrl(destination) },
      })
      if (err) {
        setError(messageFor(err))
        setStatus('idle')
      } else {
        setStatus('sent')
      }
      return
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'))
      return
    }
    setStatus('busy')

    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError(messageFor(err))
        setStatus('idle')
        return
      }
      // Full navigation so the middleware picks up the fresh session cookies
      location.assign(destination)
      return
    }

    // signup
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: callbackUrl(destination) },
    })
    if (err) {
      setError(messageFor(err))
      setStatus('idle')
      return
    }
    // Con la confirmación por correo activada, Supabase no delata si un correo ya
    // está registrado (evita que alguien descubra quién tiene cuenta): responde
    // 200 con un usuario sin identidades y no envía nada. Sin esto la pantalla
    // pide "revisa tu correo" por un mensaje que nunca va a salir.
    if (data.user && data.user.identities?.length === 0) {
      setError(t('userExists'))
      setStatus('idle')
      return
    }
    // Aviso al equipo de que hay una cuenta nueva. El servidor lo verifica
    // contra Supabase; aquí no se espera ni se corta el alta si falla.
    void fetch('/api/notify/new-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: data.user?.id }),
    }).catch(() => {})

    if (data.session) {
      // Email confirmation disabled → signed in immediately
      location.assign(destination)
      return
    }
    // Email confirmation required
    setStatus('confirm-sent')
  }

  async function handleForgotPassword() {
    setError('')
    if (!emailSchema.safeParse(email).success) {
      setError(t('error'))
      return
    }
    setStatus('busy')
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl(`/${locale}/account/password`),
    })
    if (err) {
      setError(messageFor(err))
      setStatus('idle')
    } else {
      setStatus('reset-sent')
    }
  }

  const isSent = status === 'sent' || status === 'confirm-sent' || status === 'reset-sent'
  const sentDesc =
    status === 'sent'
      ? t('checkEmailDesc', { email })
      : status === 'confirm-sent'
        ? t('confirmEmailSent', { email })
        : t('resetSent', { email })

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
        {isSent ? (
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
            <p className="mt-2.5 text-sm leading-relaxed text-mist">{sentDesc}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-hairline bg-white px-6 py-8 shadow-[0_4px_24px_rgba(62,45,35,0.10)] sm:px-8">
            <p className="mb-6 text-center text-sm leading-relaxed text-mist">
              {mode === 'signup' ? t('signupSubtitle') : t('subtitle')}
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

              {mode !== 'magic' && (
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-[0.7rem] font-semibold tracking-[0.2em] text-mist uppercase"
                  >
                    {t('passwordLabel')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className="w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-3 text-sm text-foreground placeholder:text-mist/50 focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure/20"
                  />
                </div>
              )}

              {error && <p className="text-xs text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={status === 'busy'}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-azure/50"
                style={{ background: 'linear-gradient(135deg, #23374D 0%, #1a2d3f 100%)' }}
              >
                {status === 'busy' ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : mode === 'magic' ? (
                  <Send className="size-4" aria-hidden />
                ) : mode === 'signup' ? (
                  <UserPlus className="size-4" aria-hidden />
                ) : (
                  <LogIn className="size-4" aria-hidden />
                )}
                {status === 'busy'
                  ? mode === 'signup'
                    ? t('creatingAccount')
                    : mode === 'magic'
                      ? t('sending')
                      : t('signingIn')
                  : mode === 'signup'
                    ? t('createAccount')
                    : mode === 'magic'
                      ? t('submit')
                      : t('signIn')}
              </button>
            </form>

            {/* Secondary actions */}
            <div className="mt-5 space-y-2 border-t border-hairline pt-4 text-center text-xs">
              {mode === 'signin' && (
                <>
                  <p className="text-mist">
                    {t('noAccount')}{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('signup'); setError('') }}
                      className="font-medium text-azure hover:underline"
                    >
                      {t('signUpLink')}
                    </button>
                  </p>
                  <p>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={status === 'busy'}
                      className="text-mist hover:text-foreground hover:underline"
                    >
                      {t('forgotPassword')}
                    </button>
                  </p>
                  <p>
                    <button
                      type="button"
                      onClick={() => { setMode('magic'); setError('') }}
                      className="text-mist hover:text-foreground hover:underline"
                    >
                      {t('magicLinkFallback')}
                    </button>
                  </p>
                </>
              )}
              {mode === 'signup' && (
                <p className="text-mist">
                  {t('haveAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError('') }}
                    className="font-medium text-azure hover:underline"
                  >
                    {t('signInLink')}
                  </button>
                </p>
              )}
              {mode === 'magic' && (
                <p>
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError('') }}
                    className="text-mist hover:text-foreground hover:underline"
                  >
                    {t('backToPassword')}
                  </button>
                </p>
              )}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-[0.65rem] tracking-wide text-mist/60">
          © Tocca Amalfi Coast · Private Client Portal
        </p>
      </div>
    </div>
  )
}
