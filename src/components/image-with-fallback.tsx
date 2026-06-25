'use client'

import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  src: string | null | undefined
  alt: string
  /** Classes for the wrapper element (controls size / aspect ratio). */
  className?: string
  sizes?: string
  priority?: boolean
}

/**
 * Renders an image that never breaks the layout: while loading it shows a
 * shimmer, and if the URL is missing or fails it shows an elegant gradient
 * placeholder. Image hosts must be allowed in next.config.ts (remotePatterns).
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  sizes = '(max-width: 480px) 100vw, 430px',
  priority = false,
}: Props) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const showFallback = !src || errored

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-[#11202b] via-[#15202a] to-[#0f1115]',
        className
      )}
    >
      {showFallback ? (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <ImageOff className="size-6 text-mist/40" strokeWidth={1.25} />
        </div>
      ) : (
        <>
          {!loaded && <div className="absolute inset-0 tocca-shimmer" aria-hidden />}
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={cn(
              'object-cover transition-opacity duration-500',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        </>
      )}
      {/* Subtle bottom gradient for text legibility over imagery */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent"
        aria-hidden
      />
    </div>
  )
}
