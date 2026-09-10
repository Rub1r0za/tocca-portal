'use server'

import { reservationSchema, saveReservation } from '@/lib/reservation-request'
import type { z } from 'zod'
import { revalidatePath } from 'next/cache'

export async function requestWellness(input: Omit<z.infer<typeof reservationSchema>, 'targetId'> & { wellnessOptionId: string }) {
  const result = await saveReservation('wellness', { ...input, targetId: input.wellnessOptionId })
  if (result.ok) revalidatePath('/[locale]/(portal)/wellness', 'page')
  return result
}
