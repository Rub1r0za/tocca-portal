// Shared data types for the Tocca guest app.
// These mirror the Supabase schema (schema.sql) + the guest-app migration.

/** A localized jsonb value, e.g. { en: "...", es: "..." }. */
export type Localized = Record<string, string>

export type BookingStatus = 'pending' | 'approved' | 'cancelled'
export type MealCourse = 'starter' | 'main' | 'dessert'
export type RequestStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled'
export type LeadStatus = 'potential' | 'client' | 'past'

export type Lead = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  source: string | null
  instagram_handle: string | null
  birthday: string | null
  status: LeadStatus
  notes: string | null
  created_at: string
  updated_at: string
}
export type TimelineEventType =
  | 'flight'
  | 'transfer'
  | 'experience'
  | 'accommodation'
  | 'meal'
  | 'leisure'

export type Traveler = {
  id: string
  booking_id: string
  type: 'adult' | 'child'
  first_name: string
  last_name: string
  dietary_restrictions: string | null
  notes: string | null
  trip_number: 1 | 2
}

export type Booking = {
  id: string
  user_id: string
  status: BookingStatus
  type: 'individual' | 'group'
  title: Localized | null
  description: Localized | null
  start_date: string | null
  end_date: string | null
  applicant_name: string | null
  applicant_email: string | null
  applicant_phone: string | null
  notes: string | null
  total_price: number | null
  terms_accepted_at: string | null
  travelers: Traveler[] | null
}

export type PaymentMethod = 'zelle' | 'transfer' | 'stripe' | 'other'
export type PaymentStatus = 'pending_review' | 'approved' | 'rejected'

export type Payment = {
  id: string
  booking_id: string
  amount: number
  /** Cargo de servicio por tarjeta; no cuenta contra el total del viaje. */
  fee_amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  reference: string | null
  receipt_path: string | null
  notes: string | null
  created_at: string
  reviewed_at: string | null
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
}

export type PaymentScheduleItem = {
  id: string
  booking_id: string
  due_date: string
  amount: number
  label: Localized | null
  paid: boolean
}

export type ScheduleItem = {
  time: string
  title: Localized
}

export type JourneyDay = {
  id: string
  booking_id: string
  day_number: number
  title: Localized | null
  description: Localized | null
  location: string | null
  image_url: string | null
  day_date: string | null
  schedule: ScheduleItem[] | null
  included: Localized[] | null
  meeting_point: Localized | null
  day_notes: Localized | null
  gallery: string[] | null
  tocca_tips: Localized[] | null
  good_to_know: Localized[] | null
  day_vibe: Localized | null
  is_free_day: boolean
  trip_number: 1 | 2
}

export type TemplateMeal = {
  course: MealCourse
  name: Localized
  description: Localized
}

export type DayTemplate = {
  id: string
  sort_order: number
  title: Localized | null
  description: Localized | null
  location: string | null
  image_url: string | null
  schedule: ScheduleItem[] | null
  included: Localized[] | null
  meeting_point: Localized | null
  day_notes: Localized | null
  tocca_tips: Localized[] | null
  good_to_know: Localized[] | null
  day_vibe: Localized | null
  is_free_day: boolean
  meals: TemplateMeal[] | null
  active: boolean
  trip_number: 1 | 2
}

export type Meal = {
  id: string
  journey_day_id: string
  course: MealCourse
  name: Localized | null
  description: Localized | null
  allergens: string | null
  image_url: string | null
}

export type Activity = {
  id: string
  /** Orden en el catálogo; lo mueve Jess con las flechas del panel. */
  sort_order: number
  name: Localized | null
  description: Localized | null
  price: number
  capacity: number | null
  active: boolean
  image_url: string | null
  duration: Localized | null
  time_label: Localized | null
  overview: Localized | null
  included: Localized[] | null
  requirements: Localized[] | null
  cancellation_policy: Localized | null
  trip_number: 1 | 2
}

export type WellnessOption = {
  id: string
  name: Localized | null
  description: Localized | null
  active: boolean
  image_url: string | null
  duration: Localized | null
  price: number | null
  trip_number: 1 | 2
}

export type TimelineEvent = {
  id: string
  booking_id: string
  sort_order: number
  event_date: string | null
  event_time: string | null
  type: TimelineEventType
  title: Localized | null
  description: Localized | null
  location: string | null
}
