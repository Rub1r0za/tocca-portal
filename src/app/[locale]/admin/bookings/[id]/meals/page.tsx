import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { DayMeals } from './day-meals'
import type { Meal } from './meal-form'
import type { Traveler } from '@/lib/types'

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
