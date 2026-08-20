-- ══════════════════════════════════════════════════════════════
-- Quién va a cada actividad / wellness
-- Correr en el SQL Editor de Supabase. Es idempotente.
--
-- Hasta ahora la solicitud solo guardaba CUÁNTAS personas iban
-- (`num_guests`), así que el panel podía decir "3 personas" pero
-- nunca quiénes. Se añade la lista de viajeros para poder armar el
-- consolidado por persona, igual que ya existe con las comidas.
--
-- `num_guests` se mantiene: las solicitudes viejas no tienen lista y
-- se siguen mostrando por su número.
-- ══════════════════════════════════════════════════════════════

alter table activity_requests add column if not exists traveler_ids uuid[] not null default '{}';
alter table wellness_requests add column if not exists traveler_ids uuid[] not null default '{}';
