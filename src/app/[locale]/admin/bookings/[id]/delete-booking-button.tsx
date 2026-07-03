'use client'

import { Trash2 } from 'lucide-react'
import { deleteBooking } from '../../actions'

export function DeleteBookingButton({
  bookingId,
  locale,
}: {
  bookingId: string
  locale: string
}) {
  const bound = deleteBooking.bind(null, bookingId, locale)

  return (
    <form action={bound}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        onClick={(e) => {
          if (
            !confirm(
              '¿Eliminar esta reserva por completo? Se borrarán también sus viajeros, días del itinerario y comidas. Esta acción no se puede deshacer.',
            )
          )
            e.preventDefault()
        }}
      >
        <Trash2 className="size-4" />
        Eliminar reserva
      </button>
    </form>
  )
}
