'use client'

import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createBooking } from '../../actions'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A9A92]/50"
      style={{ background: 'linear-gradient(135deg, #23374D 0%, #1a2d3f 100%)' }}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? 'Creando…' : 'Crear reserva'}
    </button>
  )
}

export default function NewBookingPage() {
  const params = useParams()
  const locale = params.locale as string

  const boundAction = createBooking.bind(null, locale)
  const [state, action, pending] = useActionState(boundAction, null)

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back */}
      <Link
        href={`/${locale}/admin`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#7A7168] transition-colors hover:text-[#3E2D23]"
      >
        <ArrowLeft className="size-4" />
        Volver a reservas
      </Link>

      <h1
        className="mb-6 text-2xl text-[#3E2D23]"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
      >
        Nueva reserva
      </h1>

      <form action={action} className="space-y-5">
        {/* Error */}
        {state?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* Client email */}
        <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
          <h2 className="mb-4 text-base font-medium text-[#3E2D23]">Cliente</h2>
          <div>
            <label htmlFor="email" className={labelClass}>Email del cliente *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="cliente@email.com"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-[#7A7168]">
              El cliente debe haber creado su cuenta en el portal primero.
            </p>
          </div>
        </div>

        {/* Trip info */}
        <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
          <h2 className="mb-4 text-base font-medium text-[#3E2D23]">Información del viaje</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title_en" className={labelClass}>Título (inglés) *</label>
                <input
                  id="title_en"
                  name="title_en"
                  type="text"
                  required
                  placeholder="Amalfi Coast — Signature Journey"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="title_es" className={labelClass}>Título (español)</label>
                <input
                  id="title_es"
                  name="title_es"
                  type="text"
                  placeholder="Costa Amalfi — Signature Journey"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="start_date" className={labelClass}>Fecha de inicio</label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="end_date" className={labelClass}>Fecha de fin</label>
                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className={labelClass}>Notas internas</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Preferencias especiales, detalles de vuelos…"
                className={inputClass}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/${locale}/admin`}
            className="text-sm text-[#7A7168] hover:text-[#3E2D23]"
          >
            Cancelar
          </Link>
          <SubmitButton pending={pending} />
        </div>
      </form>
    </div>
  )
}
