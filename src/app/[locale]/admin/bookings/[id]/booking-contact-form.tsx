'use client'

import { useActionState, useState } from 'react'
import { Loader2, MessageCircle, Mail, Check } from 'lucide-react'
import { updateBookingPhone } from '../../actions'
import { waLink } from '@/lib/format'

export function BookingContactForm({
  bookingId,
  locale,
  name,
  email,
  phone,
}: {
  bookingId: string
  locale: string
  name: string
  email: string
  phone: string
}) {
  const bound = updateBookingPhone.bind(null, bookingId, locale)
  const [state, action, pending] = useActionState(bound, null)

  // El enlace de WhatsApp sigue a lo que hay escrito, sin esperar a guardar.
  const [draft, setDraft] = useState(phone)
  const link = waLink(draft)

  return (
    <div className="space-y-4">
      <div className="space-y-1.5 text-sm">
        <p className="text-[#3E2D23]">{name || '—'}</p>
        {email && (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1.5 text-[#4A9A92] hover:underline"
          >
            <Mail className="size-3.5 shrink-0" />
            {email}
          </a>
        )}
      </div>

      <form action={action} className="space-y-3">
        <div>
          <label
            htmlFor="applicant_phone"
            className="mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase"
          >
            Teléfono / WhatsApp
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="applicant_phone"
              name="applicant_phone"
              type="tel"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="+1 809 000 0000"
              className="min-w-0 flex-1 rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:ring-2 focus:ring-[#4A9A92]/20 focus:outline-none"
            />
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            )}
          </div>
          <p className="mt-1.5 text-xs text-[#7A7168]">
            Con el código del país, por ejemplo +1 para EE. UU. y República Dominicana.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />}
            Guardar teléfono
          </button>
          {state?.ok && !pending && (
            <span className="inline-flex items-center gap-1 text-xs text-[#4A9A92]">
              <Check className="size-3.5" />
              Guardado
            </span>
          )}
          {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
        </div>
      </form>
    </div>
  )
}
