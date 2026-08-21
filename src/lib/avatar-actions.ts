'use server'

// Foto de perfil del viajero. Sube con la service role —igual que el banco de
// imágenes— pero solo después de resolver la sesión: la ruta se construye con
// el id del usuario autenticado, nunca con nada que venga del formulario.

import { revalidatePath } from 'next/cache'
import { createClient } from './supabase/server'
import { createAdminClient } from './supabase/admin'

const BUCKET = 'avatars'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/** Códigos, no frases: el portal es bilingüe y el texto lo pone el cliente. */
export type AvatarError = 'unauthorized' | 'no_file' | 'too_big' | 'bad_type' | 'failed'

export async function uploadAvatar(
  formData: FormData,
): Promise<{ url?: string; error?: AvatarError }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'unauthorized' }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'no_file' }
  if (file.size > MAX_BYTES) return { error: 'too_big' }
  if (!ALLOWED_TYPES.includes(file.type)) return { error: 'bad_type' }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const path = `${user.id}/${crypto.randomUUID().slice(0, 8)}.${ext}`

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
  })
  if (uploadError) {
    console.error('[avatar] no se pudo subir', uploadError)
    return { error: 'failed' }
  }

  const { data: publicUrl } = admin.storage.from(BUCKET).getPublicUrl(path)

  const { error: profileError } = await admin
    .from('profiles')
    .update({ avatar_url: publicUrl.publicUrl })
    .eq('id', user.id)
  if (profileError) {
    console.error('[avatar] no se pudo guardar en el perfil', profileError)
    return { error: 'failed' }
  }

  // Una foto por persona: las anteriores solo ocupan sitio.
  const { data: previous } = await admin.storage.from(BUCKET).list(user.id)
  const stale = (previous ?? [])
    .filter((f) => !f.name.startsWith('.') && `${user.id}/${f.name}` !== path)
    .map((f) => `${user.id}/${f.name}`)
  if (stale.length > 0) await admin.storage.from(BUCKET).remove(stale)

  revalidatePath('/es/dashboard')
  revalidatePath('/en/dashboard')
  return { url: publicUrl.publicUrl }
}
