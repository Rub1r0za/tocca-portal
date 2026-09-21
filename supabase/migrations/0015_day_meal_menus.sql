-- Separate meal periods from courses and synchronize linked booking days atomically.
begin;
alter table public.day_templates add column if not exists menu_images jsonb not null default '{}';
alter table public.journey_days add column if not exists menu_images jsonb not null default '{}';
alter table public.journey_days add column if not exists template_id uuid references public.day_templates(id) on delete set null;
alter table public.meals add column if not exists meal_period text check (meal_period in ('breakfast', 'lunch', 'dinner'));
alter table public.meals add column if not exists template_meal_key text;
create unique index if not exists meals_template_key on public.meals(journey_day_id, template_meal_key);
create index if not exists journey_days_template_id on public.journey_days(template_id);

-- Legacy copies have no template id. Only link an unambiguous title and trip match.
update public.journey_days d set template_id = t.id
from public.day_templates t
where d.template_id is null and d.title = t.title and d.trip_number = t.trip_number
  and (select count(*) from public.day_templates x where x.title = d.title and x.trip_number = d.trip_number) = 1;
-- Adopt only exact, unique copies; individually added dishes remain untouched.
with candidates as (
  select m.id, (item.ordinality - 1)::text as key,
    count(*) over (partition by m.id) as matches,
    count(*) over (partition by d.id, item.ordinality) as copies
  from public.journey_days d join public.day_templates t on t.id = d.template_id
  cross join lateral jsonb_array_elements(coalesce(t.meals, '[]')) with ordinality item(value, ordinality)
  join public.meals m on m.journey_day_id = d.id
    and m.course::text = item.value->>'course' and m.name = item.value->'name'
    and coalesce(m.description, '{}') = coalesce(item.value->'description', '{}')
  where m.template_meal_key is null
)
update public.meals m set template_meal_key = c.key from candidates c
where m.id = c.id and c.matches = 1 and c.copies = 1;

create or replace function public.sync_day_template_menus() returns trigger
language plpgsql security invoker set search_path = public as $$
declare
  d record;
  item record;
  existing public.meals%rowtype;
begin
  for d in select id from public.journey_days where template_id = new.id loop
    update public.journey_days set menu_images = new.menu_images, menu_image_url = new.menu_image_url where id = d.id;
    for item in select value, (ordinality - 1)::text as key from jsonb_array_elements(coalesce(new.meals, '[]')) with ordinality loop
      select * into existing from public.meals where journey_day_id = d.id and template_meal_key = item.key;
      if found then
        -- Never transfer a previous selection to a different dish or meal period.
        if existing.name is distinct from item.value->'name'
           or existing.course::text is distinct from item.value->>'course'
           or existing.meal_period is distinct from item.value->>'meal_period' then
          delete from public.meal_selections where meal_id = existing.id;
        end if;
        update public.meals set course = (item.value->>'course')::public.meal_course,
          meal_period = item.value->>'meal_period', name = item.value->'name',
          description = coalesce(item.value->'description', '{}') where id = existing.id;
      else
        insert into public.meals(journey_day_id, template_meal_key, course, meal_period, name, description)
        values (d.id, item.key, (item.value->>'course')::public.meal_course, item.value->>'meal_period', item.value->'name', coalesce(item.value->'description', '{}'));
      end if;
    end loop;
    delete from public.meals where journey_day_id = d.id and template_meal_key is not null
      and template_meal_key not in (select (ordinality - 1)::text from jsonb_array_elements(coalesce(new.meals, '[]')) with ordinality);
  end loop;
  return new;
end;
$$;
drop trigger if exists sync_day_template_menus on public.day_templates;
create trigger sync_day_template_menus after update of meals, menu_images, menu_image_url on public.day_templates
for each row execute function public.sync_day_template_menus();

-- Apply before deploying the matching meal action. SECURITY INVOKER retains RLS.
create or replace function public.select_portal_meal(
  p_meal_id uuid,
  p_traveler_id uuid,
  p_booking_id uuid,
  p_journey_day_id uuid,
  p_course public.meal_course
) returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_traveler_id::text, 0));
  if not exists (
    select 1 from public.bookings b
    join public.travelers t on t.booking_id = b.id
    join public.journey_days d on d.booking_id = b.id and d.trip_number = t.trip_number
    join public.meals m on m.journey_day_id = d.id
    where b.id = p_booking_id and b.user_id = auth.uid() and b.status = 'approved'
      and t.id = p_traveler_id and t.meals_enabled
      and d.id = p_journey_day_id and m.id = p_meal_id and m.course = p_course
  ) then
    raise exception 'Meal selection is not available' using errcode = '42501';
  end if;
  delete from public.meal_selections s using public.meals m
  where s.meal_id = m.id and s.traveler_id = p_traveler_id
    and s.booking_id = p_booking_id
    and m.journey_day_id = p_journey_day_id and m.course = p_course
    and m.meal_period is not distinct from (select selected.meal_period from public.meals selected where selected.id = p_meal_id);
  insert into public.meal_selections (meal_id, traveler_id, booking_id)
  values (p_meal_id, p_traveler_id, p_booking_id);
end;
$$;
revoke all on function public.select_portal_meal(uuid, uuid, uuid, uuid, public.meal_course) from public, anon;
grant execute on function public.select_portal_meal(uuid, uuid, uuid, uuid, public.meal_course) to authenticated;

commit;
