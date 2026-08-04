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

/** URL base para los links de retorno de Checkout. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
