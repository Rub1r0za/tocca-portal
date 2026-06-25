'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Minus, Plus, Check, Loader2 } from 'lucide-react'
import { requestActivity } from '@/app/[locale]/(portal)/activities/actions'
import { requestWellness } from '@/app/[locale]/(portal)/wellness/actions'

type Props = {
  kind: 'activity' | 'wellness'
  bookingId: string
  targetId: string
  maxGuests?: number
}

const today = () => new Date().toISOString().slice(0, 10)

export function ReservationForm({ kind, bookingId, targetId, maxGuests = 12 }: Props) {
  const t = useTranslations('reservation')
  const [guests, setGuests] = useState(1)
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [dateError, setDateError] = useState(false)
  const [isPending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) {
      setDateError(true)
      return
    }
    setDateError(false)
    startTransition(async () => {
      try {
        const result =
          kind === 'activity'
            ? await requestActivity({
                bookingId,
                activityId: targetId,
                numGuests: guests,
                requestedDate: date,
                notes: notes.trim() || null,
              })
            : await requestWellness({
                bookingId,
                wellnessOptionId: targetId,
                numGuests: guests,
                requestedDate: date,
                notes: notes.trim() || null,
              })
        setStatus(result.ok ? 'sent' : 'error')
      } catch {
        setStatus('error')
      }
    })
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-azure/30 bg-azure/10 px-5 py-6 text-center">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-azure/20">
          <Check className="size-5 text-azure" aria-hidden />
        </div>
        <p
          className="text-lg text-foreground"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          {t('successTitle')}
        </p>
        <p className="mt-1 text-sm text-mist">{t('successBody')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {/* Guests */}
      <div>
        <label className="mb-2 block text-xs tracking-widest text-mist uppercase">
          {t('guests')}
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            disabled={guests <= 1}
            aria-label={t('decrease')}
            className="flex size-10 items-center justify-center rounded-full border border-hairline text-foreground transition-colors hover:border-gold/40 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span
            className="min-w-8 text-center text-2xl text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
            aria-live="polite"
          >
            {guests}
          </span>
          <button
            type="button"
            onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
            disabled={guests >= maxGuests}
            aria-label={t('increase')}
            className="flex size-10 items-center justify-center rounded-full border border-hairline text-foreground transition-colors hover:border-gold/40 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="res-date" className="mb-2 block text-xs tracking-widest text-mist uppercase">
          {t('date')}
        </label>
        <input
          id="res-date"
          type="date"
          required
          min={today()}
          value={date}
          onChange={(e) => {
            setDate(e.target.value)
            setDateError(false)
          }}
          aria-invalid={dateError}
          aria-describedby={dateError ? 'res-date-error' : undefined}
          className="w-full rounded-xl border border-input bg-panel-2 px-4 py-3 text-sm text-foreground [color-scheme:dark] focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
        {dateError && (
          <p id="res-date-error" className="mt-1.5 text-xs text-destructive">
            {t('dateRequired')}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="res-notes" className="mb-2 block text-xs tracking-widest text-mist uppercase">
          {t('notes')}
        </label>
        <textarea
          id="res-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('notesPlaceholder')}
          className="w-full resize-none rounded-xl border border-input bg-panel-2 px-4 py-3 text-sm text-foreground placeholder:text-mist/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      {status === 'error' && <p className="text-xs text-destructive">{t('errorTitle')}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-night"
      >
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isPending ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
