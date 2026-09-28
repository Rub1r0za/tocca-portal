'use client'

export default function SummaryError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-3xl rounded-2xl border border-amber-300 bg-white p-6 text-[#3E2D23]">
      <h1 className="text-lg font-semibold">No se pudo cargar el consolidado completo</h1>
      <p className="mt-2 text-sm">No podemos confirmar quién tiene selecciones pendientes hasta cargar todos los datos. Intenta de nuevo antes de contactar a los viajeros.</p>
      <button type="button" onClick={reset} className="mt-4 rounded-xl bg-[#4A9A92] px-4 py-2 text-sm text-white">
        Reintentar
      </button>
    </div>
  )
}
