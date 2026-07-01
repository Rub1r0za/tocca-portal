'use client'

import { useActionState } from 'react'
import { Loader2, Trash2, UserPlus } from 'lucide-react'
import { addTraveler, deleteTraveler } from '../../actions'
import type { Traveler } from '@/lib/types'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

function AddTravelerForm({ bookingId, locale }: { bookingId: string; locale: string }) {
  const bound = addTraveler.bind(null, bookingId, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action} className="mt-5 rounded-xl border border-dashed border-[rgba(62,45,35,0.2)] bg-[#FAFAF8] p-4">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-[#3E2D23]">
        <UserPlus className="size-4 text-[#4A9A92]" />
        Añadir viajero
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre *</label>
          <input name="first_name" type="text" required placeholder="María" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Apellido *</label>
          <input name="last_name" type="text" required placeholder="García" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Tipo</label>
          <select name="type" className={inputClass}>
            <option value="adult">Adulto</option>
            <option value="child">Niño</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Restricciones alimentarias</label>
          <input
            name="dietary_restrictions"
            type="text"
            placeholder="Vegetariano, sin gluten…"
            className={inputClass}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-[#23374D] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          Añadir
        </button>
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      </div>
    </form>
  )
}

function DeleteTravelerButton({
  travelerId,
  bookingId,
  locale,
}: {
  travelerId: string
  bookingId: string
  locale: string
}) {
  const bound = deleteTraveler.bind(null, travelerId, locale, bookingId)

  return (
    <form action={bound}>
      <button
        type="submit"
        title="Eliminar viajero"
        className="rounded-lg p-1.5 text-[#7A7168] transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none"
        onClick={(e) => {
          if (!confirm('¿Eliminar este viajero?')) e.preventDefault()
        }}
      >
        <Trash2 className="size-4" />
      </button>
    </form>
  )
}

export function TravelersSection({
  bookingId,
  locale,
  travelers,
}: {
  bookingId: string
  locale: string
  travelers: Traveler[]
}) {
  return (
    <div>
      {travelers.length === 0 ? (
        <p className="text-sm text-[#7A7168]">No hay viajeros aún.</p>
      ) : (
        <ul className="divide-y divide-[rgba(62,45,35,0.08)]">
          {travelers.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#4A9A92]/10 text-sm font-medium text-[#4A9A92]">
                {t.first_name[0]}{t.last_name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#3E2D23]">
                  {t.first_name} {t.last_name}
                </p>
                <p className="text-xs text-[#7A7168]">
                  {t.type === 'adult' ? 'Adulto' : 'Niño'}
                  {t.dietary_restrictions ? ` · ${t.dietary_restrictions}` : ''}
                </p>
              </div>
              <DeleteTravelerButton travelerId={t.id} bookingId={bookingId} locale={locale} />
            </li>
          ))}
        </ul>
      )}

      <AddTravelerForm bookingId={bookingId} locale={locale} />
    </div>
  )
}
