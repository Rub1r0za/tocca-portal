'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const selectMealSchema = z.object({
  mealId: z.string().uuid(),
  travelerId: z.string().uuid(),
  bookingId: z.string().uuid(),
  course: z.enum(['starter', 'main', 'dessert']),
  journeyDayId: z.string().uuid(),
})

export async function selectMeal(input: z.infer<typeof selectMealSchema>) {
  const data = selectMealSchema.parse(input)
  const supabase = await createClient()

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
