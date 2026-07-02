import { ClientForm } from './client-form'

export default async function NewClientPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h1
          className="text-2xl text-[#3E2D23] sm:text-3xl"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Nuevo cliente
        </h1>
        <p className="mt-0.5 text-sm text-[#7A7168]">
          Crea la cuenta directamente — tu cliente entra con email y contraseña, sin
          depender de correos de acceso.
        </p>
      </div>

      <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)] sm:p-6">
        <ClientForm locale={locale} />
      </div>
    </div>
  )
}
