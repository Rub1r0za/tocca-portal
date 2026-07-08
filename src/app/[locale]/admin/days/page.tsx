import { createAdminClient } from '@/lib/supabase/admin'
import type { DayTemplate } from '@/lib/types'
import { DayTemplateCard } from './day-template-card'
import { DayTemplateForm } from './day-template-form'

export default async function DayTemplatesAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const admin = createAdminClient()

  const { data } = await admin
    .from('day_templates')
    .select('*')
    .order('sort_order', { ascending: true })

  const templates = (data ?? []) as DayTemplate[]
  const activeCount = templates.filter((t) => t.active).length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1
          className="text-2xl text-[#3E2D23] sm:text-3xl"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Días del journey
        </h1>
        <p className="mt-0.5 text-sm text-[#7A7168]">
          Biblioteca de días sueltos ({activeCount} activo{activeCount !== 1 ? 's' : ''} de {templates.length}).
          Desde el journey de cada reserva puedes añadirlos uno a uno o el Signature Journey completo, y luego ajustar lo que quieras para ese grupo.
        </p>
      </div>

      <div className="mb-6 space-y-4">
        {templates.length > 0 ? (
          templates.map((template) => (
            <DayTemplateCard key={template.id} template={template} locale={locale} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[rgba(62,45,35,0.2)] bg-white p-8 text-center">
            <p className="text-sm text-[#7A7168]">No hay plantillas de día aún. Crea la primera.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
        <h2 className="mb-4 text-base font-medium text-[#3E2D23]">Nuevo día</h2>
        <DayTemplateForm locale={locale} />
      </div>
    </div>
  )
}
