import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { UserPlus, PlusCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Reserva pendiente',
  approved: 'Reserva aprobada',
  cancelled: 'Reserva cancelada',
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-teal-50 text-teal-700 border-teal-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
}

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const admin = createAdminClient()

  const [{ data: userData }, { data: profiles }, { data: bookings }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from('profiles').select('id, role, full_name'),
    admin.from('bookings').select('id, user_id, status, created_at').order('created_at', { ascending: false }),
  ])

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))
  const bookingByUser = new Map<string, { id: string; status: string }>()
  for (const b of bookings ?? []) {
    if (!bookingByUser.has(b.user_id)) bookingByUser.set(b.user_id, b)
  }

  const users = (userData?.users ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const fmt = (iso: string | null | undefined) =>
    iso
      ? new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
      : null

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl text-[#3E2D23] sm:text-3xl"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Clientes
          </h1>
          <p className="mt-0.5 text-sm text-[#7A7168]">
            {users.length} cuenta{users.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Link
          href={`/${locale}/admin/clients/new`}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A9A92]/50"
          style={{ background: 'linear-gradient(135deg, #23374D 0%, #1a2d3f 100%)' }}
        >
          <UserPlus className="size-4" />
          Nuevo cliente
        </Link>
      </div>

      {/* Client list */}
      <div className="overflow-hidden rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white shadow-[0_2px_8px_rgba(62,45,35,0.06)]">
        {users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-[#7A7168]">No hay cuentas aún.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(62,45,35,0.08)]">
            {users.map((user) => {
              const profile = profileById.get(user.id)
              const booking = bookingByUser.get(user.id)
              const isAdmin = profile?.role === 'admin'
              const name =
                profile?.full_name && profile.full_name !== user.email ? profile.full_name : null

              return (
                <li
                  key={user.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-[#3E2D23]">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#23374D]/20 bg-[#23374D]/5 px-2 py-0.5 text-[0.65rem] font-medium text-[#23374D]">
                          <ShieldCheck className="size-3" /> Admin
                        </span>
                      )}
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-medium',
                          booking
                            ? STATUS_CLASS[booking.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        )}
                      >
                        {booking ? STATUS_LABEL[booking.status] ?? booking.status : 'Sin reserva'}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#7A7168]">
                      {name && <span>{name}</span>}
                      <span>Creada: {fmt(user.created_at) ?? '—'}</span>
                      <span>
                        Último acceso: {fmt(user.last_sign_in_at) ?? 'nunca'}
                      </span>
                    </div>
                  </div>

                  {booking ? (
                    <Link
                      href={`/${locale}/admin/bookings/${booking.id}`}
                      className="shrink-0 text-sm text-[#4A9A92] hover:underline"
                    >
                      Ver reserva
                    </Link>
                  ) : (
                    !isAdmin && (
                      <Link
                        href={`/${locale}/admin/bookings/new?email=${encodeURIComponent(user.email ?? '')}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#4A9A92]/30 bg-[#4A9A92]/5 px-3 py-1.5 text-xs font-medium text-[#4A9A92] transition-colors hover:bg-[#4A9A92]/10"
                      >
                        <PlusCircle className="size-3.5" />
                        Crear reserva
                      </Link>
                    )
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
