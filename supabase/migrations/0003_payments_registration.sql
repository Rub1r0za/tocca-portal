-- ════════════════════════════════════════════════════════════════
-- 0003 — Registro con términos + módulo de pagos
--   1. bookings: total del viaje, aceptación de términos, tipo grupal
--   2. payments: pagos del cliente (Zelle/transferencia/Stripe) con comprobante
--   3. payment_schedule: fechas de seguimiento de pagos pendientes (admin)
--   4. travel_tips: contenido "Antes de viajar" (fase 2)
-- ════════════════════════════════════════════════════════════════

alter table bookings add column if not exists total_price       numeric(10,2);
alter table bookings add column if not exists terms_accepted_at timestamptz;

create table if not exists payments (
  id           uuid primary key default uuid_generate_v4(),
  booking_id   uuid not null references bookings(id) on delete cascade,
  amount       numeric(10,2) not null check (amount > 0),
  currency     text not null default 'USD',
  method       text not null check (method in ('zelle', 'transfer', 'stripe', 'other')),
  status       text not null default 'pending_review' check (status in ('pending_review', 'approved', 'rejected')),
  reference    text,           -- nº de confirmación / referencia de la transferencia
  receipt_path text,           -- ruta del comprobante en el bucket privado "receipts"
  notes        text,
  created_at   timestamptz not null default now(),
  reviewed_at  timestamptz
);
create index if not exists payments_booking_idx on payments (booking_id);

create table if not exists payment_schedule (
  id         uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id) on delete cascade,
  due_date   date not null,
  amount     numeric(10,2) not null,
  label      jsonb not null default '{}',   -- {"en":"30% confirmation","es":"30% de confirmación"}
  paid       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists payment_schedule_booking_idx on payment_schedule (booking_id);

create table if not exists travel_tips (
  id         uuid primary key default uuid_generate_v4(),
  sort_order integer not null default 0,
  title      jsonb not null default '{}',
  body       jsonb not null default '{}',
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

alter table payments         enable row level security;
alter table payment_schedule enable row level security;
alter table travel_tips      enable row level security;

-- El cliente ve sus pagos y su cronograma; escribe solo el servidor (service role).
drop policy if exists "payments: owner read" on payments;
create policy "payments: owner read" on payments for select
  using (booking_id in (select id from bookings where user_id = auth.uid()) or is_admin());

drop policy if exists "payment_schedule: owner read" on payment_schedule;
create policy "payment_schedule: owner read" on payment_schedule for select
  using (booking_id in (select id from bookings where user_id = auth.uid()) or is_admin());

drop policy if exists "travel_tips: read active" on travel_tips;
create policy "travel_tips: read active" on travel_tips for select
  using (active = true or is_admin());
