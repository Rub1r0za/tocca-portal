'use client'

import { useState } from 'react'
import { Pencil, Trash2, ChevronUp, Eye, EyeOff, UtensilsCrossed, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DayTemplate } from '@/lib/types'
import { deleteDayTemplate, toggleDayTemplateActive } from '../actions'
import { DayTemplateForm } from './day-template-form'

export function DayTemplateCard({ template, locale }: { template: DayTemplate; locale: string }) {
  const [editing, setEditing] = useState(false)

  const titleEn = template.title?.en || template.title?.es || 'Sin título'
  const titleEs = template.title?.es || ''
  const mealsCount = template.meals?.length ?? 0
  const deleteAction = deleteDayTemplate.bind(null, template.id, locale)
  const toggleAction = toggleDayTemplateActive.bind(null, template.id, !template.active, locale)

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]',
        template.active ? 'border-[rgba(62,45,35,0.12)]' : 'border-dashed border-[rgba(62,45,35,0.2)] opacity-70'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(74,154,146,0.3)] bg-[#4A9A92]/10 text-sm font-medium text-[#4A9A92]">
          {template.sort_order}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-medium text-[#3E2D23]" style={{ fontFamily: 'var(--font-display)' }}>
              {titleEn}
            </p>
            {template.is_free_day && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[0.65rem] font-medium text-amber-700">
                <Compass className="size-3" /> Día libre
              </span>
            )}
            {mealsCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[0.65rem] font-medium text-teal-700">
                <UtensilsCrossed className="size-3" /> Menú con selección
              </span>
            )}
            {!template.active && (
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[0.65rem] font-medium text-gray-500">
                Inactivo
              </span>
            )}
          </div>
          {titleEs && titleEs !== titleEn && <p className="text-sm text-[#7A7168]">{titleEs}</p>}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#7A7168]">
            {template.location && <span>📍 {template.location}</span>}
            {(template.day_vibe?.es || template.day_vibe?.en) && (
              <span>✨ {template.day_vibe?.es || template.day_vibe?.en}</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <form action={toggleAction}>
            <button
              type="submit"
              title={template.active ? 'Desactivar (no se incluirá en el journey completo)' : 'Activar'}
              className="rounded-lg p-1.5 text-[#7A7168] transition-colors hover:bg-[#F4F1EB] hover:text-[#3E2D23]"
            >
              {template.active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            title={editing ? 'Cerrar' : 'Editar'}
            className="rounded-lg p-1.5 text-[#7A7168] transition-colors hover:bg-[#F4F1EB] hover:text-[#3E2D23]"
          >
            {editing ? <ChevronUp className="size-4" /> : <Pencil className="size-4" />}
          </button>
          <form action={deleteAction}>
            <button
              type="submit"
              title="Eliminar plantilla"
              className="rounded-lg p-1.5 text-[#7A7168] transition-colors hover:bg-red-50 hover:text-red-600"
              onClick={(e) => {
                if (!confirm(`¿Eliminar la plantilla "${titleEn}"? Los días ya añadidos a reservas no se tocan.`)) e.preventDefault()
              }}
            >
              <Trash2 className="size-4" />
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <div className="mt-4 border-t border-[rgba(62,45,35,0.08)] pt-4">
          <DayTemplateForm template={template} locale={locale} onClose={() => setEditing(false)} />
        </div>
      )}
    </div>
  )
}
