import { getTranslations } from 'next-intl/server'
import { getMyBooking } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ActivityCard } from './activity-card'

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('activities')
  const booking = await getMyBooking()

  if (!booking) redirect(`/${locale}/login`)

  const supabase = await createClient()

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('active', true)
    .order('price', { ascending: true })

  const { data: selections } = await supabase
    .from('activity_selections')
    .select('activity_id, traveler_id')
    .eq('booking_id', booking.id)

  const travelers = booking.travelers ?? []

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs tracking-[0.2em] text-[#2F7E72] uppercase mb-2">
          {booking.title?.[locale] ?? booking.title?.['en']}
        </p>
        <h1
          className="text-4xl sm:text-5xl text-ink"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-[#6b7280]">{t('subtitle')}</p>
        <div className="mt-4 h-px bg-sand w-24" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {(activities ?? []).map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            travelers={travelers}
            selections={selections ?? []}
            bookingId={booking.id}
            locale={locale}
          />
        ))}
      </div>
    </div>
  )
}
