'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Images, Loader2, Trash2, TriangleAlert } from 'lucide-react'
import { uploadMedia, listMedia, type MediaItem } from '@/lib/media-actions'
import { isAllowedImageHost } from '@/lib/image-hosts'

const inputClass =
  'w-full rounded-xl border border-[rgba(62,45,35,0.18)] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#3E2D23] placeholder:text-[#7A7168]/60 focus:border-[#4A9A92] focus:outline-none focus:ring-2 focus:ring-[#4A9A92]/20'
const labelClass = 'mb-1.5 block text-[0.7rem] font-semibold tracking-[0.18em] text-[#7A7168] uppercase'
const buttonClass =
  'inline-flex items-center gap-1.5 rounded-xl border border-[rgba(62,45,35,0.18)] px-3 py-1.5 text-xs text-[#7A7168] transition-colors hover:border-[#4A9A92]/40 hover:text-[#3E2D23] disabled:opacity-60'

/**
 * Campo de imagen del panel. Sigue enviando `image_url` como texto —las Server
 * Actions no cambian— pero permite subir al banco o elegir algo ya subido, y
 * avisa cuando la URL pegada es de un dominio que la app no puede mostrar.
 */
export function ImageField({
  name = 'image_url',
  defaultValue = '',
  label = 'Imagen',
}: {
  name?: string
  defaultValue?: string | null
  label?: string
}) {
  const [value, setValue] = useState(defaultValue ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [bank, setBank] = useState<MediaItem[] | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // El input es controlado, así que `form.reset()` no lo limpiaría solo: los
  // formularios de "añadir" se resetean tras enviar y la foto del día anterior
  // se quedaría pegada en el siguiente.
  useEffect(() => {
    const form = rootRef.current?.closest('form')
    if (!form) return
    const onReset = () => setValue(defaultValue ?? '')
    form.addEventListener('reset', onReset)
    return () => form.removeEventListener('reset', onReset)
  }, [defaultValue])

  const blockedHost = value.trim() !== '' && !isAllowedImageHost(value.trim())

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite volver a elegir el mismo archivo
    if (!file) return

    setBusy(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    const result = await uploadMedia(formData)
    setBusy(false)

    if (result.error) setError(result.error)
    else if (result.url) {
      setValue(result.url)
      setBank(null)
    }
  }

  async function toggleBank() {
    if (bank) {
      setBank(null)
      return
    }
    setBusy(true)
    setError('')
    setBank(await listMedia())
    setBusy(false)
  }

  return (
    <div ref={rootRef}>
      <label className={labelClass}>{label}</label>

      <div className="flex items-start gap-3">
        {/* Vista previa con <img> a propósito: así se ve incluso si el dominio
            no está permitido, que es justo lo que hay que poder diagnosticar. */}
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="size-16 shrink-0 rounded-xl border border-[rgba(62,45,35,0.12)] object-cover"
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-[rgba(62,45,35,0.2)] text-[#7A7168]/50">
            <ImagePlus className="size-5" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <input
            name={name}
            type="text"
            inputMode="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://… o sube una imagen"
            className={inputClass}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className={buttonClass}>
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
              Subir imagen
            </button>
            <button type="button" onClick={toggleBank} disabled={busy} className={buttonClass}>
              <Images className="size-3.5" />
              {bank ? 'Cerrar banco' : 'Elegir del banco'}
            </button>
            {value && (
              <button type="button" onClick={() => setValue('')} className={buttonClass}>
                <Trash2 className="size-3.5" />
                Quitar
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {blockedHost && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          Este dominio no está permitido, así que la foto no se verá en la app.
          Descárgala y súbela al banco con “Subir imagen”.
        </p>
      )}

      {bank && (
        <div className="mt-3 rounded-xl border border-[rgba(62,45,35,0.12)] bg-[#FAFAF8] p-3">
          {bank.length === 0 ? (
            <p className="py-3 text-center text-xs text-[#7A7168]">
              El banco está vacío. Sube la primera imagen.
            </p>
          ) : (
            <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
              {bank.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    setValue(item.url)
                    setBank(null)
                  }}
                  title={item.path}
                  className="aspect-square overflow-hidden rounded-lg border border-[rgba(62,45,35,0.12)] transition-all hover:border-[#4A9A92] hover:opacity-90"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.path} className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
