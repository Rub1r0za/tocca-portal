'use client'

import { useActionState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { setBookingTotal, addScheduleItem } from '../../../actions'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'

export function TotalForm({
  bookingId,
  locale,
  current,
}: {
  bookingId: string
  locale: string
  current: number | null
}) {
  const bound = setBookingTotal.bind(null, bookingId, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="flex-1">
        <label htmlFor="total_price" className={labelClass}>Total (USD)</label>
        <input
          id="total_price"
          name="total_price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={current ?? ''}
          placeholder="Sin definir"
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-3.5 animate-spin" />}
        Guardar
      </button>
      {(state as { error?: string } | null)?.error && (
        <p className="w-full text-xs text-red-600">{(state as { error?: string }).error}</p>
      )}
    </form>
  )
}

export function ScheduleForm({ bookingId, locale }: { bookingId: string; locale: string }) {
  const bound = addScheduleItem.bind(null, bookingId, locale)
  const [state, action, pending] = useActionState(bound, null)

  return (
    <form action={action} className="space-y-3 border-t border-[rgba(62,45,35,0.08)] pt-4">
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Fecha límite *</label>
          <input name="due_date" type="date" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Monto (USD) *</label>
          <input name="amount" type="number" min="1" step="0.01" required placeholder="500.00" className={inputClass} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Concepto ES</label>
          <input name="label_es" type="text" placeholder="30% de confirmación" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Concepto EN</label>
          <input name="label_en" type="text" placeholder="30% confirmation" className={inputClass} />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-1.5 rounded-xl border border-[#4A9A92]/40 bg-[#4A9A92]/5 px-4 py-2 text-sm font-medium text-[#4A9A92] transition-colors hover:bg-[#4A9A92]/10 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
        Añadir fecha de pago
      </button>
    </form>
  )
}
