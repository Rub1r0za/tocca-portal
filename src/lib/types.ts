// Shared data types for the Tocca guest app.
// These mirror the Supabase schema (schema.sql) + the guest-app migration.

/** A localized jsonb value, e.g. { en: "...", es: "..." }. */
export type Localized = Record<string, string>

export type BookingStatus = 'pending' | 'approved' | 'cancelled'
export type MealCourse = 'starter' | 'main' | 'dessert'
export type RequestStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled'
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
  notes: string | null
  travelers: Traveler[] | null
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
}

export type WellnessOption = {
  id: string
  name: Localized | null
  description: Localized | null
  active: boolean
  image_url: string | null
  duration: Localized | null
  price: number | null
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
