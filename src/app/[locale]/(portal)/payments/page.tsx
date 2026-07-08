import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { CalendarClock, CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Payment, PaymentScheduleItem } from '@/lib/types'
import { pick, formatDate } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { SectionHeading } from '@/components/primitives'
import { PaymentForm } from './payment-form'

const fmtMoney = (n: number) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('payments')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // Cualquier estado: los pagos empiezan antes de la aprobación
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, total_price, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!booking) redirect(`/${locale}/register`)

  const [{ data: paymentsData }, { data: scheduleData }] = await Promise.all([
    supabase.from('payments').select('*').eq('booking_id', booking.id).order('created_at', { ascending: false }),
    supabase.from('payment_schedule').select('*').eq('booking_id', booking.id).order('due_date', { ascending: true }),
  ])

  const payments = (paymentsData ?? []) as Payment[]
  const schedule = (scheduleData ?? []) as PaymentScheduleItem[]

  const approved = payments.filter((p) => p.status === 'approved').reduce((s, p) => s + Number(p.amount), 0)
  const total = booking.total_price ? Number(booking.total_price) : null
  const balance = total !== null ? Math.max(0, total - approved) : null

  const STATUS: Record<string, { label: string; class: string; Icon: typeof Clock3 }> = {
    pending_review: { label: t('statusPending'), class: 'border-amber-300/40 bg-amber-400/10 text-amber-500', Icon: Clock3 },
    approved: { label: t('statusApproved'), class: 'border-azure/40 bg-azure/10 text-azure', Icon: CheckCircle2 },
    rejected: { label: t('statusRejected'), class: 'border-destructive/40 bg-destructive/10 text-destructive', Icon: XCircle },
  }

  return (
    <div>
      <AppHeader title={t('title')} subtitle={t('subtitle')} locale={locale} />

      <div className="space-y-8 px-5 py-6">
        {/* Resumen */}
        <section className="grid grid-cols-3 gap-2.5">
          {[
            { label: t('summaryTotal'), value: total !== null ? fmtMoney(total) : '—' },
            { label: t('summaryPaid'), value: fmtMoney(approved) },
            { label: t('summaryBalance'), value: balance !== null ? fmtMoney(balance) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-hairline bg-panel/60 px-3 py-4 text-center">
              <p className="text-base text-foreground sm:text-lg" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                {value}
              </p>
              <p className="mt-0.5 text-[0.65rem] tracking-wide text-mist uppercase">{label}</p>
            </div>
          ))}
        </section>

        {/* Próximos vencimientos */}
        {schedule.filter((s) => !s.paid).length > 0 && (
          <section>
            <SectionHeading eyebrow={t('upcoming')} className="mb-3" />
            <ul className="space-y-2">
              {schedule.filter((s) => !s.paid).map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3">
                  <CalendarClock className="size-4 shrink-0 text-gold" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      {pick(item.label, locale) || t('paymentDue')}
                    </p>
                    <p className="text-xs text-mist">
                      {formatDate(item.due_date, locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gold">{fmtMoney(Number(item.amount))}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Registrar pago */}
        <section className="rounded-2xl border border-hairline bg-panel/50 p-5">
          <SectionHeading eyebrow={t('newPayment')} className="mb-2" />
          <p className="mb-4 text-xs leading-relaxed text-mist">{t('zelleInfo')}</p>
          <PaymentForm locale={locale} />
        </section>

        {/* Historial */}
        {payments.length > 0 && (
          <section>
            <SectionHeading eyebrow={t('history')} className="mb-3" />
            <ul className="space-y-2">
              {payments.map((p) => {
                const s = STATUS[p.status] ?? STATUS.pending_review
                return (
                  <li key={p.id} className="flex items-center gap-3 rounded-xl border border-hairline bg-panel/60 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        {fmtMoney(Number(p.amount))} · {p.method === 'zelle' ? 'Zelle' : p.method === 'stripe' ? 'Stripe' : t('transfer')}
                      </p>
                      <p className="text-xs text-mist">
                        {formatDate(p.created_at, locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                        {p.reference ? ` · ${p.reference}` : ''}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.65rem] font-medium ${s.class}`}>
                      <s.Icon className="size-3" aria-hidden />
                      {s.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
