import { getTranslations } from 'next-intl/server'
import { getMyBooking } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('journey')
  const booking = await getMyBooking()

  if (!booking) redirect(`/${locale}/login`)

  const supabase = await createClient()
  const { data: days } = await supabase
    .from('journey_days')
    .select('*')
    .eq('booking_id', booking.id)
    .order('day_number', { ascending: true })

  return (
    <div className="space-y-10">
      {/* Header */}
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

      {/* Days */}
      <ol className="relative space-y-0">
        {(days ?? []).map((day, idx) => {
          const isLast = idx === (days?.length ?? 0) - 1
          const title = day.title?.[locale] ?? day.title?.['en'] ?? ''
          const description = day.description?.[locale] ?? day.description?.['en'] ?? ''
          return (
            <li key={day.id} className="flex gap-6 relative">
              {/* Vertical line */}
              {!isLast && (
                <div className="absolute left-5 top-14 bottom-0 w-px bg-sand" aria-hidden />
              )}

              {/* Azulejo marker */}
              <div className="shrink-0 mt-1">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center relative"
                  style={{
                    background: '#11487E',
                    boxShadow: '0 0 0 3px #F2C200, 0 0 0 4px #F2C200',
                  }}
                  aria-label={`Day ${day.day_number}`}
                >
                  <span
                    className="text-white text-base leading-none"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                  >
                    {day.day_number}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="pb-10 flex-1 min-w-0">
                {day.location && (
                  <p className="text-xs tracking-[0.18em] text-[#2F7E72] uppercase mb-1">
                    {day.location}
                  </p>
                )}
                <h2
                  className="text-2xl text-ink mb-2"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  {title}
                </h2>
                <p className="text-sm text-[#6b7280] leading-relaxed">{description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
