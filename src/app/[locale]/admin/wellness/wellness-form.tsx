'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { saveWellnessOption } from '../actions'
import { ImageField } from '@/components/admin/image-field'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

export type WellnessOption = {
  id: string
  name: Record<string, string>
  description: Record<string, string>
  duration: Record<string, string>
  price: number | null
  active: boolean
  image_url: string | null
  trip_number: 1 | 2
}

export function WellnessForm({
  option,
  locale,
  onClose,
}: {
  option?: WellnessOption
  locale: string
  onClose?: () => void
}) {
  const bound = saveWellnessOption.bind(null, option?.id ?? null, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div>
        <label className={labelClass}>Disponible en *</label>
        <select name="trip_number" defaultValue={String(option?.trip_number ?? 1)} className={`${inputClass} max-w-sm`}>
          <option value="1">Viaje uno · Signature</option>
          <option value="2">Viaje dos · Yoga Retreat</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre EN *</label>
          <input name="name_en" type="text" required defaultValue={option?.name?.en ?? ''} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nombre ES</label>
          <input name="name_es" type="text" defaultValue={option?.name?.es ?? ''} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Descripción EN</label>
          <textarea name="description_en" rows={3} defaultValue={option?.description?.en ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className={labelClass}>Descripción ES</label>
          <textarea name="description_es" rows={3} defaultValue={option?.description?.es ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className={labelClass}>Duración EN</label>
          <input name="duration_en" type="text" defaultValue={option?.duration?.en ?? ''} placeholder="60 min" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Duración ES</label>
          <input name="duration_es" type="text" defaultValue={option?.duration?.es ?? ''} placeholder="60 min" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Precio (€)</label>
          <input name="price" type="number" min="0" step="0.01" defaultValue={option?.price ?? ''} placeholder="A consultar" className={inputClass} />
        </div>
        <ImageField defaultValue={option?.image_url} />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {option ? 'Guardar' : 'Crear opción'}
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
