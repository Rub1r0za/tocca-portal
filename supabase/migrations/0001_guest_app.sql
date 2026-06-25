-- ══════════════════════════════════════════════════════════════
-- Tocca Amalfi Coast — Guest App migration (additive, idempotent)
-- Run AFTER schema.sql and setup.sql, in the Supabase SQL Editor.
--
-- Nothing here is destructive: only ADD COLUMN / CREATE TABLE /
-- enable RLS / (re)create policies. Safe to run more than once.
-- ══════════════════════════════════════════════════════════════

-- ── Shared enum for reservation requests ─────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'request_status') then
    create type request_status as enum ('pending', 'confirmed', 'declined', 'cancelled');
  end if;
end $$;

-- ── Enum for the travel timeline ─────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'timeline_event_type') then
    create type timeline_event_type as enum (
      'flight', 'transfer', 'experience', 'accommodation', 'meal', 'leisure'
    );
  end if;
end $$;

-- ════════════════════════════════════════════════════════════════
-- 1. journey_days — media + rich detail fields
-- ════════════════════════════════════════════════════════════════
alter table journey_days add column if not exists image_url     text;
alter table journey_days add column if not exists day_date      date;                 -- optional override; otherwise derived from booking.start_date
alter table journey_days add column if not exists schedule      jsonb not null default '[]';  -- [{ "time": "09:00", "title": {"en": "...", "es": "..."} }]
alter table journey_days add column if not exists included      jsonb not null default '[]';  -- [{"en": "...", "es": "..."}]
alter table journey_days add column if not exists meeting_point jsonb not null default '{}';  -- {"en": "...", "es": "..."}
alter table journey_days add column if not exists day_notes     jsonb not null default '{}';  -- {"en": "...", "es": "..."}
alter table journey_days add column if not exists gallery       jsonb not null default '[]';  -- ["https://...", "https://..."]

-- ════════════════════════════════════════════════════════════════
-- 2. activities — media + booking-catalog detail fields
-- ════════════════════════════════════════════════════════════════
alter table activities add column if not exists image_url           text;
alter table activities add column if not exists duration            jsonb not null default '{}';  -- {"en": "3 hours", "es": "3 horas"}
alter table activities add column if not exists time_label          jsonb not null default '{}';  -- {"en": "Morning", "es": "Mañana"}
alter table activities add column if not exists overview            jsonb not null default '{}';  -- {"en": "...", "es": "..."}
alter table activities add column if not exists included            jsonb not null default '[]';  -- [{"en": "...", "es": "..."}]
alter table activities add column if not exists requirements        jsonb not null default '[]';  -- [{"en": "...", "es": "..."}]
alter table activities add column if not exists cancellation_policy jsonb not null default '{}';  -- {"en": "...", "es": "..."}

-- ════════════════════════════════════════════════════════════════
-- 3. meals — optional dish image (dietary chips reuse `allergens`)
-- ════════════════════════════════════════════════════════════════
alter table meals add column if not exists image_url text;

-- ════════════════════════════════════════════════════════════════
-- 4. wellness_options — media + detail (existing table from schema.sql)
-- ════════════════════════════════════════════════════════════════
alter table wellness_options add column if not exists image_url text;
alter table wellness_options add column if not exists duration  jsonb not null default '{}';  -- {"en": "60 min", "es": "60 min"}
alter table wellness_options add column if not exists price     numeric(10,2);                 -- nullable; null = "on request"

-- ════════════════════════════════════════════════════════════════
-- 5. activity_requests — "Request Reservation" for Free Day Activities
-- ════════════════════════════════════════════════════════════════
create table if not exists activity_requests (
  id             uuid primary key default uuid_generate_v4(),
  booking_id     uuid not null references bookings(id) on delete cascade,
  activity_id    uuid not null references activities(id) on delete cascade,
  num_guests     integer not null default 1 check (num_guests >= 1),
  requested_date date,
  notes          text,
  status         request_status not null default 'pending',
  created_at     timestamptz not null default now()
);
create index if not exists activity_requests_booking_idx on activity_requests (booking_id);

