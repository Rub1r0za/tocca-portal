import { PortalNav } from '@/components/portal-nav'

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <div className="min-h-screen bg-chalk">
      <PortalNav locale={locale} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {children}
      </main>
    </div>
  )
}
