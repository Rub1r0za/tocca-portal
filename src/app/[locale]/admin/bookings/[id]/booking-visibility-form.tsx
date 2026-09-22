'use client'

import { useActionState, useState } from 'react'
import { updateBookingVisibility } from '../../actions'

export function BookingVisibilityForm({ bookingId, locale, wellness, activities }: {
  bookingId: string; locale: string; wellness: boolean; activities: boolean
}) {
  const [state, action, pending] = useActionState(updateBookingVisibility.bind(null, bookingId, locale), null)
  const [wellnessVisible, setWellnessVisible] = useState(wellness)
  const [activitiesVisible, setActivitiesVisible] = useState(activities)
  return <form id="visibilidad" action={action} className="space-y-3 rounded-2xl border border-hairline bg-white p-5">
    <h2 className="font-medium">Visibilidad del portal de este usuario</h2>
    <label className="flex items-center gap-2"><input type="checkbox" name="wellness_enabled" checked={wellnessVisible} onChange={event => setWellnessVisible(event.target.checked)} disabled={pending} />Wellness (bienestar)</label>
    <label className="flex items-center gap-2"><input type="checkbox" name="activities_enabled" checked={activitiesVisible} onChange={event => setActivitiesVisible(event.target.checked)} disabled={pending} />Actividades libres (día libre)</label>
    <p className="text-xs text-mist">Desmarca una sección para ocultarla en el portal de esta reserva.</p>
    <button disabled={pending} className="rounded-xl bg-[#4A9A92] px-4 py-2 text-sm text-white disabled:opacity-60">{pending ? 'Guardando…' : 'Guardar visibilidad'}</button>
    {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    {state?.success && <p role="status" className="text-sm text-teal-700">Visibilidad guardada.</p>}
  </form>
}
