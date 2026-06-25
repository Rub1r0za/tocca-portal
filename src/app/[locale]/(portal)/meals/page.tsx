import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { getMyBooking } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import type { Booking, Meal } from '@/lib/types'
import { AppHeader } from '@/components/app-header'
import { EmptyState } from '@/components/primitives'
import { MealDay } from './meal-day'

type DayWithMeals = {
  id: string
  day_number: number
  title: Record<string, string>
  meals: Meal[]
}

export default async function MealsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tSections = await getTranslations('sections')

  const booking = (await getMyBooking()) as Booking | null
  if (!booking) redirect(`/${locale}/login`)

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
  const travelers = booking.travelers ?? []

  const daysWithMeals = days.filter((d) => d.meals && d.meals.length > 0)

  return (
    <div>
      <AppHeader title={tSections('meals.title')} subtitle={tSections('meals.subtitle')} locale={locale} />
      <div className="space-y-8 px-5 py-6">
        {daysWithMeals.length === 0 ? (
          <EmptyState title={tSections('meals.empty')} />
        ) : (
          daysWithMeals.map((day) => (
            <MealDay
              key={day.id}
              day={day}
              travelers={travelers}
              selections={selections}
              bookingId={booking.id}
              locale={locale}
            />
          ))
        )}
      </div>
    </div>
  )
}
