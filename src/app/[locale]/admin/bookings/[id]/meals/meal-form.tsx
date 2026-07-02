'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { saveMeal } from '../../../actions'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

export const COURSES = [
  { value: 'starter', label: 'Entrante' },
  { value: 'main', label: 'Principal' },
  { value: 'dessert', label: 'Postre' },
] as const

export type Meal = {
  id: string
  journey_day_id: string
  course: string
  name: Record<string, string>
  description: Record<string, string>
  allergens: string | null
  image_url: string | null
}

export function MealForm({
  meal,
  journeyDayId,
  bookingId,
  locale,
  onClose,
}: {
  meal?: Meal
  journeyDayId: string
  bookingId: string
  locale: string
  onClose?: () => void
}) {
  const bound = saveMeal.bind(null, meal?.id ?? null, journeyDayId, bookingId, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Plato</label>
          <select name="course" defaultValue={meal?.course ?? 'main'} className={inputClass}>
            {COURSES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Alérgenos</label>
          <input name="allergens" type="text" defaultValue={meal?.allergens ?? ''} placeholder="gluten, lactosa" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Imagen (URL)</label>
          <input name="image_url" type="url" defaultValue={meal?.image_url ?? ''} placeholder="https://…" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre EN *</label>
          <input name="name_en" type="text" required defaultValue={meal?.name?.en ?? ''} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nombre ES</label>
          <input name="name_es" type="text" defaultValue={meal?.name?.es ?? ''} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Descripción EN</label>
          <textarea name="description_en" rows={2} defaultValue={meal?.description?.en ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className={labelClass}>Descripción ES</label>
          <textarea name="description_es" rows={2} defaultValue={meal?.description?.es ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {meal ? 'Guardar' : 'Añadir plato'}
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
