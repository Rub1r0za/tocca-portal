import { MobileShell } from '@/components/mobile-shell'
import { getMyBooking } from '@/lib/booking'
import { PortalVisibilityProvider } from '@/components/portal-visibility'

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const booking = await getMyBooking()
  return <PortalVisibilityProvider value={{ wellness: booking?.wellness_enabled !== false, activities: booking?.activities_enabled !== false }}><MobileShell locale={locale}>{children}</MobileShell></PortalVisibilityProvider>
}
