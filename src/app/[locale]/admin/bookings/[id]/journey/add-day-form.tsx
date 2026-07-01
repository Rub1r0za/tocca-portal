'use client'

import { useActionState, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { createJourneyDay } from '../../../actions'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

export function AddDayForm({
  bookingId,
  locale,
  nextDayNumber,
}: {
  bookingId: string
  locale: string
  nextDayNumber: number
}) {
  const bound = createJourneyDay.bind(null, bookingId, locale)
  const [state, action, pending] = useActionState(bound, null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleAction(formData: FormData) {
    await action(formData)
    formRef.current?.reset()
  }

  return (
    <form ref={formRef} action={handleAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Número de día *</label>
          <input
            name="day_number"
            type="number"
            min="1"
            defaultValue={nextDayNumber}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Fecha</label>
          <input name="day_date" type="date" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lugar / Localización</label>
          <input name="location" type="text" placeholder="Positano" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Título (inglés) *</label>
          <input
            name="title_en"
            type="text"
            required
            placeholder="Arrival in Positano"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Título (español)</label>
          <input name="title_es" type="text" placeholder="Llegada a Positano" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Descripción (inglés)</label>
          <textarea
            name="description_en"
            rows={3}
            placeholder="A warm welcome awaits as you arrive…"
            className={inputClass}
            style={{ resize: 'vertical' }}
          />
        </div>
        <div>
          <label className={labelClass}>Descripción (español)</label>
          <textarea
            name="description_es"
            rows={3}
            placeholder="Una cálida bienvenida te espera…"
            className={inputClass}
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? 'Guardando…' : 'Añadir día'}
      </button>
    </form>
  )
}
