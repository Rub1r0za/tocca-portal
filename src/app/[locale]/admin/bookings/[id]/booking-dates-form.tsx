'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { updateBookingDates } from '../../actions'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

export function BookingDatesForm({
  bookingId,
  locale,
  startDate,
  endDate,
}: {
  bookingId: string
  locale: string
  startDate: string
  endDate: string
}) {
  const bound = updateBookingDates.bind(null, bookingId, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="start_date" className={labelClass}>Inicio</label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={startDate}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="end_date" className={labelClass}>Fin</label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={endDate}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          Guardar fechas
        </button>
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      </div>
    </form>
  )
}
