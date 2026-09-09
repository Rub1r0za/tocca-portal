'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const selectMealSchema = z.object({
  mealId: z.string().uuid(),
  travelerId: z.string().uuid(),
  bookingId: z.string().uuid(),
  course: z.enum(['breakfast', 'lunch', 'dinner', 'starter', 'main', 'dessert']),
  journeyDayId: z.string().uuid(),
})

export async function selectMeal(input: z.infer<typeof selectMealSchema>) {
  const data = selectMealSchema.parse(input)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const [{ data: booking }, { data: traveler }, { data: meal }] = await Promise.all([
    supabase.from('bookings').select('id').eq('id', data.bookingId).eq('user_id', user.id).eq('status', 'approved').maybeSingle(),
    supabase.from('travelers').select('id, trip_number, meals_enabled').eq('id', data.travelerId).eq('booking_id', data.bookingId).maybeSingle(),
    supabase.from('meals').select('id, course, journey_days!inner(id, booking_id, trip_number)').eq('id', data.mealId).maybeSingle(),
  ])

  const mealDay = meal?.journey_days as unknown as { id: string; booking_id: string; trip_number: number } | null
  if (!booking || !traveler?.meals_enabled || !meal || meal.course !== data.course || !mealDay || mealDay.id !== data.journeyDayId || mealDay.booking_id !== data.bookingId || mealDay.trip_number !== (traveler.trip_number ?? 1)) {
    throw new Error('Meal selection is not available')
  }

  // Find and delete previous selection for same traveler + course + day
  const { data: existingMeals } = await supabase
    .from('meals')
    .select('id')
    .eq('journey_day_id', data.journeyDayId)
    .eq('course', data.course)

  if (existingMeals && existingMeals.length > 0) {
    const existingIds = existingMeals.map((m) => m.id)
    await supabase
      .from('meal_selections')
      .delete()
      .in('meal_id', existingIds)
      .eq('traveler_id', data.travelerId)
  }

  // Insert new selection (ignore duplicate if same meal re-selected)
  await supabase.from('meal_selections').upsert(
    {
      meal_id: data.mealId,
      traveler_id: data.travelerId,
      booking_id: data.bookingId,
    },
    { onConflict: 'meal_id,traveler_id', ignoreDuplicates: false }
  )

  revalidatePath('/[locale]/(portal)/meals', 'page')
}
