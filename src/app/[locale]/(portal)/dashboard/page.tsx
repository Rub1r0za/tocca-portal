import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Route, Sparkles, Compass, UtensilsCrossed, Flower2, ChevronRight, Users, CalendarDays } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getMyBooking } from '@/lib/booking'
import type { Booking } from '@/lib/types'
import { pick, formatDate } from '@/lib/format'
import { StatusPill } from '@/components/primitives'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('dashboard')
  const tSections = await getTranslations('sections')
  const tStatus = await getTranslations('status')

  const booking = (await getMyBooking()) as Booking | null
  if (!booking) redirect(`/${locale}/login`)

  const title = pick(booking.title, locale) || 'Amalfi Coast'
  const start = formatDate(booking.start_date, locale, { day: 'numeric', month: 'short' })
  const end = formatDate(booking.end_date, locale, { day: 'numeric', month: 'short', year: 'numeric' })
  const dateRange = start && end ? `${start} – ${end}` : start || end || '—'
  const travelers = booking.travelers?.length ?? 0
  const statusLabel = tStatus(booking.status)

  const tiles: { href: string; Icon: LucideIcon; title: string; subtitle: string }[] = [
    { href: `/${locale}/timeline`, Icon: Route, title: tSections('timeline.title'), subtitle: tSections('timeline.subtitle') },
    { href: `/${locale}/activities`, Icon: Compass, title: tSections('activities.title'), subtitle: tSections('activities.subtitle') },
    { href: `/${locale}/meals`, Icon: UtensilsCrossed, title: tSections('meals.title'), subtitle: tSections('meals.subtitle') },
    { href: `/${locale}/wellness`, Icon: Flower2, title: tSections('wellness.title'), subtitle: tSections('wellness.subtitle') },
  ]

  return (
    <div>
      {/* Hero — dark navy matching Tocca card style */}
      <section
        className="relative overflow-hidden px-5 pt-10 pb-8"
        style={{ background: 'linear-gradient(135deg, #23374D 0%, #1a2d3f 100%)' }}
      >
        {/* Decorative wave */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 50% at 50% 120%, #4A9A92 0%, transparent 70%)',
          }}
        />
        <p className="relative text-[0.6rem] tracking-[0.35em] text-white/50 uppercase">
          {t('greeting')}
        </p>
        <h1
          className="relative mt-1.5 text-[2rem] leading-tight text-white sm:text-[2.4rem]"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic' }}
        >
          {title}
        </h1>
        <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden />
            {dateRange}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" aria-hidden />
            {travelers} {t('travelersLabel').toLowerCase()}
          </span>
          <StatusPill status={booking.status} label={statusLabel} />
        </div>
      </section>

      {/* Explore */}
      <section className="px-4 py-6 sm:px-5 sm:py-7">
        <p className="text-[0.65rem] tracking-[0.22em] text-gold uppercase">{t('exploreEyebrow')}</p>
        <h2
          className="mt-1 mb-4 text-2xl text-foreground"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          {t('exploreTitle')}
        </h2>

        {/* Feature: Journey */}
        <Link
          href={`/${locale}/journey`}
          className="group mb-3 flex items-center gap-4 overflow-hidden rounded-2xl border border-hairline bg-white p-5 shadow-[0_2px_12px_rgba(62,45,35,0.07)] transition-all hover:border-azure/40 hover:shadow-[0_4px_20px_rgba(74,154,146,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-azure/50"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-azure/10">
            <Sparkles className="size-5 text-azure" strokeWidth={1.7} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className="text-lg text-foreground"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              {tSections('journey.title')}
            </h3>
            <p className="truncate text-sm text-mist">{tSections('journey.subtitle')}</p>
          </div>
          <ChevronRight
            className="size-5 shrink-0 text-mist/50 transition-transform group-hover:translate-x-0.5 group-hover:text-azure"
            aria-hidden
          />
        </Link>

        {/* Grid of sections */}
        <div className="grid grid-cols-2 gap-3">
          {tiles.map(({ href, Icon, title: tileTitle, subtitle }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl border border-hairline bg-white p-4 shadow-[0_2px_8px_rgba(62,45,35,0.06)] transition-all hover:border-azure/40 hover:shadow-[0_4px_16px_rgba(74,154,146,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-azure/50"
            >
              <span className="mb-3 flex size-9 items-center justify-center rounded-full bg-azure/10">
                <Icon className="size-[17px] text-azure" strokeWidth={1.7} aria-hidden />
              </span>
              <h3
                className="text-sm leading-snug text-foreground sm:text-base"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                {tileTitle}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-mist">{subtitle}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
