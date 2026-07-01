import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AddDayForm } from './add-day-form'
import { DayCard } from './day-card'

export default async function JourneyAdminPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const admin = createAdminClient()

  const [{ data: booking }, { data: days }] = await Promise.all([
    admin.from('bookings').select('id, title, start_date').eq('id', id).single(),
    admin
      .from('journey_days')
      .select('*')
      .eq('booking_id', id)
      .order('day_number', { ascending: true }),
  ])

  if (!booking) notFound()

  const bookingTitle =
    (booking.title as Record<string, string>)?.en ||
    (booking.title as Record<string, string>)?.es ||
    'Reserva'

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back */}
      <Link
        href={`/${locale}/admin/bookings/${id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-[#7A7168] transition-colors hover:text-[#3E2D23]"
      >
        <ArrowLeft className="size-4" />
        {bookingTitle}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <h1
          className="text-2xl text-[#3E2D23]"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Días del itinerario
        </h1>
        <span className="rounded-full border border-[rgba(62,45,35,0.12)] bg-white px-3 py-1 text-xs text-[#7A7168]">
          {days?.length ?? 0} día{days?.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Existing days */}
      <div className="mb-6 space-y-4">
        {days && days.length > 0 ? (
          days.map((day) => (
            <DayCard key={day.id} day={day} bookingId={id} locale={locale} startDate={booking.start_date} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[rgba(62,45,35,0.2)] bg-white p-8 text-center">
            <p className="text-sm text-[#7A7168]">No hay días aún. Añade el primero.</p>
          </div>
        )}
      </div>

      {/* Add day form */}
      <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
        <h2 className="mb-4 text-base font-medium text-[#3E2D23]">Añadir día</h2>
        <AddDayForm bookingId={id} locale={locale} nextDayNumber={(days?.length ?? 0) + 1} />
      </div>
    </div>
  )
}
