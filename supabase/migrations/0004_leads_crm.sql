-- ══════════════════════════════════════════════════════════════
-- Tocca Amalfi Coast — Leads / CRM migration (additive, idempotent)
-- Run in the Supabase SQL Editor. Safe to run more than once.
--
-- Contacts book for the admin: past travelers + potential leads that
-- arrive from social media, phone, referrals, etc. Holds phone number
-- and birthday so Jess can reach out and send birthday greetings.
-- Admin-only table — clients never read or write it.
-- ══════════════════════════════════════════════════════════════

-- ── Enum for where the contact came from / their stage ───────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum ('potential', 'client', 'past');
  end if;
end $$;

-- ── leads — the contacts table ───────────────────────────────────
create table if not exists leads (
  id                uuid primary key default uuid_generate_v4(),
  full_name         text not null,
  email             text,
  phone             text,                 -- WhatsApp / phone, key for outreach
  source            text,                 -- "instagram", "referral", "web", …
  instagram_handle  text,
  birthday          date,                 -- for birthday greetings
  status            lead_status not null default 'potential',
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists leads_status_idx   on leads (status);
create index if not exists leads_birthday_idx on leads (birthday);

-- keep updated_at fresh
create or replace function set_leads_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists leads_set_updated_at on leads;
create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_leads_updated_at();

-- ── Row Level Security — admin only ──────────────────────────────
-- The admin UI uses the service role (bypasses RLS); these policies
-- are defence-in-depth so no client token can ever touch this table.
alter table leads enable row level security;

drop policy if exists "leads: admin all" on leads;
create policy "leads: admin all" on leads for all
  using (is_admin())
  with check (is_admin());

-- ── done ─────────────────────────────────────────────────────────
