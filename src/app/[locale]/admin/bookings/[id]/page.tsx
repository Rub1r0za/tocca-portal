import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ArrowLeft, Map } from 'lucide-react'
import { BookingStatusForm } from './booking-status-form'
import { BookingDatesForm } from './booking-dates-form'
import { BookingNotesForm } from './booking-notes-form'
import { TravelersSection } from './travelers-section'
import { cn } from '@/lib/utils'

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-teal-50 text-teal-700 border-teal-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
}
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  cancelled: 'Cancelada',
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const admin = createAdminClient()

  const { data: booking } = await admin
    .from('bookings')
    .select('*, travelers(*)')
    .eq('id', id)
    .single()

  if (!booking) notFound()

  const title =
    (booking.title as Record<string, string>)?.en ||
    (booking.title as Record<string, string>)?.es ||
    'Sin título'

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back + breadcrumb */}
      <Link
        href={`/${locale}/admin`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-[#7A7168] transition-colors hover:text-[#3E2D23]"
      >
        <ArrowLeft className="size-4" />
        Reservas
      </Link>

      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-start gap-3">
        <div className="flex-1">
          <h1
            className="text-2xl text-[#3E2D23] sm:text-3xl"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontStyle: 'italic' }}
          >
            {title}
          </h1>
          <p className="mt-1 text-xs text-[#7A7168]">ID: {id}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
            STATUS_CLASS[booking.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
          )}
        >
          {STATUS_LABEL[booking.status] ?? booking.status}
        </span>
      </div>

      {/* Quick nav */}
      <div className="mb-6">
        <Link
          href={`/${locale}/admin/bookings/${id}/journey`}
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(62,45,35,0.12)] bg-white px-4 py-2.5 text-sm text-[#4A9A92] shadow-[0_1px_4px_rgba(62,45,35,0.06)] transition-all hover:border-[#4A9A92]/40 hover:shadow-[0_2px_8px_rgba(74,154,146,0.12)]"
        >
          <Map className="size-4" />
          Gestionar días del itinerario
        </Link>
      </div>

      <div className="space-y-5">
        {/* Status */}
        <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
          <h2 className="mb-4 text-base font-medium text-[#3E2D23]">Estado de la reserva</h2>
          <BookingStatusForm bookingId={id} locale={locale} currentStatus={booking.status} />
        </div>

        {/* Dates */}
        <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
          <h2 className="mb-4 text-base font-medium text-[#3E2D23]">Fechas del viaje</h2>
          <BookingDatesForm
            bookingId={id}
            locale={locale}
            startDate={booking.start_date ?? ''}
            endDate={booking.end_date ?? ''}
          />
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
          <h2 className="mb-4 text-base font-medium text-[#3E2D23]">Notas internas</h2>
          <BookingNotesForm
            bookingId={id}
            locale={locale}
            notes={booking.notes ?? ''}
          />
        </div>

        {/* Travelers */}
        <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
          <h2 className="mb-4 text-base font-medium text-[#3E2D23]">Viajeros</h2>
          <TravelersSection
            bookingId={id}
            locale={locale}
            travelers={booking.travelers ?? []}
          />
        </div>
      </div>
    </div>
  )
}
