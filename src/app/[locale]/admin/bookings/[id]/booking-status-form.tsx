'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { updateBookingStatus } from '../../actions'

export function BookingStatusForm({
  bookingId,
  locale,
  currentStatus,
}: {
  bookingId: string
  locale: string
  currentStatus: string
}) {
  const bound = updateBookingStatus.bind(null, bookingId, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="flex-1">
        <label htmlFor="status" className="mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase">
          Estado
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20"
        >
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobada</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-3.5 animate-spin" />}
        Actualizar
      </button>
      {state?.error && (
        <p className="w-full text-xs text-red-600">{state.error}</p>
      )}
    </form>
  )
}
