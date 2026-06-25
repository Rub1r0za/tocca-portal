import type { Localized } from './types'

/** Currency used across the guest app. The Amalfi product is priced in EUR. */
export const CURRENCY = 'EUR'

const intlLocale = (locale: string) => (locale === 'es' ? 'es-ES' : 'en-GB')

/** Pick a localized string with a graceful fallback chain. */
export function pick(value: Localized | null | undefined, locale: string): string {
  if (!value) return ''
  return value[locale] ?? value['en'] ?? Object.values(value)[0] ?? ''
}

/** Format an ISO date string (yyyy-mm-dd) for display. Returns '' when null. */
export function formatDate(
  date: string | null | undefined,
  locale: string,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
): string {
  if (!date) return ''
  const d = new Date(`${date}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(intlLocale(locale), opts)
}

/** "Wednesday, 17 June" style label for a journey day. */
export function formatDayLabel(date: string | null | undefined, locale: string): string {
  return formatDate(date, locale, { weekday: 'long', day: 'numeric', month: 'long' })
}

/**
 * Resolve a journey day's date: an explicit `day_date` wins, otherwise it is
 * derived from the booking start date + (dayNumber - 1).
 */
export function resolveDayDate(
  explicit: string | null | undefined,
  startDate: string | null | undefined,
  dayNumber: number
): string | null {
  if (explicit) return explicit
  if (!startDate) return null
  const d = new Date(`${startDate}T00:00:00`)
  if (Number.isNaN(d.getTime())) return null
  d.setDate(d.getDate() + (dayNumber - 1))
  return d.toISOString().slice(0, 10)
}

/** Format a price. `null` renders as a translatable "on request" caller-side. */
export function formatMoney(price: number, locale: string): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price)
}

/** Split a free-text allergens field into trimmed chips. */
export function splitAllergens(allergens: string | null | undefined): string[] {
  if (!allergens) return []
  return allergens
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
}
