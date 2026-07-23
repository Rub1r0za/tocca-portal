'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { sendEmail, emailLayout } from '@/lib/email'

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
  const { data: prev } = await admin.from('bookings').select('status').eq('id', bookingId).maybeSingle()
  const { data: updated, error } = await admin
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select('applicant_email, applicant_name')
    .single()

  if (error) return { error: error.message }

  // Correo automático de confirmación al aprobar
  if (status === 'approved' && prev?.status !== 'approved' && updated?.applicant_email) {
    await sendEmail({
      to: updated.applicant_email,
      subject: '¡Tu viaje está confirmado! — Tocca Amalfi Coast',
      html: emailLayout(
        'Benvenuti in Costiera Amalfitana ✨',
        `<p>Hola ${updated.applicant_name || ''},</p>
         <p>Tu reserva fue <strong>aprobada</strong>. Ya tienes acceso completo al portal de tu viaje: itinerario día a día, selección de comidas, experiencias opcionales y wellness.</p>
         <p style="margin-top:20px;"><a href="https://tocca-portal.vercel.app/es/login" style="background:#23374D;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;">Entrar a mi portal →</a></p>`,
      ),
    })
  }

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

export async function deleteBooking(bookingId: string, locale: string) {
  const admin = createAdminClient()
  // Cascade FKs remove travelers, journey_days, meals and selections.
  await admin.from('bookings').delete().eq('id', bookingId)
  revalidatePath(`/${locale}/admin`)
  redirect(`/${locale}/admin`)
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
  day_vibe_en: z.string().optional(),
  day_vibe_es: z.string().optional(),
  tocca_tips_en: z.string().optional(),
  tocca_tips_es: z.string().optional(),
  good_to_know_en: z.string().optional(),
  good_to_know_es: z.string().optional(),
  is_free_day: z.string().optional(),
})

function dayPayload(d: z.infer<typeof daySchema>) {
  return {
    day_number: d.day_number,
    title: i18n(d.title_en, d.title_es),
    description: i18n(d.description_en, d.description_es),
    location: d.location || null,
    day_date: d.day_date || null,
    day_vibe: i18n(d.day_vibe_en, d.day_vibe_es),
    tocca_tips: zipLines(d.tocca_tips_en, d.tocca_tips_es),
    good_to_know: zipLines(d.good_to_know_en, d.good_to_know_es),
    is_free_day: d.is_free_day === 'on',
  }
}

export async function createJourneyDay(
  bookingId: string,
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const raw = Object.fromEntries(formData)
  const parsed = daySchema.safeParse(raw)
  if (!parsed.success) return { error: 'Datos inválidos' }

  const admin = createAdminClient()

  const { error } = await admin.from('journey_days').insert({
    booking_id: bookingId,
    ...dayPayload(parsed.data),
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

  const admin = createAdminClient()

  const { error } = await admin.from('journey_days').update(dayPayload(parsed.data)).eq('id', dayId)

  if (error) return { error: error.message }

  revalidatePath(`/${locale}/admin/bookings/${bookingId}/journey`)
  return {}
}

export async function deleteJourneyDay(dayId: string, bookingId: string, locale: string) {
  const admin = createAdminClient()
  await admin.from('journey_days').delete().eq('id', dayId)
  revalidatePath(`/${locale}/admin/bookings/${bookingId}/journey`)
}

// ── Create client account (direct, no email required) ──────────────────────

const createClientSchema = z.object({
  email: z.string().email(),
  full_name: z.string().optional(),
  password: z.string().min(8),
})

export async function createClientUser(
  locale: string,
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const raw = Object.fromEntries(formData)
  const parsed = createClientSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Datos inválidos: revisa el email y que la contraseña tenga al menos 8 caracteres.' }
  }

  const { email, full_name, password } = parsed.data
  const admin = createAdminClient()

  // email_confirm: true → the account is active immediately, no confirmation email
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: full_name ? { full_name } : undefined,
  })

  if (error) {
    if (error.message.toLowerCase().includes('already') || error.code === 'email_exists') {
      return { error: `Ya existe una cuenta con el email "${email}".` }
    }
    return { error: error.message }
  }

  await admin
    .from('profiles')
    .upsert({ id: data.user.id, full_name: full_name || null }, { onConflict: 'id' })

  revalidatePath(`/${locale}/admin`)
  return { ok: true }
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

const MEAL_FIELD_LABEL: Record<string, string> = {
  course: 'Plato',
  name_en: 'Nombre EN',
  name_es: 'Nombre ES',
  description_en: 'Descripción EN',
  description_es: 'Descripción ES',
  allergens: 'Alérgenos',
  image_url: 'Imagen (URL)',
}

