import { getTranslations } from 'next-intl/server'
import { redirect, notFound } from 'next/navigation'
import { Check, MapPin } from 'lucide-react'
import { getMyBooking } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import type { Booking, JourneyDay } from '@/lib/types'
import { pick, formatDayLabel, resolveDayDate } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { ImageWithFallback } from '@/components/image-with-fallback'
import { SectionHeading } from '@/components/primitives'

export default async function JourneyDayPage({
  params,
}: {
  params: Promise<{ locale: string; dayId: string }>
}) {
  const { locale, dayId } = await params
  const t = await getTranslations('journeyDetail')
  const tCommon = await getTranslations('common')

  const booking = (await getMyBooking()) as Booking | null
  if (!booking) redirect(`/${locale}/login`)

  const supabase = await createClient()
  const { data } = await supabase
    .from('journey_days')
    .select('*')
    .eq('id', dayId)
    .eq('booking_id', booking.id)
    .maybeSingle()

  if (!data) notFound()
  const day = data as JourneyDay

  const title = pick(day.title, locale) || tCommon('day', { n: day.day_number })
  const description = pick(day.description, locale)
  const date = resolveDayDate(day.day_date, booking.start_date, day.day_number)
  const dateText = formatDayLabel(date, locale)
  const schedule = day.schedule ?? []
  const included = day.included ?? []
  const meetingPoint = pick(day.meeting_point, locale)
  const notes = pick(day.day_notes, locale)
  const gallery = day.gallery ?? []

  return (
    <div>
      <AppHeader title={title} subtitle={dateText} locale={locale} backHref={`/${locale}/journey`} />

      <ImageWithFallback src={day.image_url} alt={title} priority className="aspect-[4/3] w-full" />

      <div className="space-y-7 px-5 py-6">
        <div>
          <p className="text-[0.65rem] tracking-[0.2em] text-gold uppercase">
            {tCommon('day', { n: day.day_number })}
            {day.location ? ` · ${day.location}` : ''}
          </p>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-mist">{description}</p>
          )}
        </div>

        {schedule.length > 0 && (
          <section>
            <SectionHeading eyebrow={t('schedule')} className="mb-4" />
            <ol className="relative space-y-4">
              <span className="absolute top-1.5 bottom-1.5 left-[5px] w-px bg-hairline" aria-hidden />
              {schedule.map((item, i) => (
                <li key={i} className="relative flex gap-4 pl-0">
                  <span className="z-10 mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-gold bg-night" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gold">{item.time}</p>
                    <p className="text-sm text-foreground">{pick(item.title, locale)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {included.length > 0 && (
          <section>
            <SectionHeading eyebrow={t('included')} className="mb-3" />
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

        {meetingPoint && (
          <section>
            <SectionHeading eyebrow={t('meetingPoint')} className="mb-2" />
            <p className="flex items-start gap-2 text-sm text-mist">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              {meetingPoint}
            </p>
          </section>
        )}

        {notes && (
          <section>
            <SectionHeading eyebrow={t('notes')} className="mb-2" />
            <p className="rounded-xl border border-hairline bg-panel/60 px-4 py-3 text-sm leading-relaxed text-mist">
              {notes}
            </p>
          </section>
        )}

        {gallery.length > 0 && (
          <section>
            <SectionHeading eyebrow={t('gallery')} className="mb-3" />
            <div className="grid grid-cols-2 gap-2.5">
              {gallery.map((url, i) => (
                <ImageWithFallback
                  key={i}
                  src={url}
                  alt={`${title} ${i + 1}`}
                  className="aspect-square w-full rounded-xl"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
