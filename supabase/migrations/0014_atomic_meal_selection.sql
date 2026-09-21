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
    and m.journey_day_id = p_journey_day_id and m.course = p_course;
  insert into public.meal_selections (meal_id, traveler_id, booking_id)
  values (p_meal_id, p_traveler_id, p_booking_id);
end;
$$;
revoke all on function public.select_portal_meal(uuid, uuid, uuid, uuid, public.meal_course) from public, anon;
grant execute on function public.select_portal_meal(uuid, uuid, uuid, uuid, public.meal_course) to authenticated;
