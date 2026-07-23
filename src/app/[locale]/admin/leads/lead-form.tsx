'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { saveLead } from '../actions'
import type { Lead } from '@/lib/types'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

export const LEAD_STATUS = [
  { value: 'potential', label: 'Potencial' },
  { value: 'client', label: 'Cliente' },
  { value: 'past', label: 'Viajero pasado' },
] as const

export function LeadForm({
  lead,
  locale,
  onClose,
}: {
  lead?: Lead
  locale: string
  onClose?: () => void
}) {
  const bound = saveLead.bind(null, lead?.id ?? null, locale)
  const [state, action, pending] = useActionState(bound, null)
  const formRef = useRef<HTMLFormElement>(null)

  // Clear the fields after a successful create (keep them when editing).
  useEffect(() => {
    if (state?.ok && !lead) formRef.current?.reset()
  }, [state, lead])

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.ok && !lead && <p className="text-xs text-[#4A9A92]">Contacto guardado.</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre completo *</label>
          <input name="full_name" type="text" required defaultValue={lead?.full_name ?? ''} placeholder="María García" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <select name="status" defaultValue={lead?.status ?? 'potential'} className={inputClass}>
            {LEAD_STATUS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Teléfono / WhatsApp</label>
          <input name="phone" type="tel" defaultValue={lead?.phone ?? ''} placeholder="+58 412 555 5555" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" defaultValue={lead?.email ?? ''} placeholder="correo@ejemplo.com" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Origen</label>
          <input name="source" type="text" defaultValue={lead?.source ?? ''} placeholder="Instagram, referido…" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Instagram</label>
          <input name="instagram_handle" type="text" defaultValue={lead?.instagram_handle ?? ''} placeholder="@usuario" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cumpleaños</label>
          <input name="birthday" type="date" defaultValue={lead?.birthday ?? ''} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notas</label>
        <textarea name="notes" rows={2} defaultValue={lead?.notes ?? ''} className={inputClass} style={{ resize: 'vertical' }} />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {lead ? 'Guardar' : 'Añadir contacto'}
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
