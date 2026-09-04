import { createAdminClient } from '@/lib/supabase/admin'
import { Sparkles, HeartPulse, UtensilsCrossed } from 'lucide-react'
import {
  mealsByDay,
  requestsByDay,
  COURSE_LABEL,
  type Person,
  type RequestRow,
} from '@/lib/trip-summary'

export const metadata = { title: 'Consolidado · Tocca' }

const name = (v: unknown): string => {
  const rec = v as Record<string, string> | null
  return rec?.es || rec?.en || 'Sin nombre'
}

export default async function SummaryAdminPage() {
  const admin = createAdminClient()

  // Las canceladas no se cocinan ni se reservan: quedan fuera del consolidado.
  const { data: bookingRows } = await admin
    .from('bookings')
    .select('id, title, applicant_name, status')
    .neq('status', 'cancelled')

  const bookings = bookingRows ?? []
  const bookingIds = bookings.map((b) => b.id)
  const bookingName = new Map(
    bookings.map((b) => [b.id, b.applicant_name || name(b.title)]),
  )

  if (bookingIds.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <Header count={0} />
        <Empty text="No hay reservas activas todavía." />
      </div>
    )
  }

  const [
    { data: travelerRows },
    { data: dayRows },
    { data: selectionRows },
    { data: actRows },
    { data: wellRows },
  ] = await Promise.all([
    admin.from('travelers').select('id, booking_id, first_name, last_name, trip_number').in('booking_id', bookingIds),
    admin
      .from('journey_days')
      .select('id, booking_id, day_number, day_date, title, trip_number, meals (id, course, name)')
      .in('booking_id', bookingIds),
    admin.from('meal_selections').select('meal_id, traveler_id').in('booking_id', bookingIds),
    admin
      .from('activity_requests')
      .select('id, booking_id, num_guests, traveler_ids, requested_date, status, activities(name, trip_number)')
      .in('booking_id', bookingIds),
    admin
      .from('wellness_requests')
      .select('id, booking_id, num_guests, traveler_ids, requested_date, status, wellness_options(name, trip_number)')
      .in('booking_id', bookingIds),
  ])

  const people = new Map<string, Person>(
    (travelerRows ?? []).map((t) => [
      t.id,
      {
        id: t.id,
        name: `${t.first_name} ${t.last_name}`.trim(),
        bookingId: t.booking_id,
        bookingName: bookingName.get(t.booking_id) ?? 'Reserva',
        tripNumber: (t.trip_number ?? 1) as 1 | 2,
      },
    ]),
  )

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const toRequest = (r: any, kind: 'activity' | 'wellness', itemName: string, tripNumber: number): RequestRow => ({
    id: r.id,
    kind,
    itemName,
    status: r.status,
    requestedDate: r.requested_date,
    travelerIds: r.traveler_ids ?? [],
    numGuests: r.num_guests,
    bookingName: bookingName.get(r.booking_id) ?? 'Reserva',
    tripNumber: (tripNumber ?? 1) as 1 | 2,
  })
  const activityDays = requestsByDay(
    (actRows ?? []).map((r: any) => toRequest(r, 'activity', name(r.activities?.name), r.activities?.trip_number)),
    people,
  )
  const wellnessDays = requestsByDay(
    (wellRows ?? []).map((r: any) => toRequest(r, 'wellness', name(r.wellness_options?.name), r.wellness_options?.trip_number)),
    people,
  )
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const meals = mealsByDay((dayRows ?? []) as never, people, selectionRows ?? [])

  return (
    <div className="mx-auto max-w-3xl">
      <Header count={people.size} />

      {/* ── Comidas ───────────────────────────────────────────── */}
      <Section icon={<UtensilsCrossed className="size-4" />} title="Comidas por día y por persona">
        {meals.length === 0 ? (
          <Empty text="Ningún día tiene platos cargados todavía." />
        ) : (
          <div className="space-y-6">
            {meals.map((day) => (
              <div key={`${day.tripNumber}-${day.dayNumber}`} className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
                <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#4A9A92]">
                  Viaje {day.tripNumber === 1 ? 'uno · Signature' : 'dos · Yoga Retreat'}
                </p>
                <p className="text-sm font-semibold text-[#3E2D23]">
                  Viaje {day.tripNumber === 1 ? 'uno' : 'dos'} · Día {day.dayNumber}
                  {day.title ? ` · ${day.title}` : ''}
                  {day.date && <span className="ml-2 text-xs font-normal text-[#7A7168]">{day.date}</span>}
                </p>

                <ul className="mt-3 space-y-1.5">
                  {day.rows.map((row) => (
                    <li key={`${day.dayNumber}-${row.person.id}`} className="text-sm text-[#3E2D23]">
                      <span className="font-medium">{row.person.name}</span>
                      <span className="ml-1.5 text-[0.65rem] uppercase tracking-wider text-[#7A7168]/70">
                        {row.person.bookingName}
                      </span>
                      {row.chosen.length > 0 && (
                        <span className="text-[#7A7168]">
                          {' — '}
                          {row.chosen
                            .map((c) => `${COURSE_LABEL[c.course] ?? c.course}: ${c.dish}`)
                            .join(' · ')}
                        </span>
                      )}
                      {row.missingCourses.length > 0 && (
                        <span className="ml-1.5 text-xs text-amber-700">
                          falta {row.missingCourses.map((c) => (COURSE_LABEL[c] ?? c).toLowerCase()).join(', ')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                {day.tally.length > 0 && (
                  <div className="mt-4 border-t border-[rgba(62,45,35,0.08)] pt-3">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#7A7168]">
                      Para ordenar
                    </p>
                    <ul className="mt-1.5 space-y-0.5">
                      {day.tally.map((t) => (
                        <li key={`${t.course}-${t.dish}`} className="flex flex-wrap items-baseline gap-x-2 text-sm text-[#3E2D23]">
                          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#4A9A92]/10 px-2 text-xs font-semibold text-[#4A9A92]">
                            {t.count}
                          </span>
                          <span>{t.dish}</span>
                          <span className="text-[0.65rem] uppercase tracking-wider text-[#7A7168]/70">
                            {COURSE_LABEL[t.course] ?? t.course}
                          </span>
                          <span className="text-xs text-[#7A7168]">— {t.names.join(', ')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Actividades ───────────────────────────────────────── */}
      <Section icon={<Sparkles className="size-4" />} title="Actividades del día libre por fecha">
        <RequestList days={activityDays} empty="No hay solicitudes de actividades." />
      </Section>

      {/* ── Wellness ──────────────────────────────────────────── */}
      <Section icon={<HeartPulse className="size-4" />} title="Experiencias para cualquier día por fecha">
        <RequestList days={wellnessDays} empty="No hay solicitudes de experiencias." />
      </Section>
    </div>
  )
}

function Header({ count }: { count: number }) {
  return (
    <div className="mb-6">
      <h1
        className="text-2xl text-[#3E2D23] sm:text-3xl"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
      >
        Consolidado del viaje
      </h1>
      <p className="mt-0.5 text-sm text-[#7A7168]">
        Todas las reservas activas juntas, por día y por persona: {count} viajero{count !== 1 ? 's' : ''} en total.
      </p>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-base font-medium text-[#3E2D23]">
        <span className="text-[#4A9A92]">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[rgba(62,45,35,0.2)] bg-white p-6 text-center">
      <p className="text-sm text-[#7A7168]">{text}</p>
    </div>
  )
}

function RequestList({
  days,
  empty,
}: {
  days: ReturnType<typeof requestsByDay>
  empty: string
}) {
  if (days.length === 0) return <Empty text={empty} />

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <div key={`${day.tripNumber}-${day.date || 'sin-fecha'}`} className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
          <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#4A9A92]">
            Viaje {day.tripNumber === 1 ? 'uno · Signature' : 'dos · Yoga Retreat'}
          </p>
          <p className="text-sm font-semibold text-[#3E2D23]">Viaje {day.tripNumber === 1 ? 'uno' : 'dos'} · {day.date || 'Sin fecha pedida'}</p>
          <ul className="mt-2 space-y-1.5">
            {day.items.map(({ request, people }) => (
              <li key={`${request.kind}-${request.id}`} className="text-sm text-[#3E2D23]">
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#4A9A92]/10 px-2 text-xs font-semibold text-[#4A9A92]">
                  {request.numGuests}
                </span>{' '}
                <span className="font-medium">{request.itemName}</span>
                <span className="ml-1.5 text-[0.65rem] uppercase tracking-wider text-[#7A7168]/70">
                  {request.bookingName}
                </span>
                {request.status === 'pending' && (
                  <span className="ml-1.5 text-xs font-medium text-amber-700">sin confirmar</span>
                )}
                <span className="text-[#7A7168]">
                  {people.length > 0
                    ? ` — ${people.map((p) => p.name).join(', ')}`
                    : ' — solicitud anterior, sin lista de personas'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
