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

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Bilingual jsonb: { en, es } with es falling back to en. */
function i18n(en?: string, es?: string) {
  return { en: en || '', es: es || en || '' }
}

/** Zip two per-line textareas into [{ en, es }] (es falls back to en line). */
function zipLines(en?: string, es?: string) {
  const enLines = (en || '').split('\n').map((l) => l.trim()).filter(Boolean)
  const esLines = (es || '').split('\n').map((l) => l.trim()).filter(Boolean)
  const len = Math.max(enLines.length, esLines.length)
  return Array.from({ length: len }, (_, i) => ({
    en: enLines[i] || esLines[i] || '',
    es: esLines[i] || enLines[i] || '',
  }))
}

// ── Activities (global catalog) ─────────────────────────────────────────────

const activitySchema = z.object({
  name_en: z.string().min(1),
  name_es: z.string().optional(),
  description_en: z.string().optional(),
  description_es: z.string().optional(),
  overview_en: z.string().optional(),
  overview_es: z.string().optional(),
  price: z.coerce.number().min(0).default(0),
  capacity: z.string().optional(),
  duration_en: z.string().optional(),
  duration_es: z.string().optional(),
  time_label_en: z.string().optional(),
  time_label_es: z.string().optional(),
  image_url: z.string().optional(),
  included_en: z.string().optional(),
  included_es: z.string().optional(),
  requirements_en: z.string().optional(),
  requirements_es: z.string().optional(),
  cancellation_en: z.string().optional(),
  cancellation_es: z.string().optional(),
})

export async function saveActivity(
  activityId: string | null,
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const raw = Object.fromEntries(formData)
  const parsed = activitySchema.safeParse(raw)
  if (!parsed.success) return { error: 'Datos inválidos' }
  const d = parsed.data

  const row = {
    name: i18n(d.name_en, d.name_es),
    description: i18n(d.description_en, d.description_es),
    overview: i18n(d.overview_en, d.overview_es),
    price: d.price,
    capacity: d.capacity ? parseInt(d.capacity, 10) : null,
    duration: i18n(d.duration_en, d.duration_es),
    time_label: i18n(d.time_label_en, d.time_label_es),
    image_url: d.image_url || null,
    included: zipLines(d.included_en, d.included_es),
    requirements: zipLines(d.requirements_en, d.requirements_es),
    cancellation_policy: i18n(d.cancellation_en, d.cancellation_es),
    updated_at: new Date().toISOString(),
  }

  const admin = createAdminClient()
  const { error } = activityId
    ? await admin.from('activities').update(row).eq('id', activityId)
    : await admin.from('activities').insert(row)

  if (error) return { error: error.message }
  revalidatePath(`/${locale}/admin/activities`)
  return {}
}

export async function toggleActivityActive(activityId: string, active: boolean, locale: string) {
  const admin = createAdminClient()
  await admin.from('activities').update({ active, updated_at: new Date().toISOString() }).eq('id', activityId)
  revalidatePath(`/${locale}/admin/activities`)
}

export async function deleteActivity(activityId: string, locale: string) {
  const admin = createAdminClient()
  await admin.from('activities').delete().eq('id', activityId)
  revalidatePath(`/${locale}/admin/activities`)
}

// ── Wellness options (global catalog) ───────────────────────────────────────

const wellnessSchema = z.object({
  name_en: z.string().min(1),
  name_es: z.string().optional(),
  description_en: z.string().optional(),
  description_es: z.string().optional(),
  duration_en: z.string().optional(),
  duration_es: z.string().optional(),
  price: z.string().optional(),
  image_url: z.string().optional(),
})

export async function saveWellnessOption(
  optionId: string | null,
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const raw = Object.fromEntries(formData)
  const parsed = wellnessSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Datos inválidos' }
  const d = parsed.data

  const row = {
    name: i18n(d.name_en, d.name_es),
    description: i18n(d.description_en, d.description_es),
    duration: i18n(d.duration_en, d.duration_es),
    price: d.price ? parseFloat(d.price) : null, // null = "a consultar"
    image_url: d.image_url || null,
  }

  const admin = createAdminClient()
  const { error } = optionId
    ? await admin.from('wellness_options').update(row).eq('id', optionId)
    : await admin.from('wellness_options').insert(row)

  if (error) return { error: error.message }
  revalidatePath(`/${locale}/admin/wellness`)
  return {}
}

