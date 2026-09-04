'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { saveActivity } from '../actions'
import { ImageField } from '@/components/admin/image-field'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

export type Activity = {
  id: string
  sort_order: number
  name: Record<string, string>
  description: Record<string, string>
  overview: Record<string, string>
  price: number
  capacity: number | null
  active: boolean
  image_url: string | null
  duration: Record<string, string>
  time_label: Record<string, string>
  included: Array<Record<string, string>>
  requirements: Array<Record<string, string>>
  cancellation_policy: Record<string, string>
  trip_number: 1 | 2
}

function linesOf(items: Array<Record<string, string>> | null | undefined, lang: string) {
  return (items ?? []).map((i) => i?.[lang] ?? '').join('\n')
}

export function ActivityForm({
  activity,
  locale,
  onClose,
}: {
  activity?: Activity
  locale: string
  onClose?: () => void
}) {
  const bound = saveActivity.bind(null, activity?.id ?? null, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div>
        <label className={labelClass}>Disponible en *</label>
        <select name="trip_number" defaultValue={String(activity?.trip_number ?? 1)} className={`${inputClass} max-w-sm`}>
          <option value="1">Viaje uno · Signature</option>
          <option value="2">Viaje dos · Yoga Retreat</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre EN *</label>
          <input name="name_en" type="text" required defaultValue={activity?.name?.en ?? ''} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nombre ES</label>
          <input name="name_es" type="text" defaultValue={activity?.name?.es ?? ''} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Descripción corta EN</label>
          <textarea name="description_en" rows={2} defaultValue={activity?.description?.en ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className={labelClass}>Descripción corta ES</label>
          <textarea name="description_es" rows={2} defaultValue={activity?.description?.es ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Precio (€) *</label>
          <input name="price" type="number" min="0" step="0.01" required defaultValue={activity?.price ?? 0} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Capacidad</label>
          <input name="capacity" type="number" min="1" defaultValue={activity?.capacity ?? ''} placeholder="Sin límite" className={inputClass} />
        </div>
        <ImageField defaultValue={activity?.image_url} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className={labelClass}>Duración EN</label>
          <input name="duration_en" type="text" defaultValue={activity?.duration?.en ?? ''} placeholder="3 hours" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Duración ES</label>
          <input name="duration_es" type="text" defaultValue={activity?.duration?.es ?? ''} placeholder="3 horas" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Horario EN</label>
          <input name="time_label_en" type="text" defaultValue={activity?.time_label?.en ?? ''} placeholder="Morning" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Horario ES</label>
          <input name="time_label_es" type="text" defaultValue={activity?.time_label?.es ?? ''} placeholder="Mañana" className={inputClass} />
        </div>
      </div>

      <details className="rounded-xl border border-[rgba(62,45,35,0.12)] bg-[#FAFAF8]/60 p-4" open={!!activity}>
        <summary className="cursor-pointer text-sm font-medium text-[#3E2D23]">
          Detalles para la ficha del cliente
        </summary>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Overview EN</label>
              <textarea name="overview_en" rows={3} defaultValue={activity?.overview?.en ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className={labelClass}>Overview ES</label>
              <textarea name="overview_es" rows={3} defaultValue={activity?.overview?.es ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Incluye EN (una por línea)</label>
              <textarea name="included_en" rows={3} defaultValue={linesOf(activity?.included, 'en')} className={inputClass} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className={labelClass}>Incluye ES (una por línea)</label>
              <textarea name="included_es" rows={3} defaultValue={linesOf(activity?.included, 'es')} className={inputClass} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Requisitos EN (uno por línea)</label>
              <textarea name="requirements_en" rows={3} defaultValue={linesOf(activity?.requirements, 'en')} className={inputClass} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className={labelClass}>Requisitos ES (uno por línea)</label>
              <textarea name="requirements_es" rows={3} defaultValue={linesOf(activity?.requirements, 'es')} className={inputClass} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Política de cancelación EN</label>
              <textarea name="cancellation_en" rows={2} defaultValue={activity?.cancellation_policy?.en ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className={labelClass}>Política de cancelación ES</label>
              <textarea name="cancellation_es" rows={2} defaultValue={activity?.cancellation_policy?.es ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>
      </details>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {activity ? 'Guardar' : 'Crear actividad'}
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
