import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { CalendarClock, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { reviewPayment } from '../actions'

const STATUS_LABEL: Record<string, string> = {
  pending_review: 'Por revisar',
  approved: 'Aprobado',
  rejected: 'Rechazado',
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

export default async function AdminPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const admin = createAdminClient()

  const [{ data: paymentsData }, { data: scheduleData }] = await Promise.all([
    admin
      .from('payments')
      .select('*, bookings(id, title, applicant_name, applicant_email)')
      .order('created_at', { ascending: false }),
    admin
      .from('payment_schedule')
      .select('*, bookings(id, title, applicant_name)')
      .eq('paid', false)
      .order('due_date', { ascending: true })
      .limit(12),
  ])

  const payments = paymentsData ?? []
  const upcoming = scheduleData ?? []
  const pending = payments.filter((p) => p.status === 'pending_review')
  const rest = payments.filter((p) => p.status !== 'pending_review')

  // Comprobantes: URLs firmadas (1 hora)
  const signedUrls = new Map<string, string>()
  for (const p of payments) {
    if (p.receipt_path) {
      const { data } = await admin.storage.from('receipts').createSignedUrl(p.receipt_path, 3600)
      if (data?.signedUrl) signedUrls.set(p.id, data.signedUrl)
    }
  }

  const totalApproved = payments
    .filter((p) => p.status === 'approved')
    .reduce((s, p) => s + Number(p.amount), 0)

  function PaymentRow({ p }: { p: (typeof payments)[number] }) {
    const b = p.bookings as { id: string; applicant_name: string | null; applicant_email: string | null } | null
    const approveAction = reviewPayment.bind(null, p.id, 'approved', locale)
    const rejectAction = reviewPayment.bind(null, p.id, 'rejected', locale)
    const receiptUrl = signedUrls.get(p.id)

    return (
      <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-[#3E2D23]">
              {fmtMoney(Number(p.amount))} · {METHOD_LABEL[p.method] ?? p.method}
            </p>
            <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-medium', STATUS_CLASS[p.status])}>
              {STATUS_LABEL[p.status] ?? p.status}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#7A7168]">
            {b && (
              <Link href={`/${locale}/admin/bookings/${b.id}/payments`} className="text-[#4A9A92] hover:underline">
                {b.applicant_name || b.applicant_email || 'Reserva'}
              </Link>
            )}
            <span>{new Date(p.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            {p.reference && <span>Ref: {p.reference}</span>}
            {receiptUrl ? (
              <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#4A9A92] hover:underline">
                <FileText className="size-3" /> Ver comprobante
              </a>
            ) : (
              <span className="text-amber-600">Sin comprobante</span>
            )}
          </div>
          {p.notes && <p className="mt-1 text-xs text-[#7A7168]">“{p.notes}”</p>}
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
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl text-[#3E2D23] sm:text-3xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          Pagos
        </h1>
        <p className="mt-0.5 text-sm text-[#7A7168]">
          {pending.length} por revisar · {fmtMoney(totalApproved)} aprobados en total
        </p>
      </div>

      {/* Próximos vencimientos */}
      {upcoming.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800">
            <CalendarClock className="size-4" /> Próximos vencimientos
          </h2>
          <ul className="space-y-1.5">
            {upcoming.map((item) => {
              const b = item.bookings as { id: string; applicant_name: string | null } | null
              const label = (item.label as Record<string, string>)?.es || (item.label as Record<string, string>)?.en || 'Pago pendiente'
              return (
                <li key={item.id} className="flex flex-wrap items-center gap-x-2 text-xs text-amber-900">
                  <span className="font-medium">{item.due_date}</span> — {label} · {fmtMoney(Number(item.amount))}
                  {b && (
                    <Link href={`/${locale}/admin/bookings/${b.id}/payments`} className="text-[#4A9A92] hover:underline">
                      {b.applicant_name || 'ver reserva'}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Pendientes */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white shadow-[0_2px_8px_rgba(62,45,35,0.06)]">
        <p className="border-b border-[rgba(62,45,35,0.08)] bg-[#FAFAF8] px-5 py-3 text-xs font-semibold tracking-[0.15em] text-[#7A7168] uppercase">
          Por revisar
        </p>
        {pending.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[#7A7168]">No hay pagos pendientes de revisión.</p>
        ) : (
          <ul className="divide-y divide-[rgba(62,45,35,0.08)]">
            {pending.map((p) => <PaymentRow key={p.id} p={p} />)}
          </ul>
        )}
      </div>

      {/* Historial */}
      {rest.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white shadow-[0_2px_8px_rgba(62,45,35,0.06)]">
          <p className="border-b border-[rgba(62,45,35,0.08)] bg-[#FAFAF8] px-5 py-3 text-xs font-semibold tracking-[0.15em] text-[#7A7168] uppercase">
            Historial
          </p>
          <ul className="divide-y divide-[rgba(62,45,35,0.08)]">
            {rest.map((p) => <PaymentRow key={p.id} p={p} />)}
          </ul>
        </div>
      )}
    </div>
  )
}
