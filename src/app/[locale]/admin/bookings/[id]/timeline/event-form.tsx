'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { saveTimelineEvent } from '../../../actions'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

export const EVENT_TYPES = [
  { value: 'flight', label: 'Vuelo' },
  { value: 'transfer', label: 'Traslado' },
  { value: 'experience', label: 'Experiencia' },
  { value: 'accommodation', label: 'Alojamiento' },
  { value: 'meal', label: 'Comida' },
  { value: 'leisure', label: 'Tiempo libre' },
] as const

export type TimelineEvent = {
  id: string
  sort_order: number
  event_date: string | null
  event_time: string | null
  type: string
  title: Record<string, string>
  description: Record<string, string>
  location: string | null
}

export function EventForm({
  event,
  bookingId,
  locale,
  nextSortOrder,
  onClose,
}: {
  event?: TimelineEvent
  bookingId: string
  locale: string
  nextSortOrder?: number
  onClose?: () => void
}) {
  const bound = saveTimelineEvent.bind(null, event?.id ?? null, bookingId, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className={labelClass}>Orden</label>
          <input name="sort_order" type="number" defaultValue={event?.sort_order ?? nextSortOrder ?? 0} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Tipo</label>
          <select name="type" defaultValue={event?.type ?? 'experience'} className={inputClass}>
            {EVENT_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Fecha</label>
          <input name="event_date" type="date" defaultValue={event?.event_date ?? ''} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Hora</label>
          <input name="event_time" type="text" defaultValue={event?.event_time ?? ''} placeholder="14:30" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Título EN *</label>
          <input name="title_en" type="text" required defaultValue={event?.title?.en ?? ''} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Título ES</label>
          <input name="title_es" type="text" defaultValue={event?.title?.es ?? ''} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Descripción EN</label>
          <textarea name="description_en" rows={2} defaultValue={event?.description?.en ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className={labelClass}>Descripción ES</label>
          <textarea name="description_es" rows={2} defaultValue={event?.description?.es ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Localización</label>
        <input name="location" type="text" defaultValue={event?.location ?? ''} placeholder="Aeropuerto de Nápoles" className={inputClass} />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {event ? 'Guardar' : 'Añadir evento'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[rgba(62,45,35,0.18)] px-4 py-2 text-sm text-[#7A7168] transition-colors hover:border-[rgba(62,45,35,0.3)] hover:text-[#3E2D23]"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
