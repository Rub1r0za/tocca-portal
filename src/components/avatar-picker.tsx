'use client'

import Image from 'next/image'
import { useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Camera, Loader2 } from 'lucide-react'
import { uploadAvatar, type AvatarError } from '@/lib/avatar-actions'

const ERROR_KEY: Record<AvatarError, string> = {
  unauthorized: 'errorGeneric',
  no_file: 'errorGeneric',
  too_big: 'errorTooBig',
  bad_type: 'errorBadType',
  failed: 'errorGeneric',
}

/**
 * El avatar del saludo. Mientras no haya foto muestra la inicial, que es lo
 * que el viajero ve el primer día; al tocarlo abre la galería del teléfono.
 */
export function AvatarPicker({
  initial,
  avatarUrl,
}: {
  initial: string
  avatarUrl: string | null
}) {
  const t = useTranslations('avatar')
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(avatarUrl)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // El input se vacía enseguida para que elegir la misma foto otra vez
    // vuelva a disparar el change.
    event.target.value = ''
    if (!file) return

    setError(null)
    startTransition(async () => {
      const data = new FormData()
      data.set('file', file)
      const result = await uploadAvatar(data)
      if (result.url) setUrl(result.url)
      else if (result.error) setError(t(ERROR_KEY[result.error]))
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        aria-label={t('change')}
        className="group relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/15 text-lg text-white backdrop-blur-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-70"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
      >
        {url ? (
          <Image src={url} alt="" fill sizes="44px" className="object-cover" />
        ) : (
          <span aria-hidden>{initial}</span>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera className="size-4 text-white" aria-hidden />
        </span>

        {pending && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="size-4 animate-spin text-white" aria-hidden />
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onPick}
        className="sr-only"
        tabIndex={-1}
      />

      {error && (
        <p
          role="status"
          className="absolute top-full left-0 z-10 mt-2 w-max max-w-[15rem] rounded-lg bg-destructive px-2.5 py-1.5 text-[0.7rem] leading-snug text-white shadow-lg"
        >
          {error}
        </p>
      )}
    </div>
  )
}
