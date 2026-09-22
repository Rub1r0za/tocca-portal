'use client'

import { useActionState } from 'react'
import { updateBookingVisibility } from '../../actions'

export function BookingVisibilityForm({ bookingId, locale, wellness, activities }: {
  bookingId: string; locale: string; wellness: boolean; activities: boolean
}) {
  const [state, action, pending] = useActionState(updateBookingVisibility.bind(null, bookingId, locale), null)
  return <form action={action} className="space-y-3 rounded-2xl border border-hairline bg-white p-5">
    <h2 className="font-medium">Secciones visibles para este usuario</h2>
    <label className="flex items-center gap-2"><input type="checkbox" name="wellness_enabled" defaultChecked={wellness} />Bienestar</label>
    <label className="flex items-center gap-2"><input type="checkbox" name="activities_enabled" defaultChecked={activities} />Día Libre</label>
    <p className="text-xs text-mist">Desmarca una sección para ocultarla en el portal de esta reserva.</p>
    <button disabled={pending} className="rounded-xl bg-[#4A9A92] px-4 py-2 text-sm text-white disabled:opacity-60">{pending ? 'Guardando…' : 'Guardar visibilidad'}</button>
    {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    {state?.success && <p role="status" className="text-sm text-teal-700">Visibilidad guardada.</p>}
  </form>
}
