'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Loader2, UserPlus, CheckCircle2 } from 'lucide-react'
import { createClientUser } from '../../actions'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

export function ClientForm({ locale }: { locale: string }) {
  const bound = createClientUser.bind(null, locale)
  const [state, action, pending] = useActionState(bound, null)

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-8 text-[#4A9A92]" />
        <p className="text-sm font-medium text-[#3E2D23]">Cuenta creada y activada.</p>
        <p className="mt-1 text-xs text-[#7A7168]">
          Comparte el email y la contraseña temporal con tu cliente. Podrá cambiarla desde
          &ldquo;¿Olvidaste tu contraseña?&rdquo; cuando quiera.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            href={`/${locale}/admin/bookings/new`}
            className="rounded-xl bg-[#4A9A92] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Crear su reserva →
          </Link>
          <Link
            href={`/${locale}/admin/clients/new`}
            className="rounded-xl border border-[rgba(62,45,35,0.18)] px-4 py-2 text-sm text-[#7A7168] transition-colors hover:text-[#3E2D23]"
          >
            Crear otro cliente
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div>
        <label className={labelClass}>Email del cliente *</label>
        <input name="email" type="email" required placeholder="cliente@correo.com" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Nombre completo</label>
        <input name="full_name" type="text" placeholder="Nombre y apellido" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Contraseña temporal * (mín. 8 caracteres)</label>
        <input
          name="password"
          type="text"
          required
          minLength={8}
          placeholder="p. ej. Amalfi-2026!"
          autoComplete="off"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-[#7A7168]">
          Se la envías tú directamente (WhatsApp, llamada…). La cuenta queda activa al instante,
          sin correos de confirmación.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #23374D 0%, #1a2d3f 100%)' }}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        {pending ? 'Creando…' : 'Crear cuenta'}
      </button>
    </form>
  )
}
