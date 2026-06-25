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

// ── Reservation requests (Free Day Activities booking flow) ──────────
const requestActivitySchema = z.object({
  bookingId: z.string().uuid(),
  activityId: z.string().uuid(),
  numGuests: z.number().int().min(1).max(50),
  requestedDate: z.string().min(1),
  notes: z.string().nullable().optional(),
})

export async function requestActivity(
  input: z.infer<typeof requestActivitySchema>
): Promise<{ ok: boolean; error?: string }> {
  const parsed = requestActivitySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input' }
  const data = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.from('activity_requests').insert({
    booking_id: data.bookingId,
    activity_id: data.activityId,
    num_guests: data.numGuests,
    requested_date: data.requestedDate,
    notes: data.notes ?? null,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/[locale]/(portal)/activities', 'page')
  return { ok: true }
}
