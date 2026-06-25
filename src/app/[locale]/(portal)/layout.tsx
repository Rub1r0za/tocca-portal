import { MobileShell } from '@/components/mobile-shell'

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <MobileShell locale={locale}>{children}</MobileShell>
}
