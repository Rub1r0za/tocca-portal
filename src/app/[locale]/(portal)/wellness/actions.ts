'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const requestWellnessSchema = z.object({
  bookingId: z.string().uuid(),
  wellnessOptionId: z.string().uuid(),
  travelerIds: z.array(z.string().uuid()).min(1).max(50),
  requestedDate: z.string().min(1),
  notes: z.string().nullable().optional(),
})

export async function requestWellness(
  input: z.infer<typeof requestWellnessSchema>
): Promise<{ ok: boolean; error?: string }> {
  const parsed = requestWellnessSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input' }
  const data = parsed.data

  const supabase = await createClient()

  // Los ids llegan del navegador: se aceptan solo los que de verdad son
  // viajeros de esta reserva, para que nadie apunte a gente de otro grupo.
  const [{ data: option }, { data: own }] = await Promise.all([
    supabase.from('wellness_options').select('trip_number').eq('id', data.wellnessOptionId).eq('active', true).maybeSingle(),
    supabase
    .from('travelers')
    .select('id, trip_number')
    .eq('booking_id', data.bookingId)
    .in('id', data.travelerIds),
  ])
  if (!option) return { ok: false, error: 'invalid_wellness' }
  const travelerIds = (own ?? [])
    .filter((traveler) => (traveler.trip_number ?? 1) === (option.trip_number ?? 1))
    .map((traveler) => traveler.id)
  if (travelerIds.length === 0) return { ok: false, error: 'invalid_travelers' }
  const { error } = await supabase.from('wellness_requests').insert({
    booking_id: data.bookingId,
    wellness_option_id: data.wellnessOptionId,
    traveler_ids: travelerIds,
    num_guests: travelerIds.length,
    requested_date: data.requestedDate,
    notes: data.notes ?? null,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/[locale]/(portal)/wellness', 'page')
  return { ok: true }
}
