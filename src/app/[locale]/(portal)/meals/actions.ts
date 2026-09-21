'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { mutationFailure, type MutationResult } from '@/lib/portal-mutation'

const selectMealSchema = z.object({
  mealId: z.string().uuid(),
  travelerId: z.string().uuid(),
  bookingId: z.string().uuid(),
  course: z.enum(['breakfast', 'lunch', 'dinner', 'starter', 'main', 'dessert']),
  journeyDayId: z.string().uuid(),
})

export async function selectMeal(input: z.infer<typeof selectMealSchema>): Promise<MutationResult> {
  const parsed = selectMealSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input' }
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) return mutationFailure('meal.auth', authError)
    if (!user) return { ok: false, error: 'unauthorized' }
    const data = parsed.data
    const { error } = await supabase.rpc('select_portal_meal', {
      p_meal_id: data.mealId,
      p_traveler_id: data.travelerId,
      p_booking_id: data.bookingId,
      p_journey_day_id: data.journeyDayId,
      p_course: data.course,
    })
    if (error) return mutationFailure('meal.save', error)
  } catch (error) {
    return mutationFailure('meal.save', error)
  }
  revalidatePath('/[locale]/(portal)/meals', 'page')
  return { ok: true }
}
