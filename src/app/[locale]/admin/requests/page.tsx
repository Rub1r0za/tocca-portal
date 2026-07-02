import { createAdminClient } from '@/lib/supabase/admin'
import { CalendarDays, Users, Sparkles, HeartPulse } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateRequestStatus } from '../actions'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  declined: 'Rechazada',
  cancelled: 'Cancelada',
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-teal-50 text-teal-700 border-teal-200',
  declined: 'bg-red-50 text-red-600 border-red-200',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
}

type RequestRow = {
  id: string
  kind: 'activity' | 'wellness'
  itemName: string
  bookingTitle: string
  applicantEmail: string | null
  numGuests: number
  requestedDate: string | null
  notes: string | null
  status: string
  createdAt: string
}

function name(jsonb: unknown): string {
  const rec = jsonb as Record<string, string> | null
  return rec?.es || rec?.en || 'Sin nombre'
}

export default async function RequestsAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const admin = createAdminClient()

  const [{ data: actReqs }, { data: wellReqs }] = await Promise.all([
    admin
      .from('activity_requests')
      .select('id, num_guests, requested_date, notes, status, created_at, activities(name), bookings(title, applicant_email)')
      .order('created_at', { ascending: false }),
    admin
      .from('wellness_requests')
      .select('id, num_guests, requested_date, notes, status, created_at, wellness_options(name), bookings(title, applicant_email)')
      .order('created_at', { ascending: false }),
  ])

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows: RequestRow[] = [
    ...(actReqs ?? []).map((r: any): RequestRow => ({
      id: r.id,
      kind: 'activity',
      itemName: name(r.activities?.name),
      bookingTitle: name(r.bookings?.title),
      applicantEmail: r.bookings?.applicant_email ?? null,
      numGuests: r.num_guests,
      requestedDate: r.requested_date,
      notes: r.notes,
      status: r.status,
      createdAt: r.created_at,
    })),
    ...(wellReqs ?? []).map((r: any): RequestRow => ({
      id: r.id,
      kind: 'wellness',
      itemName: name(r.wellness_options?.name),
      bookingTitle: name(r.bookings?.title),
      applicantEmail: r.bookings?.applicant_email ?? null,
      numGuests: r.num_guests,
      requestedDate: r.requested_date,
      notes: r.notes,
      status: r.status,
      createdAt: r.created_at,
    })),
  ]
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Pending first, then newest
  rows.sort((a, b) => {
    if ((a.status === 'pending') !== (b.status === 'pending')) {
      return a.status === 'pending' ? -1 : 1
    }
    return b.createdAt.localeCompare(a.createdAt)
  })

  const pendingCount = rows.filter((r) => r.status === 'pending').length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1
          className="text-2xl text-[#3E2D23] sm:text-3xl"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Solicitudes
        </h1>
        <p className="mt-0.5 text-sm text-[#7A7168]">
          {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''} de {rows.length} en total
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(62,45,35,0.2)] bg-white p-8 text-center">
          <p className="text-sm text-[#7A7168]">
            No hay solicitudes aún. Aparecerán aquí cuando los clientes pidan reservar actividades o wellness.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((req) => {
            const confirm = updateRequestStatus.bind(null, req.kind, req.id, 'confirmed', locale)
            const decline = updateRequestStatus.bind(null, req.kind, req.id, 'declined', locale)
            const reopen = updateRequestStatus.bind(null, req.kind, req.id, 'pending', locale)
            const Icon = req.kind === 'activity' ? Sparkles : HeartPulse

            return (
              <li
                key={`${req.kind}-${req.id}`}
                className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(74,154,146,0.3)] bg-[#4A9A92]/10 text-[#4A9A92]">
                    <Icon className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-medium text-[#3E2D23]" style={{ fontFamily: 'var(--font-display)' }}>
                        {req.itemName}
                      </p>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-medium',
                          STATUS_CLASS[req.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
                        )}
                      >
                        {STATUS_LABEL[req.status] ?? req.status}
                      </span>
                      <span className="text-[0.65rem] text-[#7A7168]/70 uppercase tracking-wider">
                        {req.kind === 'activity' ? 'Actividad' : 'Wellness'}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#7A7168]">
                      <span>{req.bookingTitle}</span>
                      {req.applicantEmail && <span>{req.applicantEmail}</span>}
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3" />
                        {req.numGuests} persona{req.numGuests !== 1 ? 's' : ''}
                      </span>
                      {req.requestedDate && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {req.requestedDate}
                        </span>
                      )}
                    </div>
                    {req.notes && (
                      <p className="mt-2 rounded-lg bg-[#FAFAF8] px-3 py-2 text-xs text-[#7A7168]">
                        “{req.notes}”
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex gap-2 border-t border-[rgba(62,45,35,0.08)] pt-3">
                  {req.status === 'pending' ? (
                    <>
                      <form action={confirm}>
                        <button
                          type="submit"
                          className="rounded-xl bg-[#4A9A92] px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                        >
                          Confirmar
                        </button>
                      </form>
                      <form action={decline}>
                        <button
                          type="submit"
                          className="rounded-xl border border-red-200 px-4 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          Rechazar
                        </button>
                      </form>
                    </>
                  ) : (
                    <form action={reopen}>
                      <button
                        type="submit"
                        className="rounded-xl border border-[rgba(62,45,35,0.18)] px-4 py-1.5 text-xs text-[#7A7168] transition-colors hover:border-[rgba(62,45,35,0.3)] hover:text-[#3E2D23]"
                      >
                        Reabrir como pendiente
                      </button>
                    </form>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
