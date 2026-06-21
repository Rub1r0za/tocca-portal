'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const toggleSchema = z.object({
  activityId: z.string().uuid(),
  travelerId: z.string().uuid(),
  bookingId: z.string().uuid(),
  selected: z.boolean(),
})

export async function toggleActivity(input: z.infer<typeof toggleSchema>) {
  const data = toggleSchema.parse(input)
  const supabase = await createClient()

  if (data.selected) {
    await supabase.from('activity_selections').upsert(
      {
        activity_id: data.activityId,
        traveler_id: data.travelerId,
        booking_id: data.bookingId,
      },
      { onConflict: 'activity_id,traveler_id', ignoreDuplicates: true }
    )
  } else {
    await supabase
      .from('activity_selections')
      .delete()
      .eq('activity_id', data.activityId)
      .eq('traveler_id', data.travelerId)
  }

  revalidatePath('/[locale]/(portal)/activities', 'page')
}