function describeMealError(error: z.ZodError<z.infer<typeof mealSchema>>): string {
  const fields = Object.keys(error.flatten().fieldErrors)
    .map((f) => MEAL_FIELD_LABEL[f] ?? f)
  return fields.length > 0
    ? `Revisá este campo: ${fields.join(', ')}`
    : 'Datos inválidos'
}

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
  if (!parsed.success) return { error: describeMealError(parsed.error) }
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

// ── Day templates (Signature Journey library) ───────────────────────────────

const dayTemplateSchema = z.object({
  sort_order: z.coerce.number().int().min(0).default(0),
  title_en: z.string().min(1),
  title_es: z.string().optional(),
  description_en: z.string().optional(),
  description_es: z.string().optional(),
  location: z.string().optional(),
  image_url: z.string().optional(),
  day_vibe_en: z.string().optional(),
  day_vibe_es: z.string().optional(),
  tocca_tips_en: z.string().optional(),
  tocca_tips_es: z.string().optional(),
  good_to_know_en: z.string().optional(),
  good_to_know_es: z.string().optional(),
  schedule_en: z.string().optional(),
  schedule_es: z.string().optional(),
  is_free_day: z.string().optional(),
})

/** Zip "HH:MM | texto" per-line textareas into [{ time, title: {en, es} }]. */
function zipSchedule(en?: string, es?: string) {
  const parse = (raw?: string) =>
    (raw || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const sep = l.indexOf('|')
        return sep === -1
          ? { time: '', text: l }
          : { time: l.slice(0, sep).trim(), text: l.slice(sep + 1).trim() }
      })
  const enItems = parse(en)
  const esItems = parse(es)
  const len = Math.max(enItems.length, esItems.length)
  return Array.from({ length: len }, (_, i) => ({
    time: enItems[i]?.time || esItems[i]?.time || '',
    title: {
      en: enItems[i]?.text || esItems[i]?.text || '',
      es: esItems[i]?.text || enItems[i]?.text || '',
    },
  }))
}

export async function saveDayTemplate(
  templateId: string | null,
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const parsed = dayTemplateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Datos inválidos: revisa el título EN.' }

  const d = parsed.data
  const payload = {
    sort_order: d.sort_order,
    title: i18n(d.title_en, d.title_es),
    description: i18n(d.description_en, d.description_es),
    location: d.location || null,
    image_url: d.image_url || null,
    day_vibe: i18n(d.day_vibe_en, d.day_vibe_es),
    tocca_tips: zipLines(d.tocca_tips_en, d.tocca_tips_es),
    good_to_know: zipLines(d.good_to_know_en, d.good_to_know_es),
    schedule: zipSchedule(d.schedule_en, d.schedule_es),
    is_free_day: d.is_free_day === 'on',
    updated_at: new Date().toISOString(),
  }

  const admin = createAdminClient()
  const { error } = templateId
    ? await admin.from('day_templates').update(payload).eq('id', templateId)
    : await admin.from('day_templates').insert(payload)

  if (error) return { error: error.message }

  revalidatePath(`/${locale}/admin/days`)
  return {}
}

export async function deleteDayTemplate(templateId: string, locale: string) {
  const admin = createAdminClient()
  await admin.from('day_templates').delete().eq('id', templateId)
  revalidatePath(`/${locale}/admin/days`)
}

export async function toggleDayTemplateActive(templateId: string, active: boolean, locale: string) {
  const admin = createAdminClient()
  await admin.from('day_templates').update({ active }).eq('id', templateId)
  revalidatePath(`/${locale}/admin/days`)
}

