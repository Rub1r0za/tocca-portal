'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CalendarCheck, LogOut, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Reservas', path: '/admin', exact: true, Icon: LayoutDashboard },
  { label: 'Nueva reserva', path: '/admin/bookings/new', exact: true, Icon: PlusCircle },
]

export function AdminNav({ locale, mobile }: { locale: string; mobile?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  if (mobile) {
    return (
      <div className="flex items-center gap-1 overflow-x-auto">
        {navItems.map(({ label, path, exact, Icon }) => {
          const href = `/${locale}${path}`
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={path}
              href={href}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs transition-colors',
                active
                  ? 'bg-[#4A9A92]/10 font-medium text-[#4A9A92]'
                  : 'text-[#7A7168] hover:bg-[#F4F1EB] hover:text-[#3E2D23]'
              )}
            >
              <Icon className="size-3.5 shrink-0" strokeWidth={active ? 2 : 1.7} />
              {label}
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col py-5">
      <nav className="flex-1 px-3">
        <p className="mb-2 px-3 text-[0.6rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase">
          Gestión
        </p>
        <ul className="space-y-0.5">
          {navItems.map(({ label, path, exact, Icon }) => {
            const href = `/${locale}${path}`
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <li key={path}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors',
                    active
                      ? 'bg-[#4A9A92]/10 font-medium text-[#4A9A92]'
                      : 'text-[#7A7168] hover:bg-[#F4F1EB] hover:text-[#3E2D23]'
                  )}
                >
                  <Icon
                    className={cn('size-4 shrink-0', active ? 'text-[#4A9A92]' : 'text-[#7A7168]')}
                    strokeWidth={active ? 2 : 1.7}
                  />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-[rgba(62,45,35,0.12)] px-3 pt-4">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#7A7168] transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="size-4 shrink-0" strokeWidth={1.7} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
