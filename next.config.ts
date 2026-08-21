import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { ALLOWED_IMAGE_HOSTS } from './src/lib/image-hosts'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Por defecto son 1 MB y las Server Actions que suben imágenes (banco de
      // imágenes y foto de perfil) admiten más: una foto de móvil pasa de 1 MB
      // sin esfuerzo y la subida fallaba antes de llegar a la acción.
      bodySizeLimit: '10mb',
    },
  },
  images: {
    // Lista blanca compartida con el panel (src/lib/image-hosts.ts), que avisa
    // cuando se pega una URL de un dominio que no está aquí.
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({
      protocol: 'https' as const,
      hostname,
    })),
  },
}

export default withNextIntl(nextConfig)
