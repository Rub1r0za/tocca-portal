-- ════════════════════════════════════════════════════════════════
-- 0002 — Signature Journey modular:
--   1. journey_days: Tocca Tips, Good to Know, Day Vibe, día libre
--   2. day_templates: biblioteca de días sueltos que el admin arma
--      por cliente/grupo (el Signature Journey de 10 días es la base)
-- ════════════════════════════════════════════════════════════════

-- 1. Campos nuevos por día del viaje
alter table journey_days add column if not exists tocca_tips   jsonb not null default '[]';  -- [{"en":"...","es":"..."}]
alter table journey_days add column if not exists good_to_know jsonb not null default '[]';  -- [{"en":"...","es":"..."}]
alter table journey_days add column if not exists day_vibe     jsonb not null default '{}';  -- {"en":"...","es":"..."}
alter table journey_days add column if not exists is_free_day  boolean not null default false;

-- 2. Biblioteca de plantillas de día
create table if not exists day_templates (
  id            uuid primary key default uuid_generate_v4(),
  sort_order    integer not null default 0,
  title         jsonb not null default '{}',
  description   jsonb not null default '{}',
  location      text,
  image_url     text,
  schedule      jsonb not null default '[]',  -- [{"time":"7:00 PM","title":{"en":"...","es":"..."}}]
  included      jsonb not null default '[]',
  meeting_point jsonb not null default '{}',
  day_notes     jsonb not null default '{}',
  tocca_tips    jsonb not null default '[]',
  good_to_know  jsonb not null default '[]',
  day_vibe      jsonb not null default '{}',
  is_free_day   boolean not null default false,
  -- Menús con selección: al copiar la plantilla a una reserva se crean
  -- filas en `meals` para ese día. [{"course":"starter|main|dessert","name":{},"description":{}}]
  meals         jsonb not null default '[]',
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Solo el panel admin (service role) lee/escribe plantillas.
alter table day_templates enable row level security;
