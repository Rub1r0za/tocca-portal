import { getTranslations } from 'next-intl/server'
import { getMyBooking } from '@/lib/booking'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('dashboard')
  const booking = await getMyBooking()

  if (!booking) {
    redirect(`/${locale}/login`)
  }

  const title = booking.title?.[locale] ?? booking.title?.['en'] ?? 'Your trip'
  const startDate = booking.start_date
    ? new Date(booking.start_date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—'
  const endDate = booking.end_date
    ? new Date(booking.end_date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—'

  const travelers = booking.travelers ?? []

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div>
        <p className="text-xs tracking-[0.2em] text-[#2F7E72] uppercase mb-2">{t('greeting')}</p>
        <h1
          className="text-4xl sm:text-5xl text-ink leading-tight"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          {title}
        </h1>
        <div className="mt-4 h-px bg-sand w-24" />
      </div>

      {/* Trip summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <SummaryCard label={t('travelersLabel')} value={String(travelers.length)} />
        <SummaryCard
          label={t('datesLabel')}
          value={`${startDate} – ${endDate}`}
        />
        <SummaryCard label={t('statusLabel')} value={booking.status} capitalize />
      </div>

      {/* Quick links */}
      <div>
        <p className="text-xs tracking-[0.2em] text-[#6b7280] uppercase mb-4">{t('quickLinks')}</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <QuickLink href={`/${locale}/journey`} label={t('viewItinerary')} />
          <QuickLink href={`/${locale}/meals`} label={t('chooseMeals')} accent />
          <QuickLink href={`/${locale}/activities`} label={t('chooseActivities')} />
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  capitalize,
}: {
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div className="border border-sand rounded-lg p-5 bg-white">
      <p className="text-xs tracking-widest text-[#6b7280] uppercase mb-1">{label}</p>
      <p className={`text-sm text-ink font-medium ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  )
}

function QuickLink({
  href,
  label,
  accent,
}: {
  href: string
  label: string
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg px-5 py-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#11487E]/40 ${
        accent
          ? 'bg-[#11487E] text-white hover:bg-[#0d3a66]'
          : 'border border-sand bg-white text-ink hover:border-[#11487E]/30 hover:bg-[#11487E]/4'
      }`}
    >
      {label} →
    </Link>
  )
}
