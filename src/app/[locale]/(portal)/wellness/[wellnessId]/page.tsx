import { getTranslations } from 'next-intl/server'
import { redirect, notFound } from 'next/navigation'
import { Clock } from 'lucide-react'
import { getMyBooking } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import type { Booking, WellnessOption } from '@/lib/types'
import { pick, formatMoney } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { ImageWithFallback } from '@/components/image-with-fallback'
import { SectionHeading } from '@/components/primitives'
import { ReservationForm } from '@/components/reservation-form'

export default async function WellnessDetailPage({
  params,
}: {
  params: Promise<{ locale: string; wellnessId: string }>
}) {
  const { locale, wellnessId } = await params
  const t = await getTranslations('wellness')
  const tCommon = await getTranslations('common')

  const booking = (await getMyBooking()) as Booking | null
  if (!booking) redirect(`/${locale}/login`)

  const supabase = await createClient()
  const { data } = await supabase
    .from('wellness_options')
    .select('*')
    .eq('id', wellnessId)
    .eq('active', true)
    .maybeSingle()

  if (!data) notFound()
  const option = data as WellnessOption

  const name = pick(option.name, locale)
  const description = pick(option.description, locale)
  const duration = pick(option.duration, locale)
  const priceText =
    option.price === null
      ? tCommon('onRequest')
      : option.price === 0
        ? t('included')
        : formatMoney(option.price, locale)
  const maxGuests = booking.travelers?.length || 12

  return (
    <div>
      <AppHeader title={name} locale={locale} backHref={`/${locale}/wellness`} />

      <ImageWithFallback src={option.image_url} alt={name} priority className="aspect-[4/3] w-full" />

      <div className="space-y-7 px-5 py-6">
        <div>
          <p className="text-xl text-gold" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            {priceText}
          </p>
          {duration && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-panel px-3 py-1 text-xs text-mist">
                <Clock className="size-3.5 text-azure" aria-hidden />
                {duration}
              </span>
            </div>
          )}
        </div>

        {description && (
          <section>
            <p className="text-sm leading-relaxed text-mist">{description}</p>
          </section>
        )}

        <section className="rounded-2xl border border-hairline bg-panel/50 p-5">
          <SectionHeading eyebrow={t('requestReservation')} className="mb-4" />
          <ReservationForm kind="wellness" bookingId={booking.id} targetId={option.id} maxGuests={maxGuests} />
        </section>
      </div>
    </div>
  )
}
