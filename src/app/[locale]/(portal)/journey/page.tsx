import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { getMyBooking } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import type { Booking, JourneyDay } from '@/lib/types'
import { pick, formatDayLabel, resolveDayDate } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { JourneySearch, type JourneyItem } from '@/components/journey-search'
import { EmptyState } from '@/components/primitives'

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tSections = await getTranslations('sections')
  const tCommon = await getTranslations('common')

  const booking = (await getMyBooking()) as Booking | null
  if (!booking) redirect(`/${locale}/login`)

  const supabase = await createClient()
  const { data } = await supabase
    .from('journey_days')
    .select('*')
    .eq('booking_id', booking.id)
    .order('day_number', { ascending: true })

  const days = (data ?? []) as JourneyDay[]

  const items: JourneyItem[] = days.map((day) => {
    const title = pick(day.title, locale)
    const description = pick(day.description, locale)
    const date = resolveDayDate(day.day_date, booking.start_date, day.day_number)
    const dateText = formatDayLabel(date, locale)
    const location = day.location ?? ''
    return {
      id: day.id,
      href: `/${locale}/journey/${day.id}`,
      imageUrl: day.image_url,
      dayLabel: tCommon('day', { n: day.day_number }),
      dateText,
      location,
      title,
      description,
      search: `${title} ${description} ${location} ${dateText}`.toLowerCase(),
    }
  })

  return (
    <div>
      <AppHeader title={tSections('journey.title')} subtitle={tSections('journey.subtitle')} locale={locale} />
      <div className="px-5 py-6">
        {items.length === 0 ? (
          <EmptyState title={tSections('journey.empty')} />
        ) : (
          <JourneySearch
            items={items}
            placeholder={tSections('journey.searchPlaceholder')}
            noResultsText={tSections('journey.noResults')}
          />
        )}
      </div>
    </div>
  )
}
