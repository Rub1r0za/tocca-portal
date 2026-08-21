'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Loader2 } from 'lucide-react'
import { requestActivity } from '@/app/[locale]/(portal)/activities/actions'
import { requestWellness } from '@/app/[locale]/(portal)/wellness/actions'
import type { Traveler } from '@/lib/types'

type Props = {
  kind: 'activity' | 'wellness'
  bookingId: string
  targetId: string
  travelers: Traveler[]
  /** Aforo de la actividad; `null` = sin límite propio. */
  capacity?: number | null
}

const today = () => new Date().toISOString().slice(0, 10)

export function ReservationForm({ kind, bookingId, targetId, travelers, capacity }: Props) {
  const t = useTranslations('reservation')
  // Con un solo viajero no hay nada que elegir: viene marcado de entrada.
  const [selected, setSelected] = useState<string[]>(
    travelers.length === 1 ? [travelers[0].id] : [],
  )
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  // Motivo técnico del rechazo. Se enseña en pequeño: sin esto un fallo de
  // servidor es indistinguible de uno de red y no hay nada que reportar.
  const [reason, setReason] = useState('')
  const [dateError, setDateError] = useState(false)
  const [peopleError, setPeopleError] = useState(false)
  const [isPending, startTransition] = useTransition()

  const atCapacity = capacity != null && selected.length >= capacity

  function toggle(id: string) {
    setPeopleError(false)
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : atCapacity
          ? prev
          : [...prev, id],
    )
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const missingPeople = selected.length === 0
    const missingDate = !date
    setPeopleError(missingPeople)
    setDateError(missingDate)
    if (missingPeople || missingDate) return

    startTransition(async () => {
      try {
        const result =
          kind === 'activity'
            ? await requestActivity({
                bookingId,
                activityId: targetId,
                travelerIds: selected,
                requestedDate: date,
                notes: notes.trim() || null,
              })
            : await requestWellness({
                bookingId,
                wellnessOptionId: targetId,
                travelerIds: selected,
                requestedDate: date,
                notes: notes.trim() || null,
              })
        setStatus(result.ok ? 'sent' : 'error')
        if (!result.ok) setReason(result.error ?? '')
      } catch (err) {
        setStatus('error')
        setReason(err instanceof Error ? err.message : '')
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
      {/* Quién va */}
      <fieldset>
        <legend className="mb-2 block text-xs tracking-widest text-mist uppercase">
          {t('who')}
        </legend>
        {travelers.length === 0 ? (
          <p className="text-sm text-mist">{t('noTravelers')}</p>
        ) : (
          <div className="space-y-2">
            {travelers.map((traveler) => {
              const checked = selected.includes(traveler.id)
              return (
                <label
                  key={traveler.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    checked ? 'border-gold/50 bg-gold/10' : 'border-hairline hover:border-gold/30'
                  } ${!checked && atCapacity ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && atCapacity}
                    onChange={() => toggle(traveler.id)}
                    className="size-4 accent-gold"
                  />
                  <span className="text-sm text-foreground">
                    {traveler.first_name} {traveler.last_name}
                  </span>
                </label>
              )
            })}
          </div>
        )}
        {peopleError && (
          <p className="mt-1.5 text-xs text-destructive">{t('whoRequired')}</p>
        )}
        {atCapacity && (
          <p className="mt-1.5 text-xs text-mist/80">{t('capacityReached', { count: capacity! })}</p>
        )}
      </fieldset>

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

      {status === 'error' && (
        <div>
          <p className="text-xs text-destructive">{t('errorTitle')}</p>
          {reason && <p className="mt-1 text-[0.65rem] text-mist/70">{reason}</p>}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || travelers.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-night"
      >
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isPending ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
