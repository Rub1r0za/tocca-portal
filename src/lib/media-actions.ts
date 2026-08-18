'use server'

// Banco de imágenes propio: las fotos viven en el bucket público `media` de
// Supabase Storage en vez de depender de enlaces ajenos que pueden caerse o
// borrarse. `*.supabase.co` ya está en la lista blanca de next/image, así que
// todo lo que se suba aquí se ve en la app sin tocar configuración.

import { revalidatePath } from 'next/cache'
import { createAdminClient } from './supabase/admin'
import { isAdmin } from './admin-auth'

const BUCKET = 'media'
const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

export type MediaItem = {
  /** Ruta dentro del bucket; es lo que hace falta para borrar. */
  path: string
  url: string
  size: number
  createdAt: string | null
}

/** Nombre de archivo seguro y único, conservando algo del original. */
function safeName(original: string): string {
  const dot = original.lastIndexOf('.')
  const ext = (dot > -1 ? original.slice(dot + 1) : 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const stem = (dot > -1 ? original.slice(0, dot) : original)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'imagen'
  return `${stem}-${crypto.randomUUID().slice(0, 8)}.${ext}`
}

export async function uploadMedia(formData: FormData): Promise<{ url?: string; error?: string }> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'Elige un archivo.' }
  if (file.size > MAX_BYTES) return { error: 'La imagen pesa más de 8 MB. Reduce el tamaño e inténtalo otra vez.' }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Formato no admitido. Usa JPG, PNG, WebP, AVIF o GIF.' }
  }

  const admin = createAdminClient()
  const path = safeName(file.name || 'imagen.jpg')
  const { error } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
  })
  if (error) {
    console.error('[media] no se pudo subir', error)
    // El caso habitual la primera vez: el bucket no existe todavía.
    return {
      error: error.message.toLowerCase().includes('not found')
        ? 'Falta crear el bucket "media" en Supabase (migración 0006).'
        : error.message,
    }
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path)
  revalidatePath('/es/admin/media')
  revalidatePath('/en/admin/media')
  return { url: data.publicUrl }
}

export async function listMedia(): Promise<MediaItem[]> {
  if (!(await isAdmin())) return []

  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(BUCKET).list('', {
    limit: 200,
    sortBy: { column: 'created_at', order: 'desc' },
  })
  if (error || !data) return []

  return data
    // Supabase deja un marcador oculto en carpetas vacías; no es una imagen.
    .filter((f) => !f.name.startsWith('.'))
    .map((f) => ({
      path: f.name,
      url: admin.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
      size: f.metadata?.size ?? 0,
      createdAt: f.created_at ?? null,
    }))
}

export async function deleteMedia(path: string, locale: string): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  const admin = createAdminClient()
  const { error } = await admin.storage.from(BUCKET).remove([path])
  if (error) return { error: error.message }

  revalidatePath(`/${locale}/admin/media`)
  return {}
}
