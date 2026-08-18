// Los hosts que `next/image` puede optimizar. Es una lista blanca: cualquier
// otro dominio devuelve 400 y la foto se cae al placeholder. Vive aquí y no en
// next.config para que el panel pueda avisar al pegar una URL que no va a verse.

export const ALLOWED_IMAGE_HOSTS = [
  '**.supabase.co', // el banco de imágenes propio
  'images.unsplash.com',
  'picsum.photos',
  'fastly.picsum.photos',
] as const

/** ¿Coincide el host con un patrón de la lista (`**.` = cualquier subdominio)? */
function matches(host: string, pattern: string): boolean {
  if (pattern.startsWith('**.')) {
    const base = pattern.slice(3)
    return host === base || host.endsWith(`.${base}`)
  }
  return host === pattern
}

/**
 * `true` si la URL se va a poder mostrar en la app. Las rutas relativas y los
 * valores vacíos cuentan como válidos: no son dominios externos.
 */
export function isAllowedImageHost(url: string | null | undefined): boolean {
  if (!url) return true
  if (url.startsWith('/')) return true
  let host: string
  try {
    host = new URL(url).hostname
  } catch {
    return false
  }
  return ALLOWED_IMAGE_HOSTS.some((p) => matches(host, p))
}
