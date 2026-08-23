import { createAdminClient } from '@/lib/supabase/admin'
import { ActivityCard } from './activity-card'
import { ActivityForm, type Activity } from './activity-form'

export default async function ActivitiesAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const admin = createAdminClient()

  // Mismo orden que el portal: lo que Jess ve aquí es lo que ve el viajero.
  const { data } = await admin
    .from('activities')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  const activities = (data ?? []) as Activity[]
  const activeCount = activities.filter((a) => a.active).length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl text-[#3E2D23] sm:text-3xl"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Actividades
          </h1>
          <p className="mt-0.5 text-sm text-[#7A7168]">
            Catálogo global: {activeCount} visible{activeCount !== 1 ? 's' : ''} de {activities.length}
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              locale={locale}
              index={index}
              total={activities.length}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[rgba(62,45,35,0.2)] bg-white p-8 text-center">
            <p className="text-sm text-[#7A7168]">No hay actividades aún. Crea la primera.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
        <h2 className="mb-4 text-base font-medium text-[#3E2D23]">Nueva actividad</h2>
        <ActivityForm locale={locale} />
      </div>
    </div>
  )
}
