'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { submitRegistration } from './actions'

const inputClass =
  'w-full rounded-xl border border-input bg-panel-2 px-4 py-3 text-sm text-foreground placeholder:text-mist/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30'
const labelClass = 'mb-2 block text-xs tracking-widest text-mist uppercase'

type Companion = { first_name: string; last_name: string; type: 'adult' | 'child' }

export function RegisterForm() {
  const t = useTranslations('register')
  const locale = useLocale()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [accompanied, setAccompanied] = useState<boolean>(false)
  const [bookingType, setBookingType] = useState<'individual' | 'group'>('individual')
  const [companions, setCompanions] = useState<Companion[]>([])
  const [notes, setNotes] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function updateCompanion(i: number, patch: Partial<Companion>) {
    setCompanions((list) => list.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (fullName.trim().length < 2 || phone.trim().length < 5) {
      setError(t('errorBasics'))
      return
    }
    if (accompanied && companions.some((c) => !c.first_name.trim() || !c.last_name.trim())) {
      setError(t('errorCompanions'))
      return
    }
    if (!accepted) {
      setError(t('errorTerms'))
      return
    }
    startTransition(async () => {
      const result = await submitRegistration(locale, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        booking_type: accompanied ? bookingType : 'individual',
        companions: accompanied ? companions : [],
        accepted_terms: true,
        notes: notes.trim() || undefined,
      })
      if (result?.error === 'exists') setError(t('errorExists'))
      else if (result?.error) setError(t('errorGeneric'))
    })
  }

  const radioCard = (active: boolean) =>
    `flex-1 cursor-pointer rounded-xl border px-4 py-3 text-center text-sm transition-colors ${
      active
        ? 'border-gold/60 bg-gold/10 text-foreground'
        : 'border-hairline bg-panel-2 text-mist hover:border-gold/30'
    }`

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {/* Datos personales */}
      <div className="space-y-4">
        <div>
          <label htmlFor="reg-name" className={labelClass}>{t('fullName')} *</label>
          <input id="reg-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="reg-phone" className={labelClass}>{t('phone')} *</label>
          <input id="reg-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+1 809 000 0000" className={inputClass} />
        </div>
      </div>

      {/* ¿Solo o acompañado? */}
      <div>
        <p className={labelClass}>{t('travelWith')} *</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setAccompanied(false)} className={radioCard(!accompanied)}>
            {t('solo')}
          </button>
          <button type="button" onClick={() => { setAccompanied(true); if (companions.length === 0) setCompanions([{ first_name: '', last_name: '', type: 'adult' }]) }} className={radioCard(accompanied)}>
            {t('accompanied')}
          </button>
        </div>
      </div>

      {accompanied && (
        <>
          {/* Individual o grupal */}
          <div>
            <p className={labelClass}>{t('bookingType')} *</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setBookingType('individual')} className={radioCard(bookingType === 'individual')}>
                {t('individual')}
              </button>
              <button type="button" onClick={() => setBookingType('group')} className={radioCard(bookingType === 'group')}>
                {t('group')}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-mist/80">{t('bookingTypeHint')}</p>
          </div>

          {/* Acompañantes */}
          <div>
            <p className={labelClass}>{t('companions')}</p>
            <div className="space-y-3">
              {companions.map((c, i) => (
                <div key={i} className="rounded-xl border border-hairline bg-panel/50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder={t('firstName')}
                      value={c.first_name}
                      onChange={(e) => updateCompanion(i, { first_name: e.target.value })}
                      className={`${inputClass} min-w-28 flex-1`}
                    />
                    <input
                      type="text"
                      placeholder={t('lastName')}
                      value={c.last_name}
                      onChange={(e) => updateCompanion(i, { last_name: e.target.value })}
                      className={`${inputClass} min-w-28 flex-1`}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      {(['adult', 'child'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateCompanion(i, { type })}
                          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                            c.type === type
                              ? 'border-azure/50 bg-azure/10 text-azure'
                              : 'border-hairline text-mist hover:border-azure/30'
                          }`}
                        >
                          {t(type)}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCompanions((list) => list.filter((_, idx) => idx !== i))}
                      aria-label={t('remove')}
                      className="rounded-lg p-1.5 text-mist transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCompanions((list) => [...list, { first_name: '', last_name: '', type: 'adult' }])}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-azure hover:underline"
            >
              <Plus className="size-4" /> {t('addCompanion')}
            </button>
          </div>
        </>
      )}

      {/* Notas */}
      <div>
        <label htmlFor="reg-notes" className={labelClass}>{t('notes')}</label>
        <textarea id="reg-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('notesPlaceholder')} className={`${inputClass} resize-none`} />
      </div>

      {/* Términos */}
      <label className="flex items-start gap-3 rounded-xl border border-hairline bg-panel/50 p-4 text-sm text-mist">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded border-hairline accent-[#C9A227]"
        />
        <span>
          {t('acceptTerms')}{' '}
          <Link href={`/${locale}/terms`} target="_blank" className="text-gold underline underline-offset-2">
            {t('termsLink')}
          </Link>
        </span>
      </label>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isPending ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
