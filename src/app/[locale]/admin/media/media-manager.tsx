'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { uploadMedia, deleteMedia, type MediaItem } from '@/lib/media-actions'

const fmtSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`

export function MediaManager({ items, locale }: { items: MediaItem[]; locale: string }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    if (files.length === 0) return

    setBusy(true)
    setError('')
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadMedia(formData)
      // Un archivo malo no debe cancelar el resto de la tanda.
      if (result.error) setError(`${file.name}: ${result.error}`)
    }
    setBusy(false)
    router.refresh()
  }

  async function handleDelete(path: string) {
    if (!confirm(`¿Borrar "${path}"? Los días o actividades que la usen se quedarán sin foto.`)) return
    setBusy(true)
    const result = await deleteMedia(path, locale)
    setBusy(false)
    if (result.error) setError(result.error)
    router.refresh()
  }

  async function copy(url: string, path: string) {
    await navigator.clipboard.writeText(url)
    setCopied(path)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-xl bg-[#4A9A92] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
          Subir imágenes
        </button>
        <p className="mt-2 text-xs text-[#7A7168]">
          JPG, PNG, WebP, AVIF o GIF · hasta 8 MB cada una · puedes elegir varias a la vez.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(62,45,35,0.2)] bg-white p-8 text-center">
          <p className="text-sm text-[#7A7168]">Aún no hay imágenes. Sube la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.path}
              className="overflow-hidden rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white shadow-[0_1px_4px_rgba(62,45,35,0.06)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.path} className="aspect-[4/3] w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-xs text-[#3E2D23]" title={item.path}>
                  {item.path}
                </p>
                <p className="mt-0.5 text-[0.65rem] text-[#7A7168]">{fmtSize(item.size)}</p>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => copy(item.url, item.path)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[rgba(62,45,35,0.18)] px-2 py-1 text-[0.65rem] text-[#7A7168] transition-colors hover:text-[#3E2D23]"
                  >
                    {copied === item.path ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied === item.path ? 'Copiada' : 'Copiar URL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.path)}
                    disabled={busy}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-[0.65rem] text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 className="size-3" />
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
