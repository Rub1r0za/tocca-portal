'use client'

import { useState, useActionState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { updateJourneyDay, deleteJourneyDay } from '../../../actions'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

type Day = {
  id: string
  booking_id: string
  day_number: number
  title: Record<string, string>
  description: Record<string, string>
  location: string | null
  day_date: string | null
}

function EditDayForm({
  day,
  bookingId,
  locale,
  onClose,
}: {
  day: Day
  bookingId: string
  locale: string
  onClose: () => void
}) {
  const bound = updateJourneyDay.bind(null, day.id, bookingId, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action} className="mt-4 space-y-4 border-t border-[rgba(62,45,35,0.08)] pt-4">
      {state?.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Número de día</label>
          <input name="day_number" type="number" min="1" defaultValue={day.day_number} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Fecha</label>
          <input name="day_date" type="date" defaultValue={day.day_date ?? ''} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Localización</label>
          <input name="location" type="text" defaultValue={day.location ?? ''} placeholder="Positano" className={inputClass} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Título EN</label>
          <input name="title_en" type="text" required defaultValue={day.title?.en ?? ''} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Título ES</label>
          <input name="title_es" type="text" defaultValue={day.title?.es ?? ''} className={inputClass} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Descripción EN</label>
          <textarea name="description_en" rows={3} defaultValue={day.description?.en ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className={labelClass}>Descripción ES</label>
          <textarea name="description_es" rows={3} defaultValue={day.description?.es ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          Guardar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-[rgba(62,45,35,0.18)] px-4 py-2 text-sm text-[#7A7168] transition-colors hover:border-[rgba(62,45,35,0.3)] hover:text-[#3E2D23]"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export function DayCard({
  day,
  bookingId,
  locale,
  startDate,
}: {
  day: Day
  bookingId: string
  locale: string
  startDate?: string | null
}) {
  const [editing, setEditing] = useState(false)
  const deleteAction = deleteJourneyDay.bind(null, day.id, bookingId, locale)

  const titleEn = day.title?.en || day.title?.es || `Day ${day.day_number}`
  const titleEs = day.title?.es || ''

  return (
    <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
      <div className="flex items-start gap-3">
        {/* Day number badge */}
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(74,154,146,0.3)] bg-[#4A9A92]/10 text-sm font-medium text-[#4A9A92]"
        >
          {day.day_number}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-base font-medium text-[#3E2D23]" style={{ fontFamily: 'var(--font-display)' }}>
            {titleEn}
          </p>
          {titleEs && titleEs !== titleEn && (
            <p className="text-sm text-[#7A7168]">{titleEs}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#7A7168]">
            {day.day_date && <span>{day.day_date}</span>}
            {day.location && <span>📍 {day.location}</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            title={editing ? 'Cerrar' : 'Editar'}
            className="rounded-lg p-1.5 text-[#7A7168] transition-colors hover:bg-[#F4F1EB] hover:text-[#3E2D23]"
          >
            {editing ? <ChevronUp className="size-4" /> : <Pencil className="size-4" />}
          </button>
          <form action={deleteAction}>
            <button
              type="submit"
              title="Eliminar"
              className="rounded-lg p-1.5 text-[#7A7168] transition-colors hover:bg-red-50 hover:text-red-600"
              onClick={(e) => {
                if (!confirm(`¿Eliminar Día ${day.day_number}?`)) e.preventDefault()
              }}
            >
              <Trash2 className="size-4" />
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <EditDayForm day={day} bookingId={bookingId} locale={locale} onClose={() => setEditing(false)} />
      )}
    </div>
  )
}
