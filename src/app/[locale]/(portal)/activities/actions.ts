'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { reservationSchema, saveReservation } from '@/lib/reservation-request'
import { mutationFailure } from '@/lib/portal-mutation'

export async function requestActivity(input: Omit<z.infer<typeof reservationSchema>, 'targetId'> & { activityId: string }) {
  const result = await saveReservation('activity', { ...input, targetId: input.activityId })
  if (result.ok) revalidatePath('/[locale]/(portal)/activities', 'page')
  return result
}

export async function toggleActivity(input: { activityId: string; travelerId: string; bookingId: string; selected: boolean }) {
  const parsed = z.object({ activityId: z.string().uuid(), travelerId: z.string().uuid(), bookingId: z.string().uuid(), selected: z.boolean() }).safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input' }
  try {
    const data = parsed.data
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) return mutationFailure('activity.auth', authError)
    if (!user) return { ok: false, error: 'unauthorized' }
    const [booking, traveler, activity] = await Promise.all([
      supabase.from('bookings').select('id').eq('id', data.bookingId).eq('user_id', user.id).eq('status', 'approved').maybeSingle(),
      supabase.from('travelers').select('trip_number').eq('id', data.travelerId).eq('booking_id', data.bookingId).maybeSingle(),
      supabase.from('activities').select('trip_number').eq('id', data.activityId).eq('active', true).maybeSingle(),
    ])
    const lookupError = booking.error ?? traveler.error ?? activity.error
    if (lookupError) return mutationFailure('activity.lookup', lookupError)
    if (!booking.data || !traveler.data || !activity.data || traveler.data.trip_number !== activity.data.trip_number) return { ok: false, error: 'unavailable' }
    const { error } = data.selected
      ? await supabase.from('activity_selections').upsert({ activity_id: data.activityId, traveler_id: data.travelerId, booking_id: data.bookingId }, { onConflict: 'activity_id,traveler_id', ignoreDuplicates: true })
      : await supabase.from('activity_selections').delete().eq('activity_id', data.activityId).eq('traveler_id', data.travelerId).eq('booking_id', data.bookingId)
    if (error) return mutationFailure('activity.toggle', error)
  } catch (error) {
    return mutationFailure('activity.toggle', error)
  }
  revalidatePath('/[locale]/(portal)/activities', 'page')
  return { ok: true }
}