// Copia una plantilla como día de una reserva; los menús de la plantilla
// se convierten en filas de `meals` para que el cliente pueda seleccionar.
async function instantiateTemplate(
  admin: ReturnType<typeof createAdminClient>,
  template: Record<string, unknown>,
  bookingId: string,
  dayNumber: number,
) {
  const { data: day, error } = await admin
    .from('journey_days')
    .insert({
      booking_id: bookingId,
      day_number: dayNumber,
      title: template.title,
      description: template.description,
      location: template.location,
      image_url: template.image_url,
      schedule: template.schedule,
      included: template.included,
      meeting_point: template.meeting_point,
      day_notes: template.day_notes,
      tocca_tips: template.tocca_tips,
      good_to_know: template.good_to_know,
      day_vibe: template.day_vibe,
      is_free_day: template.is_free_day,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  const meals = (template.meals ?? []) as Array<{
    course: string
    name: Record<string, string>
    description?: Record<string, string>
  }>
  if (meals.length > 0) {
    const { error: mealErr } = await admin.from('meals').insert(
      meals.map((m) => ({
        journey_day_id: day.id,
        course: m.course,
        name: m.name,
        description: m.description ?? {},
      })),
    )
    if (mealErr) return { error: mealErr.message }
  }
  return {}
}

export async function addTemplateDayToBooking(
  bookingId: string,
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const templateId = formData.get('template_id') as string
  if (!templateId) return { error: 'Elige una plantilla.' }

  const admin = createAdminClient()
  const { data: template } = await admin.from('day_templates').select('*').eq('id', templateId).maybeSingle()
  if (!template) return { error: 'Plantilla no encontrada.' }

  const { data: days } = await admin
    .from('journey_days')
    .select('day_number')
    .eq('booking_id', bookingId)
    .order('day_number', { ascending: false })
    .limit(1)
  const nextNumber = (days?.[0]?.day_number ?? 0) + 1

  const result = await instantiateTemplate(admin, template, bookingId, nextNumber)
  if (result.error) return result

  revalidatePath(`/${locale}/admin/bookings/${bookingId}/journey`)
  return {}
}

export async function addFullJourneyToBooking(
  bookingId: string,
  locale: string,
  _prev: { error?: string } | null,
  _formData: FormData,
): Promise<{ error?: string }> {
  const admin = createAdminClient()
  const { data: templates } = await admin
    .from('day_templates')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (!templates || templates.length === 0) return { error: 'No hay plantillas de día activas.' }

  const { data: days } = await admin
    .from('journey_days')
    .select('day_number')
    .eq('booking_id', bookingId)
    .order('day_number', { ascending: false })
    .limit(1)
  let nextNumber = (days?.[0]?.day_number ?? 0) + 1

  for (const template of templates) {
    const result = await instantiateTemplate(admin, template, bookingId, nextNumber)
    if (result.error) return { error: `Día ${nextNumber}: ${result.error}` }
    nextNumber += 1
  }

  revalidatePath(`/${locale}/admin/bookings/${bookingId}/journey`)
  return {}
}

// ── Pagos y cronograma ──────────────────────────────────────────────────────

export async function setBookingTotal(
  bookingId: string,
  locale: string,
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  const raw = String(formData.get('total_price') || '').trim()
  const total = raw === '' ? null : Number(raw)
  if (total !== null && (!Number.isFinite(total) || total < 0)) return { error: 'Monto inválido' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('bookings')
    .update({ total_price: total, updated_at: new Date().toISOString() })
    .eq('id', bookingId)
  if (error) return { error: error.message }

  revalidatePath(`/${locale}/admin/bookings/${bookingId}/payments`)
  return {}
}

export async function addScheduleItem(
  bookingId: string,
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const due_date = String(formData.get('due_date') || '')
  const amount = Number(formData.get('amount'))
  const label_es = String(formData.get('label_es') || '').trim()
  const label_en = String(formData.get('label_en') || '').trim()
  if (!due_date || !Number.isFinite(amount) || amount <= 0) return { error: 'Fecha y monto son obligatorios' }

  const admin = createAdminClient()
  const { error } = await admin.from('payment_schedule').insert({
    booking_id: bookingId,
    due_date,
    amount,
    label: i18n(label_en || label_es, label_es || label_en),
  })
  if (error) return { error: error.message }

  revalidatePath(`/${locale}/admin/bookings/${bookingId}/payments`)
  return {}
}

export async function deleteScheduleItem(itemId: string, bookingId: string, locale: string) {
  const admin = createAdminClient()
  await admin.from('payment_schedule').delete().eq('id', itemId)
  revalidatePath(`/${locale}/admin/bookings/${bookingId}/payments`)
}

export async function toggleSchedulePaid(itemId: string, paid: boolean, bookingId: string, locale: string) {
  const admin = createAdminClient()
  await admin.from('payment_schedule').update({ paid }).eq('id', itemId)
  revalidatePath(`/${locale}/admin/bookings/${bookingId}/payments`)
}

export async function reviewPayment(
  paymentId: string,
  status: 'approved' | 'rejected',
  locale: string,
) {
  const admin = createAdminClient()
  const { data: payment } = await admin
    .from('payments')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select('amount, booking_id, bookings(applicant_email, applicant_name)')
    .single()

  if (payment && status === 'approved') {
    const bookingInfo = payment.bookings as unknown as { applicant_email: string | null; applicant_name: string | null } | null
    if (bookingInfo?.applicant_email) {
      await sendEmail({
        to: bookingInfo.applicant_email,
        subject: 'Pago confirmado — Tocca Amalfi Coast',
        html: emailLayout(
          'Pago confirmado',
          `<p>Hola ${bookingInfo.applicant_name || ''},</p>
           <p>Tu pago de <strong>USD $${Number(payment.amount).toFixed(2)}</strong> fue revisado y aprobado. ¡Gracias!</p>
           <p><a href="https://tocca-portal.vercel.app/es/payments" style="color:#4A9A92;">Ver mis pagos →</a></p>`,
        ),
      })
    }
  }

  revalidatePath(`/${locale}/admin/payments`)
  if (payment) revalidatePath(`/${locale}/admin/bookings/${payment.booking_id}/payments`)
}
