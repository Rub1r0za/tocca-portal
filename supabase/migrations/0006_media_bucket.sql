-- ══════════════════════════════════════════════════════════════
-- Banco de imágenes — bucket público `media`
-- Correr en el SQL Editor de Supabase. Es idempotente.
--
-- Las fotos del itinerario, actividades, wellness y platos se suben
-- aquí desde el panel (Admin → Imágenes) en vez de apuntar a webs
-- ajenas: `*.supabase.co` ya está en la lista blanca de next/image,
-- así que se ven siempre y no dependen de que un tercero no las borre.
-- ══════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  8388608, -- 8 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
set public             = true,
    file_size_limit    = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Lectura pública. La escritura no lleva política a propósito: solo el panel
-- sube y borra, y lo hace con la service role, que se salta RLS. Así ningún
-- cliente autenticado puede escribir en el bucket.
drop policy if exists "media: public read" on storage.objects;
create policy "media: public read" on storage.objects for select
  using (bucket_id = 'media');
