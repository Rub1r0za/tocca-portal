'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import type { DayTemplate } from '@/lib/types'
import { saveDayTemplate } from '../actions'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

function linesOf(items: Array<Record<string, string>> | null | undefined, lang: string) {
  return (items ?? []).map((i) => i?.[lang] ?? '').join('\n')
}

function scheduleLines(
  items: Array<{ time: string; title: Record<string, string> }> | null | undefined,
  lang: string,
) {
  return (items ?? []).map((i) => `${i.time} | ${i.title?.[lang] ?? ''}`).join('\n')
}

export function DayTemplateForm({
  template,
  locale,
  onClose,
}: {
  template?: DayTemplate
  locale: string
  onClose?: () => void
}) {
  const bound = saveDayTemplate.bind(null, template?.id ?? null, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Orden *</label>
          <input name="sort_order" type="number" min="0" required defaultValue={template?.sort_order ?? 0} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lugar</label>
          <input name="location" type="text" defaultValue={template?.location ?? ''} placeholder="Maiori" className={inputClass} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-[#3E2D23]">
            <input
              name="is_free_day"
              type="checkbox"
              defaultChecked={template?.is_free_day ?? false}
              className="size-4 rounded border-[rgba(62,45,35,0.3)] accent-[#4A9A92]"
            />
            Día libre (actividades opcionales)
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Título EN *</label>
          <input name="title_en" type="text" required defaultValue={template?.title?.en ?? ''} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Título ES</label>
          <input name="title_es" type="text" defaultValue={template?.title?.es ?? ''} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Descripción EN</label>
          <textarea name="description_en" rows={4} defaultValue={template?.description?.en ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className={labelClass}>Descripción ES</label>
          <textarea name="description_es" rows={4} defaultValue={template?.description?.es ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Day Vibe EN</label>
          <input name="day_vibe_en" type="text" defaultValue={template?.day_vibe?.en ?? ''} placeholder="Soft Arrivals & Slow Beginnings" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Day Vibe ES</label>
          <input name="day_vibe_es" type="text" defaultValue={template?.day_vibe?.es ?? ''} placeholder="Llegadas suaves y comienzos lentos" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Horario EN (una línea: hora | texto)</label>
          <textarea name="schedule_en" rows={3} defaultValue={scheduleLines(template?.schedule, 'en')} placeholder={'7:00 PM | Welcome Cocktail\n7:30 PM | Welcome Dinner'} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className={labelClass}>Horario ES</label>
          <textarea name="schedule_es" rows={3} defaultValue={scheduleLines(template?.schedule, 'es')} placeholder={'7:00 PM | Cóctel de bienvenida\n7:30 PM | Cena de bienvenida'} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Tocca Tips EN (uno por línea)</label>
          <textarea name="tocca_tips_en" rows={3} defaultValue={linesOf(template?.tocca_tips, 'en')} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className={labelClass}>Tocca Tips ES</label>
          <textarea name="tocca_tips_es" rows={3} defaultValue={linesOf(template?.tocca_tips, 'es')} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Good to Know EN (uno por línea)</label>
          <textarea name="good_to_know_en" rows={3} defaultValue={linesOf(template?.good_to_know, 'en')} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className={labelClass}>Good to Know ES</label>
          <textarea name="good_to_know_es" rows={3} defaultValue={linesOf(template?.good_to_know, 'es')} className={inputClass} style={{ resize: 'vertical' }} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Imagen (URL)</label>
        <input name="image_url" type="url" defaultValue={template?.image_url ?? ''} placeholder="https://…" className={inputClass} />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {template ? 'Guardar cambios' : 'Crear día'}
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
