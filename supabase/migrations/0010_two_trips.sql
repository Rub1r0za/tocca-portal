-- 0010 — Dos viajes independientes dentro del portal.
-- Los datos existentes quedan en Viaje 1. Las plantillas 15–21 se reconocen
-- como Yoga Retreat / Viaje 2 según la numeración indicada por operaciones.

alter table travelers add column if not exists trip_number smallint not null default 1
  check (trip_number in (1, 2));
alter table journey_days add column if not exists trip_number smallint not null default 1
  check (trip_number in (1, 2));
alter table day_templates add column if not exists trip_number smallint not null default 1
  check (trip_number in (1, 2));
alter table activities add column if not exists trip_number smallint not null default 1
  check (trip_number in (1, 2));
alter table wellness_options add column if not exists trip_number smallint not null default 1
  check (trip_number in (1, 2));

update day_templates set trip_number = 2 where sort_order between 15 and 21;
update journey_days set trip_number = 2 where day_number between 15 and 21;

create index if not exists travelers_booking_trip_idx on travelers (booking_id, trip_number);
create index if not exists journey_days_booking_trip_idx on journey_days (booking_id, trip_number, day_number);
create index if not exists activities_trip_active_idx on activities (trip_number, active);
create index if not exists wellness_options_trip_active_idx on wellness_options (trip_number, active);
