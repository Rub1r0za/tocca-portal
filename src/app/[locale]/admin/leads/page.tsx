import { createAdminClient } from '@/lib/supabase/admin'
import { Cake } from 'lucide-react'
import type { Lead } from '@/lib/types'
import { LeadCard } from './lead-card'
import { LeadForm } from './lead-form'

/** Days from today until this lead's next birthday (0 = today), or null. */
function daysUntilBirthday(iso: string | null): number | null {
  if (!iso) return null
  const [, m, d] = iso.split('-').map(Number)
  if (!m || !d) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let next = new Date(today.getFullYear(), m - 1, d)
  if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d)
  return Math.round((next.getTime() - today.getTime()) / 86_400_000)
}

function birthdayShort(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  return new Date(2000, (m ?? 1) - 1, d ?? 1).toLocaleDateString('es', { day: 'numeric', month: 'long' })
}

export default async function LeadsAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const admin = createAdminClient()

  const { data } = await admin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  const leads = (data ?? []) as Lead[]

  // Upcoming birthdays within the next 30 days
  const upcoming = leads
    .map((l) => ({ lead: l, days: daysUntilBirthday(l.birthday) }))
    .filter((x): x is { lead: Lead; days: number } => x.days !== null && x.days <= 30)
    .sort((a, b) => a.days - b.days)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1
          className="text-2xl text-[#3E2D23] sm:text-3xl"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Contactos
        </h1>
        <p className="mt-0.5 text-sm text-[#7A7168]">
          Agenda de viajeros pasados y contactos potenciales (Instagram, referidos…). {leads.length} en total.
        </p>
      </div>

      {/* Upcoming birthdays */}
      {upcoming.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800">
            <Cake className="size-4" /> Próximos cumpleaños (30 días)
          </h2>
          <ul className="space-y-1.5">
            {upcoming.map(({ lead, days }) => (
              <li key={lead.id} className="flex flex-wrap items-center gap-x-2 text-xs text-amber-900">
                <span className="font-medium">{lead.full_name}</span>
                <span>· {birthdayShort(lead.birthday!)}</span>
                <span className="text-amber-700">
                  ({days === 0 ? '¡hoy!' : days === 1 ? 'mañana' : `en ${days} días`})
                </span>
                {lead.phone && (
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4A9A92] hover:underline"
                  >
                    WhatsApp →
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contacts list */}
      <div className="mb-6 space-y-4">
        {leads.length > 0 ? (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} locale={locale} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-[rgba(62,45,35,0.2)] bg-white p-8 text-center">
            <p className="text-sm text-[#7A7168]">No hay contactos aún. Añade el primero abajo.</p>
          </div>
        )}
      </div>

      {/* New contact */}
      <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
        <h2 className="mb-4 text-base font-medium text-[#3E2D23]">Nuevo contacto</h2>
        <LeadForm locale={locale} />
      </div>
    </div>
  )
}
