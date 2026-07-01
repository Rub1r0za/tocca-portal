'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// ── Create booking ─────────────────────────────────────────────────────────

const createBookingSchema = z.object({
  email: z.string().email(),
  title_en: z.string().min(1),
  title_es: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  notes: z.string().optional(),
})

export async function createBooking(
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const raw = Object.fromEntries(formData)
  const parsed = createBookingSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Datos inválidos' }

  const { email, title_en, title_es, start_date, end_date, notes } = parsed.data
  const admin = createAdminClient()

  // Find user by email
  const { data: { users }, error: listErr } = await admin.auth.admin.listUsers()
  if (listErr) return { error: listErr.message }

  const authUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (!authUser) return { error: `No hay usuario con el email "${email}". El cliente debe registrarse primero.` }

  // Upsert profile (in case trigger didn't fire)
  await admin.from('profiles').upsert({ id: authUser.id }, { onConflict: 'id', ignoreDuplicates: true })

  const { data: booking, error } = await admin
    .from('bookings')
    .insert({
      user_id: authUser.id,
      title: { en: title_en, es: title_es || title_en },
      start_date: start_date || null,
      end_date: end_date || null,
      notes: notes || null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/${locale}/admin`)
  redirect(`/${locale}/admin/bookings/${booking.id}`)
}

// ── Update booking ──────────────────────────────────────────────────────────

export async function updateBookingStatus(
  bookingId: string,
  locale: string,
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  const status = formData.get('status') as string
  if (!['pending', 'approved', 'cancelled'].includes(status)) return { error: 'Estado inválido' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (error) return { error: error.message }

  revalidatePath(`/${locale}/admin/bookings/${bookingId}`)
  return {}
}

export async function updateBookingDates(
  bookingId: string,
  locale: string,
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  const admin = createAdminClient()
  const { error } = await admin
    .from('bookings')
    .update({ start_date: start_date || null, end_date: end_date || null, updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (error) return { error: error.message }

  revalidatePath(`/${locale}/admin/bookings/${bookingId}`)
  return {}
}

export async function updateBookingNotes(
  bookingId: string,
  locale: string,
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  const notes = formData.get('notes') as string

  const admin = createAdminClient()
  const { error } = await admin
    .from('bookings')
    .update({ notes: notes || null, updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (error) return { error: error.message }

  revalidatePath(`/${locale}/admin/bookings/${bookingId}`)
  return {}
}

// ── Travelers ───────────────────────────────────────────────────────────────

const travelerSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  type: z.enum(['adult', 'child']).default('adult'),
  dietary_restrictions: z.string().optional(),
})

export async function addTraveler(
  bookingId: string,
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const raw = Object.fromEntries(formData)
  const parsed = travelerSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Datos inválidos' }

  const admin = createAdminClient()
  const { error } = await admin.from('travelers').insert({
    booking_id: bookingId,
    ...parsed.data,
    dietary_restrictions: parsed.data.dietary_restrictions || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/${locale}/admin/bookings/${bookingId}`)
  return {}
}

export async function deleteTraveler(travelerId: string, locale: string, bookingId: string) {
  const admin = createAdminClient()
  await admin.from('travelers').delete().eq('id', travelerId)
  revalidatePath(`/${locale}/admin/bookings/${bookingId}`)
}

// ── Journey days ────────────────────────────────────────────────────────────

const daySchema = z.object({
  day_number: z.coerce.number().int().min(1),
  title_en: z.string().min(1),
  title_es: z.string().optional(),
  description_en: z.string().optional(),
  description_es: z.string().optional(),
  location: z.string().optional(),
  day_date: z.string().optional(),
})

export async function createJourneyDay(
  bookingId: string,
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const raw = Object.fromEntries(formData)
  const parsed = daySchema.safeParse(raw)
  if (!parsed.success) return { error: 'Datos inválidos' }

  const { day_number, title_en, title_es, description_en, description_es, location, day_date } = parsed.data
  const admin = createAdminClient()

  const { error } = await admin.from('journey_days').insert({
    booking_id: bookingId,
    day_number,
    title: { en: title_en, es: title_es || title_en },
    description: { en: description_en || '', es: description_es || description_en || '' },
    location: location || null,
    day_date: day_date || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/${locale}/admin/bookings/${bookingId}/journey`)
  return {}
}

export async function updateJourneyDay(
  dayId: string,
  bookingId: string,
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const raw = Object.fromEntries(formData)
  const parsed = daySchema.safeParse(raw)
  if (!parsed.success) return { error: 'Datos inválidos' }

  const { day_number, title_en, title_es, description_en, description_es, location, day_date } = parsed.data
  const admin = createAdminClient()

  const { error } = await admin.from('journey_days').update({
    day_number,
    title: { en: title_en, es: title_es || title_en },
    description: { en: description_en || '', es: description_es || description_en || '' },
    location: location || null,
    day_date: day_date || null,
  }).eq('id', dayId)

  if (error) return { error: error.message }

  revalidatePath(`/${locale}/admin/bookings/${bookingId}/journey`)
  return {}
}

export async function deleteJourneyDay(dayId: string, bookingId: string, locale: string) {
  const admin = createAdminClient()
  await admin.from('journey_days').delete().eq('id', dayId)
  revalidatePath(`/${locale}/admin/bookings/${bookingId}/journey`)
}