-- ════════════════════════════════════════════════════════════════
-- 6. wellness_requests — "Request Reservation" for Wellness
-- ════════════════════════════════════════════════════════════════
create table if not exists wellness_requests (
  id                 uuid primary key default uuid_generate_v4(),
  booking_id         uuid not null references bookings(id) on delete cascade,
  wellness_option_id uuid not null references wellness_options(id) on delete cascade,
  num_guests         integer not null default 1 check (num_guests >= 1),
  requested_date     date,
  notes              text,
  status             request_status not null default 'pending',
  created_at         timestamptz not null default now()
);
create index if not exists wellness_requests_booking_idx on wellness_requests (booking_id);

-- ════════════════════════════════════════════════════════════════
-- 7. timeline_events — the Travel Timeline (read-only for guests)
-- ════════════════════════════════════════════════════════════════
create table if not exists timeline_events (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  sort_order  integer not null default 0,
  event_date  date,
  event_time  text,                                   -- free text, e.g. "14:30"
  type        timeline_event_type not null default 'experience',
  title       jsonb not null default '{}',            -- {"en": "...", "es": "..."}
  description jsonb not null default '{}',            -- {"en": "...", "es": "..."}
  location    text,
  created_at  timestamptz not null default now()
);
create index if not exists timeline_events_booking_idx on timeline_events (booking_id, sort_order);

-- ════════════════════════════════════════════════════════════════
-- 8. Row Level Security + policies
--    Mirrors the owner-scoped pattern from setup.sql.
-- ════════════════════════════════════════════════════════════════
alter table wellness_options    enable row level security;
alter table wellness_selections enable row level security;
alter table activity_requests   enable row level security;
alter table wellness_requests   enable row level security;
alter table timeline_events     enable row level security;

-- wellness_options: any active option is readable by authenticated clients
drop policy if exists "wellness_options: read active" on wellness_options;
create policy "wellness_options: read active" on wellness_options for select
  using (active = true or is_admin());

-- wellness_selections: locked to the owner's booking (kept for compatibility)
drop policy if exists "wellness_selections: owner read" on wellness_selections;
create policy "wellness_selections: owner read" on wellness_selections for select
  using (booking_id in (select id from bookings where user_id = auth.uid()) or is_admin());

drop policy if exists "wellness_selections: owner insert" on wellness_selections;
create policy "wellness_selections: owner insert" on wellness_selections for insert
  with check (booking_id in (select id from bookings where user_id = auth.uid()));

drop policy if exists "wellness_selections: owner delete" on wellness_selections;
create policy "wellness_selections: owner delete" on wellness_selections for delete
  using (booking_id in (select id from bookings where user_id = auth.uid()));

-- activity_requests: owner can read + create requests for their booking
drop policy if exists "activity_requests: owner read" on activity_requests;
create policy "activity_requests: owner read" on activity_requests for select
  using (booking_id in (select id from bookings where user_id = auth.uid()) or is_admin());

drop policy if exists "activity_requests: owner insert" on activity_requests;
create policy "activity_requests: owner insert" on activity_requests for insert
  with check (booking_id in (select id from bookings where user_id = auth.uid()));

-- wellness_requests: owner can read + create requests for their booking
drop policy if exists "wellness_requests: owner read" on wellness_requests;
create policy "wellness_requests: owner read" on wellness_requests for select
  using (booking_id in (select id from bookings where user_id = auth.uid()) or is_admin());

drop policy if exists "wellness_requests: owner insert" on wellness_requests;
create policy "wellness_requests: owner insert" on wellness_requests for insert
  with check (booking_id in (select id from bookings where user_id = auth.uid()));

-- timeline_events: read-only for the owner of the booking
drop policy if exists "timeline_events: owner read" on timeline_events;
create policy "timeline_events: owner read" on timeline_events for select
  using (booking_id in (select id from bookings where user_id = auth.uid()) or is_admin());

-- ── done ─────────────────────────────────────────────────────────
