-- ══════════════════════════════════════════════════
-- Tocca — trigger de profile + RLS del portal
-- Correr DESPUÉS de schema.sql
-- ══════════════════════════════════════════════════

-- ── Trigger: crear profile al registrarse ─────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, role, full_name)
  values (
    new.id,
    'client',
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── RLS ────────────────────────────────────────────
alter table profiles           enable row level security;
alter table bookings           enable row level security;
alter table travelers          enable row level security;
alter table journey_days       enable row level security;
alter table meals              enable row level security;
alter table meal_selections    enable row level security;
alter table activities         enable row level security;
alter table activity_selections enable row level security;

-- Helper: ¿es admin el usuario actual?
create or replace function is_admin()
returns boolean
language sql security definer
as $$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- profiles: el usuario ve su propio perfil
create policy "profiles: owner read"  on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles: owner update" on profiles for update using (id = auth.uid());

-- bookings: el lead ve solo sus bookings
create policy "bookings: owner read"  on bookings for select using (user_id = auth.uid() or is_admin());

-- travelers: solo los del booking del usuario
create policy "travelers: owner read" on travelers for select
  using (booking_id in (select id from bookings where user_id = auth.uid()) or is_admin());

-- journey_days: ídem
create policy "journey_days: owner read" on journey_days for select
  using (booking_id in (select id from bookings where user_id = auth.uid()) or is_admin());

-- meals: solo para los days de su booking
create policy "meals: owner read" on meals for select
  using (
    journey_day_id in (
      select id from journey_days
      where booking_id in (select id from bookings where user_id = auth.uid())
    ) or is_admin()
  );

-- meal_selections: el lead puede leer/insertar/borrar/actualizar las de su booking
create policy "meal_selections: owner read" on meal_selections for select
  using (booking_id in (select id from bookings where user_id = auth.uid()) or is_admin());

create policy "meal_selections: owner insert" on meal_selections for insert
  with check (booking_id in (select id from bookings where user_id = auth.uid()));

create policy "meal_selections: owner delete" on meal_selections for delete
  using (booking_id in (select id from bookings where user_id = auth.uid()));

-- activities: todos los activos son visibles para clientes autenticados
create policy "activities: read active" on activities for select
  using (active = true or is_admin());

-- activity_selections: el lead puede leer/insertar/borrar las de su booking
create policy "activity_selections: owner read" on activity_selections for select
  using (booking_id in (select id from bookings where user_id = auth.uid()) or is_admin());

create policy "activity_selections: owner insert" on activity_selections for insert
  with check (booking_id in (select id from bookings where user_id = auth.uid()));

create policy "activity_selections: owner delete" on activity_selections for delete
  using (booking_id in (select id from bookings where user_id = auth.uid()));
