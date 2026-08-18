import { listMedia } from '@/lib/media-actions'
import { MediaManager } from './media-manager'

export default async function MediaAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const items = await listMedia()

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1
          className="text-2xl text-[#3E2D23] sm:text-3xl"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Banco de imágenes
        </h1>
        <p className="mt-0.5 text-sm text-[#7A7168]">
          {items.length} imagen{items.length !== 1 ? 'es' : ''} guardada{items.length !== 1 ? 's' : ''}.
          Todo lo que subas aquí queda alojado en Tocca y se puede elegir desde cualquier
          formulario del panel, sin depender de enlaces de otras webs que pueden caerse.
        </p>
      </div>

      <MediaManager items={items} locale={locale} />
    </div>
  )
}
