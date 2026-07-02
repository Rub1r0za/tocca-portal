import { createAdminClient } from '@/lib/supabase/admin'
import { WellnessCard } from './wellness-card'
import { WellnessForm, type WellnessOption } from './wellness-form'

export default async function WellnessAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const admin = createAdminClient()

  const { data } = await admin
    .from('wellness_options')
    .select('*')
    .order('created_at', { ascending: false })

  const options = (data ?? []) as WellnessOption[]
  const activeCount = options.filter((o) => o.active).length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1
          className="text-2xl text-[#3E2D23] sm:text-3xl"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Wellness
        </h1>
        <p className="mt-0.5 text-sm text-[#7A7168]">
          Catálogo global: {activeCount} visible{activeCount !== 1 ? 's' : ''} de {options.length}
        </p>
      </div>

      <div className="mb-6 space-y-4">
        {options.length > 0 ? (
          options.map((option) => (
            <WellnessCard key={option.id} option={option} locale={locale} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[rgba(62,45,35,0.2)] bg-white p-8 text-center">
            <p className="text-sm text-[#7A7168]">No hay opciones de wellness aún. Crea la primera.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
        <h2 className="mb-4 text-base font-medium text-[#3E2D23]">Nueva opción de wellness</h2>
        <WellnessForm locale={locale} />
      </div>
    </div>
  )
}
