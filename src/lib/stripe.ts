import Stripe from 'stripe'

let client: Stripe | null = null

/**
 * Cliente de Stripe (lazy: así el build no falla si la env var no está puesta).
 * La versión de API la fija el SDK — no la pasamos a mano para que no se
 * desincronice de los tipos al actualizar el paquete.
 */
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY no está configurada')
    client = new Stripe(key)
  }
  return client
}

/**
 * Normaliza a un origen absoluto, o null si no hay forma de sacarlo.
 * Vercel expone sus hosts sin esquema (`mi-app.vercel.app`) y es fácil que la
 * variable se configure a mano igual — pero Stripe rechaza el success_url si
 * no es una URL absoluta, así que le ponemos el https:// nosotros.
 */
function toOrigin(raw: string | undefined): string | null {
  const trimmed = raw?.trim().replace(/\/+$/, '')
  if (!trimmed) return null
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    return new URL(withScheme).origin
  } catch {
    return null
  }
}

/** URL base para los links de retorno de Checkout. */
export function siteUrl(): string {
  return (
    toOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    toOrigin(process.env.VERCEL_URL) ??
    'http://localhost:3000'
  )
}