export async function toggleWellnessActive(optionId: string, active: boolean, locale: string) {
  const admin = createAdminClient()
  await admin.from('wellness_options').update({ active }).eq('id', optionId)
  revalidatePath(`/${locale}/admin/wellness`)
}

export async function deleteWellnessOption(optionId: string, locale: string) {
  const admin = createAdminClient()
  await admin.from('wellness_options').delete().eq('id', optionId)
  revalidatePath(`/${locale}/admin/wellness`)
}

// ── Client requests (activities + wellness) ─────────────────────────────────

const REQUEST_STATUSES = ['pending', 'confirmed', 'declined', 'cancelled'] as const

export async function updateRequestStatus(
  kind: 'activity' | 'wellness',
  requestId: string,
  status: string,
  locale: string,
) {
  if (!REQUEST_STATUSES.includes(status as (typeof REQUEST_STATUSES)[number])) return

  const table = kind === 'activity' ? 'activity_requests' : 'wellness_requests'
  const admin = createAdminClient()
  await admin.from(table).update({ status }).eq('id', requestId)
  revalidatePath(`/${locale}/admin/requests`)
}

// ── Timeline events (per booking) ───────────────────────────────────────────

const timelineEventSchema = z.object({
  sort_order: z.coerce.number().int().default(0),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  type: z.enum(['flight', 'transfer', 'experience', 'accommodation', 'meal', 'leisure']),
  title_en: z.string().min(1),
  title_es: z.string().optional(),
  description_en: z.string().optional(),
  description_es: z.string().optional(),
  location: z.string().optional(),
})

export async function saveTimelineEvent(
  eventId: string | null,
  bookingId: string,
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const raw = Object.fromEntries(formData)
  const parsed = timelineEventSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Datos inválidos' }
  const d = parsed.data

  const row = {
    booking_id: bookingId,
    sort_order: d.sort_order,
    event_date: d.event_date || null,
    event_time: d.event_time || null,
    type: d.type,
    title: i18n(d.title_en, d.title_es),
    description: i18n(d.description_en, d.description_es),
    location: d.location || null,
  }

  const admin = createAdminClient()
  const { error } = eventId
    ? await admin.from('timeline_events').update(row).eq('id', eventId)
    : await admin.from('timeline_events').insert(row)

  if (error) return { error: error.message }
  revalidatePath(`/${locale}/admin/bookings/${bookingId}/timeline`)
  return {}
}

export async function deleteTimelineEvent(eventId: string, bookingId: string, locale: string) {
  const admin = createAdminClient()
  await admin.from('timeline_events').delete().eq('id', eventId)
  revalidatePath(`/${locale}/admin/bookings/${bookingId}/timeline`)
}

// ── Meals (per journey day) ─────────────────────────────────────────────────

const mealSchema = z.object({
  course: z.enum(['starter', 'main', 'dessert']),
  name_en: z.string().min(1),
  name_es: z.string().optional(),
  description_en: z.string().optional(),
  description_es: z.string().optional(),
  allergens: z.string().optional(),
  image_url: z.string().optional(),
})

export async function saveMeal(
  mealId: string | null,
  journeyDayId: string,
  bookingId: string,
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const raw = Object.fromEntries(formData)
  const parsed = mealSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Datos inválidos' }
  const d = parsed.data

  const row = {
    journey_day_id: journeyDayId,
    course: d.course,
    name: i18n(d.name_en, d.name_es),
    description: i18n(d.description_en, d.description_es),
    allergens: d.allergens || null,
    image_url: d.image_url || null,
  }

  const admin = createAdminClient()
  const { error } = mealId
    ? await admin.from('meals').update(row).eq('id', mealId)
    : await admin.from('meals').insert(row)

  if (error) return { error: error.message }
  revalidatePath(`/${locale}/admin/bookings/${bookingId}/meals`)
  return {}
}

export async function deleteMeal(mealId: string, bookingId: string, locale: string) {
  const admin = createAdminClient()
  await admin.from('meals').delete().eq('id', mealId)
  revalidatePath(`/${locale}/admin/bookings/${bookingId}/meals`)
}
