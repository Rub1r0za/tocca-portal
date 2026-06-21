import { createClient } from './supabase/server'

export async function getMyBooking() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      travelers (*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return booking
}
