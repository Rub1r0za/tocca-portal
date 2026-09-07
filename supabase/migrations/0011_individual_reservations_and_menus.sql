-- 0011 — Menús por día, wellness ordenable y catálogo separado de reservas individuales.

alter table journey_days add column if not exists menu_image_url text;
alter table day_templates add column if not exists menu_image_url text;

alter table wellness_options add column if not exists sort_order int not null default 0;

with ranked as (
  select id, row_number() over (partition by trip_number order by created_at) as rn
  from wellness_options
)
update wellness_options w
set sort_order = ranked.rn
from ranked
where w.id = ranked.id and w.sort_order = 0;

alter table travelers drop constraint if exists travelers_trip_number_check;
alter table journey_days drop constraint if exists journey_days_trip_number_check;
alter table day_templates drop constraint if exists day_templates_trip_number_check;
alter table activities drop constraint if exists activities_trip_number_check;
alter table wellness_options drop constraint if exists wellness_options_trip_number_check;

alter table travelers add constraint travelers_trip_number_check check (trip_number in (1, 2, 3));
alter table journey_days add constraint journey_days_trip_number_check check (trip_number in (1, 2, 3));
alter table day_templates add constraint day_templates_trip_number_check check (trip_number in (1, 2, 3));
alter table activities add constraint activities_trip_number_check check (trip_number in (1, 2, 3));
alter table wellness_options add constraint wellness_options_trip_number_check check (trip_number in (1, 2, 3));

create index if not exists wellness_options_trip_sort_idx on wellness_options (trip_number, sort_order);
