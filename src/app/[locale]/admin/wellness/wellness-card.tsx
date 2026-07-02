'use client'

import { useState } from 'react'
import { Pencil, Trash2, ChevronUp, Eye, EyeOff, Euro, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteWellnessOption, toggleWellnessActive } from '../actions'
import { WellnessForm, type WellnessOption } from './wellness-form'

export function WellnessCard({ option, locale }: { option: WellnessOption; locale: string }) {
  const [editing, setEditing] = useState(false)

  const nameEn = option.name?.en || option.name?.es || 'Sin nombre'
  const nameEs = option.name?.es || ''
  const deleteAction = deleteWellnessOption.bind(null, option.id, locale)
  const toggleAction = toggleWellnessActive.bind(null, option.id, !option.active, locale)

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]',
        option.active ? 'border-[rgba(62,45,35,0.12)]' : 'border-dashed border-[rgba(62,45,35,0.2)] opacity-70'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-medium text-[#3E2D23]" style={{ fontFamily: 'var(--font-display)' }}>
              {nameEn}
            </p>
            {!option.active && (
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[0.65rem] font-medium text-gray-500">
                Oculta
              </span>
            )}
          </div>
          {nameEs && nameEs !== nameEn && <p className="text-sm text-[#7A7168]">{nameEs}</p>}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#7A7168]">
            <span className="inline-flex items-center gap-1">
              <Euro className="size-3" />
              {option.price != null ? Number(option.price).toFixed(2) : 'A consultar'}
            </span>
            {(option.duration?.es || option.duration?.en) && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {option.duration?.es || option.duration?.en}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <form action={toggleAction}>
            <button
              type="submit"
              title={option.active ? 'Ocultar del portal' : 'Mostrar en el portal'}
              className="rounded-lg p-1.5 text-[#7A7168] transition-colors hover:bg-[#F4F1EB] hover:text-[#3E2D23]"
            >
              {option.active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
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
              title="Eliminar"
              className="rounded-lg p-1.5 text-[#7A7168] transition-colors hover:bg-red-50 hover:text-red-600"
              onClick={(e) => {
                if (!confirm(`¿Eliminar "${nameEn}"? Se borrarán también las solicitudes asociadas.`)) e.preventDefault()
              }}
            >
              <Trash2 className="size-4" />
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <div className="mt-4 border-t border-[rgba(62,45,35,0.08)] pt-4">
          <WellnessForm option={option} locale={locale} onClose={() => setEditing(false)} />
        </div>
      )}
    </div>
  )
}
