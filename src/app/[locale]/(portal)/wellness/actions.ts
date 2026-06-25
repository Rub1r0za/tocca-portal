'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const requestWellnessSchema = z.object({
  bookingId: z.string().uuid(),
  wellnessOptionId: z.string().uuid(),
  numGuests: z.number().int().min(1).max(50),
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
  const { error } = await supabase.from('wellness_requests').insert({
    booking_id: data.bookingId,
    wellness_option_id: data.wellnessOptionId,
    num_guests: data.numGuests,
    requested_date: data.requestedDate,
    notes: data.notes ?? null,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/[locale]/(portal)/wellness', 'page')
  return { ok: true }
}
