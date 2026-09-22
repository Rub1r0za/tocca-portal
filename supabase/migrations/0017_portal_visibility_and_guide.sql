begin;
alter table public.bookings add column if not exists wellness_enabled boolean not null default true;
alter table public.bookings add column if not exists activities_enabled boolean not null default true;

-- Update linked copies while preserving fields customized for a booking.
create or replace function public.sync_day_template_guide() returns trigger
language plpgsql set search_path = public as $$
begin
  update public.journey_days set
    title = case when title is not distinct from old.title then new.title else title end,
    description = case when description is not distinct from old.description then new.description else description end,
    location = case when location is not distinct from old.location then new.location else location end,
    image_url = case when image_url is not distinct from old.image_url then new.image_url else image_url end,
    day_vibe = case when day_vibe is not distinct from old.day_vibe then new.day_vibe else day_vibe end,
    tocca_tips = case when tocca_tips is not distinct from old.tocca_tips then new.tocca_tips else tocca_tips end,
    good_to_know = case when good_to_know is not distinct from old.good_to_know then new.good_to_know else good_to_know end,
    schedule = case when schedule is not distinct from old.schedule then new.schedule else schedule end,
    is_free_day = case when is_free_day is not distinct from old.is_free_day then new.is_free_day else is_free_day end
  where template_id = new.id;
  return new;
end;
$$;
drop trigger if exists sync_day_template_guide on public.day_templates;
create trigger sync_day_template_guide after update of title, description, location, image_url, day_vibe, tocca_tips, good_to_know, schedule, is_free_day on public.day_templates
for each row execute function public.sync_day_template_guide();
commit;
