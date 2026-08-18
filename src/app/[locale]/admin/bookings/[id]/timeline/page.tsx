import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { EventCard } from './event-card'
import { EventForm, type TimelineEvent } from './event-form'

export default async function TimelineAdminPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const admin = createAdminClient()

  const [{ data: booking }, { data: events }] = await Promise.all([
    admin.from('bookings').select('id, title').eq('id', id).single(),
    admin
      .from('timeline_events')
      .select('*')
      .eq('booking_id', id)
      .order('sort_order', { ascending: true }),
  ])

  if (!booking) notFound()

  const bookingTitle =
    (booking.title as Record<string, string>)?.en ||
    (booking.title as Record<string, string>)?.es ||
    'Reserva'

  const list = (events ?? []) as TimelineEvent[]
  const nextSortOrder = list.length > 0 ? Math.max(...list.map((e) => e.sort_order)) + 1 : 0

  return (
    <div className="mx-auto max-w-3xl">
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
          Timeline del viaje
        </h1>
        <span className="rounded-full border border-[rgba(62,45,35,0.12)] bg-white px-3 py-1 text-xs text-[#7A7168]">
          {list.length} evento{list.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="mb-6 space-y-4">
        {list.length > 0 ? (
          list.map((event) => (
            <EventCard key={event.id} event={event} bookingId={id} locale={locale} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[rgba(62,45,35,0.2)] bg-white p-8 text-center">
            <p className="text-sm text-[#7A7168]">No hay eventos cargados a mano.</p>
            <p className="mx-auto mt-2 max-w-md text-xs text-[#7A7168]">
              Mientras esta lista esté vacía el viajero ve un cronograma armado solo
              con los horarios de cada día del itinerario. Añade eventos aquí únicamente
              si quieres uno distinto (vuelos, traslados, algo fuera del itinerario):
              en cuanto crees el primero, el automático deja de mostrarse.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
        <h2 className="mb-4 text-base font-medium text-[#3E2D23]">Añadir evento</h2>
        <EventForm bookingId={id} locale={locale} nextSortOrder={nextSortOrder} />
      </div>
    </div>
  )
}
