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
  travelerIds: z.array(z.string().uuid()).min(1).max(50),
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

  // Los ids llegan del navegador: se aceptan solo los que de verdad son
  // viajeros de esta reserva, para que nadie apunte a gente de otro grupo.
  const [{ data: activity }, { data: own }] = await Promise.all([
    supabase.from('activities').select('trip_number').eq('id', data.activityId).eq('active', true).maybeSingle(),
    supabase
    .from('travelers')
    .select('id, trip_number')
    .eq('booking_id', data.bookingId)
    .in('id', data.travelerIds),
  ])
  if (!activity) return { ok: false, error: 'invalid_activity' }
  const travelerIds = (own ?? [])
    .filter((traveler) => (traveler.trip_number ?? 1) === (activity.trip_number ?? 1))
    .map((traveler) => traveler.id)
  if (travelerIds.length === 0) return { ok: false, error: 'invalid_travelers' }
  const { error } = await supabase.from('activity_requests').insert({
    booking_id: data.bookingId,
    activity_id: data.activityId,
    traveler_ids: travelerIds,
    num_guests: travelerIds.length,
    requested_date: data.requestedDate,
    notes: data.notes ?? null,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/[locale]/(portal)/activities', 'page')
  return { ok: true }
}
