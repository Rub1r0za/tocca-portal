import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, FileText, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { cn } from '@/lib/utils'
import {
  reviewPayment,
  deleteScheduleItem,
  toggleSchedulePaid,
} from '../../../actions'
import { TotalForm, ScheduleForm } from './payment-forms'

const STATUS_LABEL: Record<string, string> = {
  pending_review: 'Por revisar', approved: 'Aprobado', rejected: 'Rechazado',
}
const STATUS_CLASS: Record<string, string> = {
  pending_review: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-teal-50 text-teal-700 border-teal-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
}
const METHOD_LABEL: Record<string, string> = {
  zelle: 'Zelle', transfer: 'Transferencia', stripe: 'Stripe', other: 'Otro',
}

const fmtMoney = (n: number) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

export default async function BookingPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const admin = createAdminClient()

  const [{ data: booking }, { data: payments }, { data: schedule }] = await Promise.all([
    admin.from('bookings').select('id, title, applicant_name, applicant_email, total_price').eq('id', id).maybeSingle(),
    admin.from('payments').select('*').eq('booking_id', id).order('created_at', { ascending: false }),
    admin.from('payment_schedule').select('*').eq('booking_id', id).order('due_date', { ascending: true }),
  ])

  if (!booking) notFound()

  const approved = (payments ?? []).filter((p) => p.status === 'approved').reduce((s, p) => s + Number(p.amount), 0)
  const total = booking.total_price ? Number(booking.total_price) : null
  const balance = total !== null ? total - approved : null

  const signedUrls = new Map<string, string>()
  for (const p of payments ?? []) {
    if (p.receipt_path) {
      const { data } = await admin.storage.from('receipts').createSignedUrl(p.receipt_path, 3600)
      if (data?.signedUrl) signedUrls.set(p.id, data.signedUrl)
    }
  }

  const bookingTitle =
    (booking.title as Record<string, string>)?.es ||
    (booking.title as Record<string, string>)?.en ||
    'Reserva'

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/${locale}/admin/bookings/${id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-[#7A7168] transition-colors hover:text-[#3E2D23]"
      >
        <ArrowLeft className="size-4" />
        {bookingTitle}
      </Link>

      <h1 className="mb-1 text-2xl text-[#3E2D23]" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
        Pagos de la reserva
      </h1>
      <p className="mb-6 text-sm text-[#7A7168]">
        {booking.applicant_name || booking.applicant_email || ''}
      </p>

      {/* Resumen */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Total del viaje', value: total !== null ? fmtMoney(total) : '—', color: 'text-[#3E2D23]' },
          { label: 'Pagado (aprobado)', value: fmtMoney(approved), color: 'text-[#4A9A92]' },
          { label: 'Saldo pendiente', value: balance !== null ? fmtMoney(Math.max(0, balance)) : '—', color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[rgba(62,45,35,0.12)] bg-white p-4 text-center shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
            <p className={cn('text-xl font-semibold', color)}>{value}</p>
            <p className="mt-0.5 text-xs text-[#7A7168]">{label}</p>
          </div>
        ))}
      </div>

      {/* Total del viaje */}
      <div className="mb-6 rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
        <h2 className="mb-3 text-base font-medium text-[#3E2D23]">Total del viaje</h2>
        <TotalForm bookingId={id} locale={locale} current={booking.total_price} />
      </div>

      {/* Cronograma de pagos */}
      <div className="mb-6 rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
        <h2 className="mb-1 text-base font-medium text-[#3E2D23]">Fechas de seguimiento</h2>
        <p className="mb-4 text-xs text-[#7A7168]">
          El cliente ve estas fechas como “próximos vencimientos” en su pestaña de pagos.
        </p>

        {(schedule ?? []).length > 0 && (
          <ul className="mb-4 space-y-2">
            {(schedule ?? []).map((item) => {
              const label = (item.label as Record<string, string>)?.es || (item.label as Record<string, string>)?.en || 'Pago'
              const toggleAction = toggleSchedulePaid.bind(null, item.id, !item.paid, id, locale)
              const deleteAction = deleteScheduleItem.bind(null, item.id, id, locale)
              return (
                <li key={item.id} className={cn('flex items-center gap-3 rounded-xl border px-4 py-2.5', item.paid ? 'border-teal-200 bg-teal-50/50' : 'border-[rgba(62,45,35,0.12)]')}>
                  <form action={toggleAction}>
                    <button type="submit" title={item.paid ? 'Marcar como no pagado' : 'Marcar como pagado'} className="flex items-center">
                      {item.paid
                        ? <CheckCircle2 className="size-5 text-[#4A9A92]" />
                        : <Circle className="size-5 text-[#7A7168]/50" />}
                    </button>
                  </form>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', item.paid ? 'text-[#7A7168] line-through' : 'text-[#3E2D23]')}>
                      {label} · {fmtMoney(Number(item.amount))}
                    </p>
                    <p className="text-xs text-[#7A7168]">{item.due_date}</p>
                  </div>
                  <form action={deleteAction}>
                    <button type="submit" title="Eliminar" className="rounded-lg p-1.5 text-[#7A7168] transition-colors hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </li>
              )
            })}
          </ul>
        )}

        <ScheduleForm bookingId={id} locale={locale} />
      </div>

      {/* Pagos registrados */}
      <div className="overflow-hidden rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white shadow-[0_2px_8px_rgba(62,45,35,0.06)]">
        <p className="border-b border-[rgba(62,45,35,0.08)] bg-[#FAFAF8] px-5 py-3 text-xs font-semibold tracking-[0.15em] text-[#7A7168] uppercase">
          Pagos registrados
        </p>
        {(payments ?? []).length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[#7A7168]">El cliente aún no ha registrado pagos.</p>
        ) : (
          <ul className="divide-y divide-[rgba(62,45,35,0.08)]">
            {(payments ?? []).map((p) => {
              const approveAction = reviewPayment.bind(null, p.id, 'approved' as const, locale)
              const rejectAction = reviewPayment.bind(null, p.id, 'rejected' as const, locale)
              const receiptUrl = signedUrls.get(p.id)
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-[#3E2D23]">
                        {fmtMoney(Number(p.amount))} · {METHOD_LABEL[p.method] ?? p.method}
                      </p>
                      <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-medium', STATUS_CLASS[p.status])}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-[#7A7168]">
                      <span>{new Date(p.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {p.reference && <span>Ref: {p.reference}</span>}
                      {Number(p.fee_amount) > 0 && <span>+ {fmtMoney(Number(p.fee_amount))} de cargo</span>}
                      {p.method === 'stripe' && <span className="text-[#4A9A92]">Cobrado con tarjeta ✓</span>}
                      {receiptUrl && (
                        <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#4A9A92] hover:underline">
                          <FileText className="size-3" /> Ver comprobante
                        </a>
                      )}
                    </div>
                  </div>
                  {p.status === 'pending_review' && (
                    <div className="flex shrink-0 gap-2">
                      <form action={approveAction}>
                        <button type="submit" className="rounded-lg bg-[#4A9A92] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90">
                          Aprobar
                        </button>
                      </form>
                      <form action={rejectAction}>
                        <button type="submit" className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100">
                          Rechazar
                        </button>
                      </form>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
