'use client'

import { useState } from 'react'
import { Pencil, Trash2, ChevronUp, Phone, Mail, AtSign, Cake } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteLead } from '../actions'
import { LeadForm, LEAD_STATUS } from './lead-form'
import type { Lead } from '@/lib/types'

const STATUS_CLASS: Record<string, string> = {
  potential: 'bg-amber-50 text-amber-700 border-amber-200',
  client: 'bg-teal-50 text-teal-700 border-teal-200',
  past: 'bg-gray-50 text-gray-600 border-gray-200',
}

/** "DD mes" for a YYYY-MM-DD birthday, ignoring the year. */
function birthdayLabel(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  const date = new Date(2000, (m ?? 1) - 1, d ?? 1)
  return date.toLocaleDateString('es', { day: 'numeric', month: 'long' })
}

export function LeadCard({ lead, locale }: { lead: Lead; locale: string }) {
  const [editing, setEditing] = useState(false)
  const deleteAction = deleteLead.bind(null, lead.id, locale)
  const statusLabel = LEAD_STATUS.find((s) => s.value === lead.status)?.label ?? lead.status

  return (
    <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#4A9A92]/10 text-sm font-medium text-[#4A9A92]">
          {lead.full_name.slice(0, 2).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-medium text-[#3E2D23]" style={{ fontFamily: 'var(--font-display)' }}>
              {lead.full_name}
            </p>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-medium',
                STATUS_CLASS[lead.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
              )}
            >
              {statusLabel}
            </span>
            {lead.source && (
              <span className="text-[0.65rem] uppercase tracking-wider text-[#7A7168]/70">{lead.source}</span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7A7168]">
            {lead.phone && (
              <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#4A9A92] hover:underline">
                <Phone className="size-3" /> {lead.phone}
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 hover:text-[#3E2D23]">
                <Mail className="size-3" /> {lead.email}
              </a>
            )}
            {lead.instagram_handle && (
              <span className="inline-flex items-center gap-1">
                <AtSign className="size-3" /> {lead.instagram_handle}
              </span>
            )}
            {lead.birthday && (
              <span className="inline-flex items-center gap-1">
                <Cake className="size-3" /> {birthdayLabel(lead.birthday)}
              </span>
            )}
          </div>

          {lead.notes && (
            <p className="mt-2 rounded-lg bg-[#FAFAF8] px-3 py-2 text-xs text-[#7A7168]">{lead.notes}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
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
                if (!confirm(`¿Eliminar el contacto "${lead.full_name}"?`)) e.preventDefault()
              }}
            >
              <Trash2 className="size-4" />
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <div className="mt-4 border-t border-[rgba(62,45,35,0.08)] pt-4">
          <LeadForm lead={lead} locale={locale} onClose={() => setEditing(false)} />
        </div>
      )}
    </div>
  )
}
