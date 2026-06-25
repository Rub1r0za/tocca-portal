import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Clock } from 'lucide-react'
import { getMyBooking } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import type { Booking, WellnessOption } from '@/lib/types'
import { pick, formatMoney } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { ExperienceCard, type CardMeta } from '@/components/experience-card'
import { EmptyState } from '@/components/primitives'

function priceLabel(price: number | null, locale: string, t: (k: string) => string, tCommon: (k: string) => string): string {
  if (price === null) return tCommon('onRequest')
  if (price === 0) return t('included')
  return `${t('from')} ${formatMoney(price, locale)}`
}

export default async function WellnessPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tSections = await getTranslations('sections')
  const t = await getTranslations('wellness')
  const tCommon = await getTranslations('common')

  const booking = (await getMyBooking()) as Booking | null
  if (!booking) redirect(`/${locale}/login`)

  const supabase = await createClient()
  const { data } = await supabase
    .from('wellness_options')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true })

  const options = (data ?? []) as WellnessOption[]

  return (
    <div>
      <AppHeader title={tSections('wellness.title')} subtitle={tSections('wellness.subtitle')} locale={locale} />
      <div className="px-5 py-6">
        {options.length === 0 ? (
          <EmptyState title={tSections('wellness.empty')} />
        ) : (
          <div className="space-y-4">
            {options.map((option, idx) => {
              const duration = pick(option.duration, locale)
              const meta: CardMeta[] = []
              if (duration) meta.push({ icon: <Clock className="size-3.5" aria-hidden />, text: duration })
              return (
                <ExperienceCard
                  key={option.id}
                  href={`/${locale}/wellness/${option.id}`}
                  imageUrl={option.image_url}
                  eyebrow={priceLabel(option.price, locale, t, tCommon)}
                  title={pick(option.name, locale)}
                  description={pick(option.description, locale)}
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
