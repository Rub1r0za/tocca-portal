'use client'

import { useActionState } from 'react'
import { Loader2, Layers, PlusCircle } from 'lucide-react'
import { addTemplateDayToBooking, addFullJourneyToBooking } from '../../../actions'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'

type TemplateOption = {
  id: string
  sort_order: number
  title: Record<string, string>
  is_free_day: boolean
  mealsCount: number
}

export function AddFromTemplate({
  bookingId,
  locale,
  templates,
}: {
  bookingId: string
  locale: string
  templates: TemplateOption[]
}) {
  const boundOne = addTemplateDayToBooking.bind(null, bookingId, locale)
  const [oneState, oneAction, onePending] = useActionState(boundOne, null)

  const boundAll = addFullJourneyToBooking.bind(null, bookingId, locale)
  const [allState, allAction, allPending] = useActionState(boundAll, null)

  if (templates.length === 0) return null

  return (
    <div className="rounded-2xl border border-[rgba(74,154,146,0.35)] bg-[#4A9A92]/5 p-5">
      <h2 className="mb-1 flex items-center gap-2 text-base font-medium text-[#3E2D23]">
        <Layers className="size-4 text-[#4A9A92]" />
        Añadir desde plantilla
      </h2>
      <p className="mb-4 text-xs text-[#7A7168]">
        Copia días de la biblioteca a esta reserva. Después puedes editarlos solo para este grupo
        (los menús con selección se copian automáticamente).
      </p>

      {(oneState?.error || allState?.error) && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {oneState?.error || allState?.error}
        </p>
      )}

      <form action={oneAction} className="flex flex-wrap items-center gap-2">
        <select name="template_id" required className={`${inputClass} max-w-md flex-1`} defaultValue="">
          <option value="" disabled>
            Elige un día…
          </option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.sort_order}. {t.title?.es || t.title?.en || 'Sin título'}
              {t.is_free_day ? ' · día libre' : ''}
              {t.mealsCount > 0 ? ' · menú' : ''}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={onePending}
          className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {onePending ? <Loader2 className="size-4 animate-spin" /> : <PlusCircle className="size-4" />}
          Añadir día
        </button>
      </form>

      <form action={allAction} className="mt-3">
        <button
          type="submit"
          disabled={allPending}
          onClick={(e) => {
            if (!confirm(`¿Añadir los ${templates.length} días del Signature Journey a esta reserva?`)) e.preventDefault()
          }}
          className="flex items-center gap-1.5 rounded-xl border border-[#4A9A92]/40 bg-white px-4 py-2.5 text-sm font-medium text-[#4A9A92] transition-colors hover:bg-[#4A9A92]/10 disabled:opacity-60"
        >
          {allPending && <Loader2 className="size-4 animate-spin" />}
          Añadir Signature Journey completo ({templates.length} días)
        </button>
      </form>
    </div>
  )
}
