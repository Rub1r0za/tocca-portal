import { getTranslations } from 'next-intl/server'
import { redirect, notFound } from 'next/navigation'
import { Check, Clock, CalendarClock } from 'lucide-react'
import { getMyBooking } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import type { Booking, Activity } from '@/lib/types'
import { pick, formatMoney } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { ImageWithFallback } from '@/components/image-with-fallback'
import { SectionHeading } from '@/components/primitives'
import { ReservationForm } from '@/components/reservation-form'

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; activityId: string }>
}) {
  const { locale, activityId } = await params
  const t = await getTranslations('activities')
  const tCommon = await getTranslations('common')

  const booking = (await getMyBooking()) as Booking | null
  if (!booking) redirect(`/${locale}/login`)

  const supabase = await createClient()
  const { data } = await supabase
    .from('activities')
    .select('*')
    .eq('id', activityId)
    .eq('active', true)
    .maybeSingle()

  if (!data) notFound()
  const activity = data as Activity

  const name = pick(activity.name, locale)
  const duration = pick(activity.duration, locale)
  const time = pick(activity.time_label, locale)
  const overview = pick(activity.overview, locale) || pick(activity.description, locale)
  const included = activity.included ?? []
  const requirements = activity.requirements ?? []
  const cancellation = pick(activity.cancellation_policy, locale)
  const priceText = activity.price > 0 ? formatMoney(activity.price, locale) : tCommon('onRequest')
  const maxGuests = activity.capacity ?? (booking.travelers?.length || 12)

  return (
    <div>
      <AppHeader title={name} locale={locale} backHref={`/${locale}/activities`} />

      <ImageWithFallback src={activity.image_url} alt={name} priority className="aspect-[4/3] w-full" />

      <div className="space-y-7 px-5 py-6">
        {/* Price + quick facts */}
        <div>
          <p className="text-xl text-gold" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            {priceText}
            {activity.price > 0 && (
              <span className="ml-1.5 text-xs font-normal tracking-wide text-mist">
                {tCommon('perPerson')}
              </span>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {duration && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-panel px-3 py-1 text-xs text-mist">
                <Clock className="size-3.5 text-azure" aria-hidden />
                {duration}
              </span>
            )}
            {time && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-panel px-3 py-1 text-xs text-mist">
                <CalendarClock className="size-3.5 text-azure" aria-hidden />
                {time}
              </span>
            )}
          </div>
        </div>

        {overview && (
          <section>
            <SectionHeading eyebrow={t('overview')} className="mb-2" />
            <p className="text-sm leading-relaxed text-mist">{overview}</p>
          </section>
        )}

        {included.length > 0 && (
          <section>
            <SectionHeading eyebrow={t('whatsIncluded')} className="mb-3" />
            <ul className="space-y-2">
              {included.map((it, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-mist">
                  <Check className="mt-0.5 size-4 shrink-0 text-azure" aria-hidden />
                  {pick(it, locale)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {requirements.length > 0 && (
          <section>
            <SectionHeading eyebrow={t('requirements')} className="mb-3" />
            <ul className="space-y-2">
              {requirements.map((it, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-mist">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                  {pick(it, locale)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {cancellation && (
          <section>
            <SectionHeading eyebrow={t('cancellationPolicy')} className="mb-2" />
            <p className="text-sm leading-relaxed text-mist">{cancellation}</p>
          </section>
        )}

        {/* Reservation */}
        <section className="rounded-2xl border border-hairline bg-panel/50 p-5">
          <SectionHeading eyebrow={t('requestReservation')} className="mb-4" />
          <ReservationForm kind="activity" bookingId={booking.id} targetId={activity.id} maxGuests={maxGuests} />
        </section>
      </div>
    </div>
  )
}
