import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { DayMeals } from './day-meals'
import type { Meal } from './meal-form'
import type { Traveler } from '@/lib/types'
import { mealPending, mealTally, COURSE_LABEL } from '@/lib/meals-summary'

type DayWithMeals = {
  id: string
  day_number: number
  title: Record<string, string>
  meals: Meal[]
}

export default async function MealsAdminPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const admin = createAdminClient()

  const [{ data: booking }, { data: days }, { data: travelers }, { data: selections }] = await Promise.all([
    admin.from('bookings').select('id, title').eq('id', id).single(),
    admin
      .from('journey_days')
      .select('id, day_number, title, meals (*)')
      .eq('booking_id', id)
      .order('day_number', { ascending: true }),
    admin.from('travelers').select('*').eq('booking_id', id),
    admin.from('meal_selections').select('meal_id, traveler_id').eq('booking_id', id),
  ])

  if (!booking) notFound()

  const travelerList = (travelers ?? []) as Traveler[]
  const travelersByMeal = new Map<string, Traveler[]>()
  for (const s of selections ?? []) {
    const traveler = travelerList.find((t) => t.id === s.traveler_id)
    if (!traveler) continue
    const list = travelersByMeal.get(s.meal_id) ?? []
    list.push(traveler)
    travelersByMeal.set(s.meal_id, list)
  }

  const bookingTitle =
    (booking.title as Record<string, string>)?.en ||
    (booking.title as Record<string, string>)?.es ||
    'Reserva'

  const list = (days ?? []) as DayWithMeals[]
  const totalMeals = list.reduce((sum, d) => sum + (d.meals?.length ?? 0), 0)

  const selectionList = (selections ?? []) as { meal_id: string; traveler_id: string }[]
  const pending = mealPending(list, travelerList, selectionList)
  const tally = mealTally(list, travelerList, selectionList)
  const anyChosen = tally.some((d) => d.courses.some((c) => c.meals.some((m) => m.eaters.length > 0)))

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
          Comidas por día
        </h1>
        <span className="rounded-full border border-[rgba(62,45,35,0.12)] bg-white px-3 py-1 text-xs text-[#7A7168]">
          {totalMeals} plato{totalMeals !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Alerta de comidas pendientes */}
      {travelerList.length > 0 && pending.expectedSlots > 0 && (
        pending.pendingSlots > 0 ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-amber-800">
              <AlertTriangle className="size-4 shrink-0" />
              Faltan {pending.pendingSlots} selección{pending.pendingSlots !== 1 ? 'es' : ''} de comida
            </p>
            <p className="mt-1 text-xs text-amber-700">
              {pending.pendingTravelers
                .map((r) => `${r.traveler.first_name} ${r.traveler.last_name} (${r.missing})`)
                .join(' · ')}
            </p>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-teal-800">
              <CheckCircle2 className="size-4 shrink-0" />
              Todos los viajeros ya eligieron sus comidas.
            </p>
          </div>
        )
      )}

      {/* Resumen para el restaurante */}
      {anyChosen && (
        <details className="mb-6 rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]" open>
          <summary className="cursor-pointer text-base font-medium text-[#3E2D23]">
            Resumen para el restaurante
          </summary>
          <p className="mt-1 text-xs text-[#7A7168]">
            Cuántos viajeros eligieron cada plato, por día. Ideal para ordenar de una.
          </p>
          <div className="mt-4 space-y-5">
            {tally.map(({ day, courses }) => (
              <div key={day.id}>
                <p className="text-sm font-semibold text-[#3E2D23]">
                  Día {day.day_number}
                  {day.title?.es || day.title?.en ? ` · ${day.title?.es || day.title?.en}` : ''}
                </p>
                <div className="mt-2 space-y-2">
                  {courses.map(({ course, meals }) => (
                    <div key={course}>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#7A7168]">
                        {COURSE_LABEL[course] ?? course}
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {meals.map(({ meal, eaters }) => (
                          <li key={meal.id} className="flex flex-wrap items-baseline gap-x-2 text-sm text-[#3E2D23]">
                            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#4A9A92]/10 px-2 text-xs font-semibold text-[#4A9A92]">
                              {eaters.length}
                            </span>
                            <span>{meal.name?.es || meal.name?.en || 'Sin nombre'}</span>
                            {eaters.length > 0 && (
                              <span className="text-xs text-[#7A7168]">
                                — {eaters.map((t) => t.first_name).join(', ')}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(62,45,35,0.2)] bg-white p-8 text-center">
          <p className="text-sm text-[#7A7168]">
            Esta reserva no tiene días de itinerario aún. Las comidas se asignan por día:
          </p>
          <Link
            href={`/${locale}/admin/bookings/${id}/journey`}
            className="mt-3 inline-block text-sm text-[#4A9A92] hover:underline"
          >
            Crear días del itinerario primero →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((day) => (
            <DayMeals
              key={day.id}
              day={day}
              bookingId={id}
              locale={locale}
              travelersByMeal={Object.fromEntries(travelersByMeal)}
              totalTravelers={travelerList.length}
            />
          ))}
        </div>
      )}
    </div>
  )
}
