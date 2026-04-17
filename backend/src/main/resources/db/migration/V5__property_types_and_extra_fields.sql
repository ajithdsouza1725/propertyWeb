-- Property types: switch to 4-category system
-- - Residential
-- - Commercial
-- - Land
-- - Agricultural Land
--
-- Also add a JSONB column for type-specific extra fields.

alter table properties
  add column if not exists extra_fields jsonb not null default '{}'::jsonb;

-- Deactivate old/legacy types (seeded in V1)
update property_types
set is_active = false
where slug not in ('residential','commercial','land','agricultural-land');

-- Insert or reactivate the new 4 types
insert into property_types (name, slug, is_active)
values
  ('Residential', 'residential', true),
  ('Commercial', 'commercial', true),
  ('Land', 'land', true),
  ('Agricultural Land', 'agricultural-land', true)
on conflict (slug) do update set
  name = excluded.name,
  is_active = true;

