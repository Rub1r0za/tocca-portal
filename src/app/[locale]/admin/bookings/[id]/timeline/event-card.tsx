'use client'

import { useState } from 'react'
import { Pencil, Trash2, ChevronUp, Plane, CarFront, Sparkles, Hotel, UtensilsCrossed, Umbrella } from 'lucide-react'
import { deleteTimelineEvent } from '../../../actions'
import { EventForm, EVENT_TYPES, type TimelineEvent } from './event-form'

const TYPE_ICON: Record<string, typeof Plane> = {
  flight: Plane,
  transfer: CarFront,
  experience: Sparkles,
  accommodation: Hotel,
  meal: UtensilsCrossed,
  leisure: Umbrella,
}

export function EventCard({
  event,
  bookingId,
  locale,
}: {
  event: TimelineEvent
  bookingId: string
  locale: string
}) {
  const [editing, setEditing] = useState(false)
  const deleteAction = deleteTimelineEvent.bind(null, event.id, bookingId, locale)

  const titleEn = event.title?.en || event.title?.es || 'Sin título'
  const titleEs = event.title?.es || ''
  const typeLabel = EVENT_TYPES.find((t) => t.value === event.type)?.label ?? event.type
  const Icon = TYPE_ICON[event.type] ?? Sparkles

  return (
    <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(74,154,146,0.3)] bg-[#4A9A92]/10 text-[#4A9A92]">
          <Icon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-base font-medium text-[#3E2D23]" style={{ fontFamily: 'var(--font-display)' }}>
            {titleEn}
          </p>
          {titleEs && titleEs !== titleEn && <p className="text-sm text-[#7A7168]">{titleEs}</p>}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#7A7168]">
            <span>{typeLabel}</span>
            {event.event_date && <span>{event.event_date}</span>}
            {event.event_time && <span>{event.event_time}</span>}
            {event.location && <span>📍 {event.location}</span>}
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
                if (!confirm(`¿Eliminar "${titleEn}"?`)) e.preventDefault()
              }}
            >
              <Trash2 className="size-4" />
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <div className="mt-4 border-t border-[rgba(62,45,35,0.08)] pt-4">
          <EventForm event={event} bookingId={bookingId} locale={locale} onClose={() => setEditing(false)} />
        </div>
      )}
    </div>
  )
}
