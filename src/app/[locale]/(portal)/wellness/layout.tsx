import { redirect } from 'next/navigation'
import { getMyBooking } from '@/lib/booking'

export default async function WellnessLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const booking = await getMyBooking()
  if (!booking || booking.wellness_enabled === false) redirect(`/${locale}/dashboard`)
  return children
}
