-- ══════════════════════════════════════════════════════════════
-- Foto de perfil del viajero + cierre de un agujero en profiles
-- Correr en el SQL Editor de Supabase. Es idempotente.
-- ══════════════════════════════════════════════════════════════

-- ── 1. La foto ────────────────────────────────────────────────
alter table profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB: una foto de móvil entra de sobra
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public             = true,
    file_size_limit    = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Lectura pública; la subida la hace el servidor con la service role después
-- de comprobar la sesión, igual que en el banco de imágenes.
drop policy if exists "avatars: public read" on storage.objects;
create policy "avatars: public read" on storage.objects for select
  using (bucket_id = 'avatars');

-- ── 2. Que nadie se ascienda a admin ──────────────────────────
-- La política "profiles: owner update" solo comprueba `id = auth.uid()`, y en
-- Postgres esa misma expresión hace de WITH CHECK. Es decir: cualquier cliente
-- registrado podía hacer `update profiles set role = 'admin'` sobre su propia
-- fila desde el navegador y entrar al panel. El trigger deja pasar el resto de
-- cambios del perfil (nombre, teléfono, foto) pero devuelve el rol a su sitio.
create or replace function prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_no_role_escalation on profiles;
create trigger profiles_no_role_escalation
  before update on profiles
  for each row execute function prevent_role_escalation();
