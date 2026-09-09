import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { MEALS_ENABLED } from '@/lib/features'
import { getMyBooking } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import type { Booking, Meal } from '@/lib/types'
import { AppHeader } from '@/components/app-header'
import { EmptyState } from '@/components/primitives'
import { MealsList } from './meals-list'

type DayWithMeals = {
  id: string
  day_number: number
  title: Record<string, string>
  meals: Meal[]
  trip_number: 1 | 2 | 3
  menu_image_url: string | null
}

export default async function MealsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Comidas está apagado hasta que estén los menús definitivos (src/lib/features.ts).
  if (!MEALS_ENABLED) redirect(`/${locale}/dashboard`)

  const tSections = await getTranslations('sections')

  const booking = (await getMyBooking()) as Booking | null
  if (!booking) redirect(`/${locale}/dashboard`)

  const supabase = await createClient()
  const { data } = await supabase
    .from('journey_days')
    .select('*, meals (*)')
    .eq('booking_id', booking.id)
    .order('day_number', { ascending: true })

  const { data: selectionData } = await supabase
    .from('meal_selections')
    .select('meal_id, traveler_id')
    .eq('booking_id', booking.id)

  const days = (data ?? []) as DayWithMeals[]
  const selections = (selectionData ?? []) as { meal_id: string; traveler_id: string }[]
  const travelers = (booking.travelers ?? []).filter((traveler) => traveler.meals_enabled)
  if (travelers.length === 0) redirect(`/${locale}/dashboard`)

  const daysWithMeals = days.filter(
    (day) =>
      ((day.meals && day.meals.length > 0) || day.menu_image_url) &&
      travelers.some((traveler) => (traveler.trip_number ?? 1) === (day.trip_number ?? 1)),
  )

  return (
    <div>
      <AppHeader title={tSections('meals.title')} subtitle={tSections('meals.subtitle')} locale={locale} />
      <div className="space-y-8 px-5 py-6">
        {daysWithMeals.length === 0 ? (
          <EmptyState title={tSections('meals.empty')} />
        ) : (
          <MealsList
            days={daysWithMeals.map((day) => ({
              day,
              travelers: travelers.filter((traveler) => (traveler.trip_number ?? 1) === (day.trip_number ?? 1)),
            }))}
            selections={selections}
            bookingId={booking.id}
            locale={locale}
          />
        )}
      </div>
    </div>
  )
}
