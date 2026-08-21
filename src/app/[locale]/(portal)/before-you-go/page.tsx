import { getTranslations } from 'next-intl/server'
import {
  Footprints, Shirt, Waves, Luggage, Plug, Smartphone, GlassWater, Sun, Citrus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { BEFORE_YOU_GO, type TipIcon } from '@/lib/travel-content'
import { pick } from '@/lib/format'
import { AppHeader } from '@/components/app-header'

const ICONS: Record<TipIcon, LucideIcon> = {
  shoes: Footprints,
  clothes: Shirt,
  'water-shoes': Waves,
  suitcase: Luggage,
  plug: Plug,
  phone: Smartphone,
  bottle: GlassWater,
  sun: Sun,
  lemon: Citrus,
}

export default async function BeforeYouGoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tSections = await getTranslations('sections')

  return (
    <div>
      <AppHeader
        title={tSections('beforeYouGo.title')}
        subtitle={tSections('beforeYouGo.subtitle')}
        locale={locale}
      />

      <div className="px-5 py-6">
        <p className="mb-6 text-center text-sm leading-relaxed text-mist">
          {tSections('beforeYouGo.intro')}
        </p>

        <ol className="space-y-3">
          {BEFORE_YOU_GO.map((tip, i) => {
            const Icon = ICONS[tip.icon]
            return (
              <li
                key={tip.icon}
                className="flex gap-4 rounded-2xl border border-hairline bg-white p-4 shadow-[0_2px_8px_rgba(62,45,35,0.06)]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10">
                  <Icon className="size-5 text-gold" strokeWidth={1.6} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h2
                    className="text-base leading-snug text-foreground"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    <span className="mr-1.5 text-gold">{i + 1}.</span>
                    {pick(tip.title, locale)}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-mist">{pick(tip.body, locale)}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
