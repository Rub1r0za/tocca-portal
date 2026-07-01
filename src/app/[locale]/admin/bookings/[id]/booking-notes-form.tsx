'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { updateBookingNotes } from '../../actions'

export function BookingNotesForm({
  bookingId,
  locale,
  notes,
}: {
  bookingId: string
  locale: string
  notes: string
}) {
  const bound = updateBookingNotes.bind(null, bookingId, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action} className="space-y-3">
      <textarea
        name="notes"
        rows={4}
        defaultValue={notes}
        placeholder="Notas internas sobre la reserva, preferencias, detalles de vuelos…"
        className="w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20"
        style={{ resize: 'vertical' }}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          Guardar notas
        </button>
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      </div>
    </form>
  )
}
