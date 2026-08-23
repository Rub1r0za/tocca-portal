-- ══════════════════════════════════════════════════════════════
-- El orden de las actividades lo decide Jess, no el precio
-- Correr en el SQL Editor de Supabase. Es idempotente.
-- ══════════════════════════════════════════════════════════════
--
-- Hasta ahora el portal ordenaba "Día Libre" por precio ascendente, así que
-- la cena —lo más barato— salía la primera aunque en el panel estuviera al
-- final. Con esta columna el panel y el portal enseñan la misma lista, y las
-- flechas del panel son las que la mueven.

alter table activities add column if not exists sort_order int not null default 0;

-- Numeramos lo que ya existe por antigüedad para que nadie empiece empatado.
with ranked as (
  select id, row_number() over (order by created_at) as rn
  from activities
)
update activities a
set sort_order = r.rn
from ranked r
where a.id = r.id
  and a.sort_order = 0;

create index if not exists activities_sort_order_idx on activities (sort_order);
