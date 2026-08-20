import { CheckCircle2, TriangleAlert } from 'lucide-react'
import { TestEmailForm } from './test-email-form'

export const metadata = { title: 'Correo · Tocca' }

/** Oculta el buzón sin ocultar el dominio: basta para reconocer si es el correcto. */
function mask(address: string): string {
  const [user, domain] = address.split('@')
  if (!domain) return address
  const shown = user.slice(0, 2)
  return `${shown}${'•'.repeat(Math.max(1, user.length - 2))}@${domain}`
}

export default async function EmailAdminPage() {
  const to = process.env.ADMIN_NOTIFY_EMAIL || ''
  const from = process.env.EMAIL_FROM || 'Tocca Amalfi Coast <onboarding@resend.dev>'
  const hasKey = Boolean(process.env.RESEND_API_KEY)
  const sharedSender = from.includes('resend.dev')

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1
          className="text-2xl text-[#3E2D23] sm:text-3xl"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Correo
        </h1>
        <p className="mt-0.5 text-sm text-[#7A7168]">
          Dónde llegan los avisos del portal y si de verdad están saliendo.
        </p>
      </div>

      <dl className="mb-6 overflow-hidden rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
        <Row
          label="Avisos internos van a"
          value={to ? mask(to) : 'sin configurar'}
          bad={!to}
          hint={
            to
              ? 'Es ADMIN_NOTIFY_EMAIL en Vercel. Si no es tu buzón, los avisos llevan tiempo llegando a otra parte.'
              : 'Falta ADMIN_NOTIFY_EMAIL en Vercel: los avisos van a la dirección por defecto del código.'
          }
        />
        <Row
          label="Se envían desde"
          value={from}
          bad={sharedSender}
          hint={
            sharedSender
              ? 'Con el remitente compartido de Resend solo llegan a tu propia cuenta. Define EMAIL_FROM con tu dominio.'
              : undefined
          }
        />
        <Row
          label="Clave de Resend"
          value={hasKey ? 'configurada' : 'falta'}
          bad={!hasKey}
          hint={hasKey ? undefined : 'Sin RESEND_API_KEY no sale ningún correo del portal.'}
        />
      </dl>

      <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
        <h2 className="text-base font-medium text-[#3E2D23]">Enviar una prueba</h2>
        <p className="mt-1 mb-4 text-xs text-[#7A7168]">
          Manda un correo real por la misma vía que los avisos. Si falla, aquí sale el motivo
          exacto en vez de perderse en los registros.
        </p>
        <TestEmailForm defaultTo={to} />
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  bad,
  hint,
}: {
  label: string
  value: string
  bad?: boolean
  hint?: string
}) {
  return (
    <div className="border-b border-[rgba(62,45,35,0.08)] px-5 py-4 last:border-b-0">
      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#7A7168]">
        {label}
      </dt>
      <dd className="mt-1 flex items-start gap-2">
        {bad ? (
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
        ) : (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#4A9A92]" />
        )}
        <div className="min-w-0">
          <p className="break-all text-sm text-[#3E2D23]">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-[#7A7168]">{hint}</p>}
        </div>
      </dd>
    </div>
  )
}
