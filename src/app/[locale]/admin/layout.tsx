import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from './admin-nav'

export const metadata = { title: 'Admin · Tocca Amalfi Coast' }

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect(`/${locale}/dashboard`)

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Top bar */}
      <header
        className="flex h-14 items-center justify-between px-4 sm:px-6"
        style={{ background: 'linear-gradient(135deg, #23374D 0%, #1a2d3f 100%)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[0.55rem] font-semibold tracking-[0.4em] text-white/40 uppercase select-none">
            Tocca
          </span>
          <span className="text-white/20">/</span>
          <span className="text-sm font-medium text-white">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/dashboard`}
            className="text-xs text-white/60 transition-colors hover:text-white"
          >
            ← Portal del cliente
          </Link>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        {/* Sidebar — desktop */}
        <aside className="hidden w-52 shrink-0 border-r border-[rgba(62,45,35,0.12)] bg-white lg:block">
          <AdminNav locale={locale} />
        </aside>

        {/* Mobile nav strip */}
        <div className="w-full lg:hidden">
          {/* Mobile nav is inside the page header row */}
        </div>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Mobile breadcrumb nav */}
          <div className="mb-6 lg:hidden">
            <AdminNav locale={locale} mobile />
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
