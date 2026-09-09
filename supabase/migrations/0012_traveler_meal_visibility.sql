-- Meals can be enabled per traveler. Signature is paused until its menus are finalized.
alter table travelers add column if not exists meals_enabled boolean not null default true;

update travelers
set meals_enabled = false
where trip_number = 1;

alter type meal_course add value if not exists 'breakfast';
alter type meal_course add value if not exists 'lunch';
alter type meal_course add value if not exists 'dinner';
