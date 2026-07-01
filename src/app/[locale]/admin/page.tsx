import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { CalendarDays, Users, PlusCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  cancelled: 'Cancelada',
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-teal-50 text-teal-700 border-teal-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const admin = createAdminClient()

  const { data: bookings } = await admin
    .from('bookings')
    .select('id, title, status, start_date, end_date, applicant_email, applicant_name, created_at, travelers(id)')
    .order('created_at', { ascending: false })

  const total = bookings?.length ?? 0
  const approved = bookings?.filter((b) => b.status === 'approved').length ?? 0
  const pending = bookings?.filter((b) => b.status === 'pending').length ?? 0

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl text-[#3E2D23] sm:text-3xl"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Reservas
          </h1>
          <p className="mt-0.5 text-sm text-[#7A7168]">
            {total} reserva{total !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Link
          href={`/${locale}/admin/bookings/new`}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A9A92]/50"
          style={{ background: 'linear-gradient(135deg, #23374D 0%, #1a2d3f 100%)' }}
        >
          <PlusCircle className="size-4" />
          Nueva reserva
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: total, color: 'text-[#3E2D23]' },
          { label: 'Aprobadas', value: approved, color: 'text-[#4A9A92]' },
          { label: 'Pendientes', value: pending, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-[rgba(62,45,35,0.12)] bg-white p-4 text-center shadow-[0_1px_4px_rgba(62,45,35,0.06)]"
          >
            <p className={cn('text-2xl font-semibold', color)}>{value}</p>
            <p className="mt-0.5 text-xs text-[#7A7168]">{label}</p>
          </div>
        ))}
      </div>

      {/* Bookings list */}
      <div className="overflow-hidden rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white shadow-[0_2px_8px_rgba(62,45,35,0.06)]">
        {!bookings || bookings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-[#7A7168]">No hay reservas aún.</p>
            <Link
              href={`/${locale}/admin/bookings/new`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#4A9A92] hover:underline"
            >
              <PlusCircle className="size-4" /> Crear la primera reserva
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(62,45,35,0.08)]">
            {bookings.map((booking) => {
              const title =
                (booking.title as Record<string, string>)?.en ||
                (booking.title as Record<string, string>)?.es ||
                'Sin título'
              const travelersCount = Array.isArray(booking.travelers)
                ? booking.travelers.length
                : 0

              return (
                <li key={booking.id}>
                  <Link
                    href={`/${locale}/admin/bookings/${booking.id}`}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FAFAF8] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4A9A92]/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className="text-base text-[#3E2D23]"
                          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                        >
                          {title}
                        </p>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-medium capitalize',
                            STATUS_CLASS[booking.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
                          )}
                        >
                          {STATUS_LABEL[booking.status] ?? booking.status}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#7A7168]">
                        {booking.applicant_email && (
                          <span>{booking.applicant_email}</span>
                        )}
                        {(booking.start_date || booking.end_date) && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3" />
                            {booking.start_date ?? '?'} → {booking.end_date ?? '?'}
                          </span>
                        )}
                        {travelersCount > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Users className="size-3" />
                            {travelersCount} viajero{travelersCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-[#7A7168]/60" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
