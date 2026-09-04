import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Clock } from 'lucide-react'
import { getMyBooking } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import type { Booking, Activity } from '@/lib/types'
import { pick, formatMoney } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { ExperienceCard, type CardMeta } from '@/components/experience-card'
import { EmptyState } from '@/components/primitives'

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tSections = await getTranslations('sections')
  const tA = await getTranslations('activities')
  const tCommon = await getTranslations('common')

  const booking = (await getMyBooking()) as Booking | null
  if (!booking) redirect(`/${locale}/dashboard`)

  const supabase = await createClient()
  const tripNumbers = [...new Set((booking.travelers ?? []).map((traveler) => traveler.trip_number ?? 1))]
  // El orden lo fija el panel (columna sort_order). Antes iba por precio y
  // la cena, la más barata, se colaba la primera.
  const { data } = await supabase
    .from('activities')
    .select('*')
    .eq('active', true)
    .in('trip_number', tripNumbers)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  const activities = (data ?? []) as Activity[]

  return (
    <div>
      <AppHeader title={tSections('activities.title')} subtitle={tSections('activities.subtitle')} locale={locale} />
      <div className="px-5 py-6">
        {activities.length === 0 ? (
          <EmptyState title={tSections('activities.empty')} />
        ) : (
          <div className="space-y-4">
            {activities.map((activity, idx) => {
              const duration = pick(activity.duration, locale)
              const time = pick(activity.time_label, locale)
              const eyebrow =
                activity.price > 0
                  ? `${tA('from')} ${formatMoney(activity.price, locale)}`
                  : tCommon('onRequest')
              const meta: CardMeta[] = []
              if (duration) meta.push({ icon: <Clock className="size-3.5" aria-hidden />, text: duration })
              if (time) meta.push({ text: time })
              return (
                <ExperienceCard
                  key={activity.id}
                  href={`/${locale}/activities/${activity.id}`}
                  imageUrl={activity.image_url}
                  eyebrow={eyebrow}
                  title={pick(activity.name, locale)}
                  description={pick(activity.description, locale)}
                  meta={meta}
                  priority={idx === 0}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
