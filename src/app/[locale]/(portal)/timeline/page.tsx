import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { getMyBooking } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import type { Booking, TimelineEvent } from '@/lib/types'
import { pick, formatDate } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { TimelineView, type TimelineGroup } from '@/components/timeline-view'
import { EmptyState } from '@/components/primitives'

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tSections = await getTranslations('sections')

  const booking = (await getMyBooking()) as Booking | null
  if (!booking) redirect(`/${locale}/login`)

  const supabase = await createClient()
  const { data } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('booking_id', booking.id)
    .order('sort_order', { ascending: true })

  const events = (data ?? []) as TimelineEvent[]

  // Group consecutive events by their formatted date.
  const groups: TimelineGroup[] = []
  for (const ev of events) {
    const dateText = formatDate(ev.event_date, locale, { weekday: 'long', day: 'numeric', month: 'long' })
    const last = groups[groups.length - 1]
    const item = {
      id: ev.id,
      type: ev.type,
      time: ev.event_time ?? '',
      title: pick(ev.title, locale),
      description: pick(ev.description, locale),
      location: ev.location ?? '',
    }
    if (last && last.dateText === dateText) {
      last.items.push(item)
    } else {
      groups.push({ dateText, items: [item] })
    }
  }

  return (
    <div>
      <AppHeader title={tSections('timeline.title')} subtitle={tSections('timeline.subtitle')} locale={locale} />
      <div className="px-5 py-6">
        {groups.length === 0 ? (
          <EmptyState title={tSections('timeline.empty')} />
        ) : (
          <TimelineView groups={groups} />
        )}
      </div>
    </div>
  )
}
