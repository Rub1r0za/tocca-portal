-- ══════════════════════════════════════════════════
-- Tocca Amalfi Coast — schema completo
-- Correr en Supabase SQL Editor (en orden)
-- ══════════════════════════════════════════════════

-- Extensions
create extension if not exists "uuid-ossp";

-- ── Enums ──────────────────────────────────────────
create type user_role as enum ('client', 'admin');
create type booking_status as enum ('pending', 'approved', 'cancelled');
create type booking_type as enum ('individual', 'group');
create type traveler_type as enum ('adult', 'child');
create type meal_course as enum ('starter', 'main', 'dessert');
create type payment_status as enum ('pending', 'partial', 'paid');
create type document_type as enum ('passport', 'visa', 'insurance', 'other');
create type notification_type as enum ('email', 'in_app');

-- ── profiles ───────────────────────────────────────
create table profiles (
  id           uuid primary key references auth.users on delete cascade,
  role         user_role not null default 'client',
  full_name    text,
  phone        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── bookings ───────────────────────────────────────
create table bookings (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles(id) on delete cascade,
  status           booking_status not null default 'pending',
  type             booking_type not null default 'individual',
  title            jsonb not null default '{}',      -- {"en":"...","es":"..."}
  description      jsonb not null default '{}',
  start_date       date,
  end_date         date,
  applicant_name   text,
  applicant_email  text,
  applicant_phone  text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── travelers ──────────────────────────────────────
create table travelers (
  id                    uuid primary key default uuid_generate_v4(),
  booking_id            uuid not null references bookings(id) on delete cascade,
  type                  traveler_type not null default 'adult',
  first_name            text not null,
  last_name             text not null,
  dietary_restrictions  text,
  notes                 text,
  created_at            timestamptz not null default now()
);

-- ── journey_days ───────────────────────────────────
create table journey_days (
  id           uuid primary key default uuid_generate_v4(),
  booking_id   uuid not null references bookings(id) on delete cascade,
  day_number   integer not null,
  title        jsonb not null default '{}',
  description  jsonb not null default '{}',
  location     text,
  created_at   timestamptz not null default now(),
  unique (booking_id, day_number)
);

-- ── meals ──────────────────────────────────────────
create table meals (
  id              uuid primary key default uuid_generate_v4(),
  journey_day_id  uuid not null references journey_days(id) on delete cascade,
  course          meal_course not null,
  name            jsonb not null default '{}',
  description     jsonb not null default '{}',
  allergens       text,
  created_at      timestamptz not null default now()
);

-- ── meal_selections ────────────────────────────────
create table meal_selections (
  id          uuid primary key default uuid_generate_v4(),
  meal_id     uuid not null references meals(id) on delete cascade,
  traveler_id uuid not null references travelers(id) on delete cascade,
  booking_id  uuid not null references bookings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (meal_id, traveler_id)
);

-- ── activities ─────────────────────────────────────
create table activities (
  id           uuid primary key default uuid_generate_v4(),
  name         jsonb not null default '{}',
  description  jsonb not null default '{}',
  price        numeric(10,2) not null default 0,
  capacity     integer,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── activity_selections ────────────────────────────
create table activity_selections (
  id          uuid primary key default uuid_generate_v4(),
  activity_id uuid not null references activities(id) on delete cascade,
  traveler_id uuid not null references travelers(id) on delete cascade,
  booking_id  uuid not null references bookings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (activity_id, traveler_id)
);

-- ── payments (fuera de alcance de UI) ─────────────
create table payments (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  amount      numeric(10,2) not null,
  status      payment_status not null default 'pending',
  created_at  timestamptz not null default now()
);

create table payment_milestones (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  due_date    date,
  amount      numeric(10,2) not null,
  paid        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── wellness (fuera de alcance de UI por ahora) ───
create table wellness_options (
  id           uuid primary key default uuid_generate_v4(),
  name         jsonb not null default '{}',
  description  jsonb not null default '{}',
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table wellness_selections (
  id                 uuid primary key default uuid_generate_v4(),
  wellness_option_id uuid not null references wellness_options(id) on delete cascade,
  traveler_id        uuid not null references travelers(id) on delete cascade,
  booking_id         uuid not null references bookings(id) on delete cascade,
  created_at         timestamptz not null default now(),
  unique (wellness_option_id, traveler_id)
);

-- ── documents (fuera de alcance) ──────────────────
create table documents (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  traveler_id uuid references travelers(id) on delete set null,
  type        document_type not null default 'other',
  file_url    text,
  created_at  timestamptz not null default now()
);

-- ── notifications (fuera de alcance) ──────────────
create table notifications (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid references bookings(id) on delete cascade,
  user_id     uuid references profiles(id) on delete cascade,
  type        notification_type not null default 'in_app',
  message     text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── audit_logs (fuera de alcance) ─────────────────
create table audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete set null,
  action      text not null,
  table_name  text,
  record_id   uuid,
  details     jsonb,
  created_at  timestamptz not null default now()
);
