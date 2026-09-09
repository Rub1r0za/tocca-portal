-- Wellness options are edited from the admin catalog, which records their update time.
alter table wellness_options
  add column if not exists updated_at timestamptz not null default now();

-- Pilates is offered in groups. Update existing Pilates copy without affecting
-- other private wellness experiences.
update wellness_options
set
  name = jsonb_set(
    jsonb_set(
      name,
      '{en}',
      to_jsonb(regexp_replace(coalesce(name->>'en', ''), 'private', 'group', 'gi')),
      false
    ),
    '{es}',
    to_jsonb(regexp_replace(coalesce(name->>'es', ''), 'privad[oa]', 'grupal', 'gi')),
    false
  ),
  description = jsonb_set(
    jsonb_set(
      description,
      '{en}',
      to_jsonb(regexp_replace(coalesce(description->>'en', ''), 'private', 'group', 'gi')),
      false
    ),
    '{es}',
    to_jsonb(regexp_replace(coalesce(description->>'es', ''), 'privad[oa]', 'grupal', 'gi')),
    false
  ),
  updated_at = now()
where coalesce(name->>'en', '') ilike '%pilates%'
   or coalesce(name->>'es', '') ilike '%pilates%'
   or coalesce(description->>'en', '') ilike '%pilates%'
   or coalesce(description->>'es', '') ilike '%pilates%';
