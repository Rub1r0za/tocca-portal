import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { ALLOWED_IMAGE_HOSTS } from './src/lib/image-hosts'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
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
