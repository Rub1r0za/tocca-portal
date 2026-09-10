import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { mutationFailure, type MutationResult } from '@/lib/portal-mutation'

// The catalog includes deterministic UUIDs created by our seed data (for
// example `f1000000-0000-0000-0000-000000000004`). PostgreSQL accepts these,
// but Zod 4's `.uuid()` rejects their version-0 nibble. Keep strict UUID-shape
// validation for catalog IDs without requiring an RFC-generated UUID version.
const catalogIdSchema = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
)

export const reservationSchema = z.object({
  requestId: z.string().uuid(),
  bookingId: z.string().uuid(),
  targetId: catalogIdSchema,
  travelerIds: z.array(z.string().uuid()).min(1).max(50),
  requestedDate: z.iso.date(),
  notes: z.string().max(4000).nullable().optional(),
})

export async function saveReservation(kind: 'activity' | 'wellness', input: z.infer<typeof reservationSchema>): Promise<MutationResult> {
  const parsed = reservationSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input' }
  const data = parsed.data
  const catalog = kind === 'activity' ? 'activities' : 'wellness_options'
  const table = kind === 'activity' ? 'activity_requests' : 'wellness_requests'
  const targetColumn = kind === 'activity' ? 'activity_id' : 'wellness_option_id'
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) return mutationFailure(`${kind}.auth`, authError)
    if (!user) return { ok: false, error: 'unauthorized' }
    const [booking, option, travelers] = await Promise.all([
      supabase.from('bookings').select('id').eq('id', data.bookingId).eq('user_id', user.id).eq('status', 'approved').maybeSingle(),
      supabase.from(catalog).select('*').eq('id', data.targetId).eq('active', true).maybeSingle(),
      supabase.from('travelers').select('id, trip_number').eq('booking_id', data.bookingId).in('id', data.travelerIds),
    ])
    const lookupError = booking.error ?? option.error ?? travelers.error
    if (lookupError) return mutationFailure(`${kind}.lookup`, lookupError)
    if (!booking.data || !option.data) return { ok: false, error: 'unavailable' }
    const travelerIds = [...new Set(data.travelerIds)].sort()
    if (travelers.data?.length !== travelerIds.length || travelers.data.some(t => (t.trip_number ?? 1) !== (option.data.trip_number ?? 1))) {
      return { ok: false, error: 'invalid_travelers' }
    }
    if (kind === 'activity' && option.data.capacity != null && travelerIds.length > option.data.capacity) {
      return { ok: false, error: 'invalid_travelers' }
    }
    const row = {
      id: data.requestId,
      booking_id: data.bookingId,
      [targetColumn]: data.targetId,
      traveler_ids: travelerIds,
      num_guests: travelerIds.length,
      requested_date: data.requestedDate,
      notes: data.notes ?? null,
    }
    const { error } = await supabase.from(table).insert(row)
    if (!error) return { ok: true }
    // The first response may have been lost. Confirm the exact request before
    // reporting success; the primary key prevents duplicate reservations.
    if (error.code === '23505') {
      const existing = await supabase.from(table).select('*').eq('id', data.requestId).eq('booking_id', data.bookingId).maybeSingle()
      const saved = existing.data
      if (!existing.error && saved && saved[targetColumn] === data.targetId && saved.requested_date === data.requestedDate && saved.notes === row.notes && JSON.stringify([...(saved.traveler_ids ?? [])].sort()) === JSON.stringify(travelerIds)) {
        return { ok: true }
      }
    }
    return mutationFailure(`${kind}.save`, error)
  } catch (error) {
    return mutationFailure(`${kind}.save`, error)
  }
}
