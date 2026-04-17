-- Add missing fields needed for admin CRUD screens.

-- localities: add is_active for enable/disable
alter table localities
  add column if not exists is_active boolean not null default true;

create index if not exists idx_localities_is_active on localities(is_active);

-- property_types: add updated_at timestamp
alter table property_types
  add column if not exists updated_at timestamptz not null default now();

-- amenities: add updated_at timestamp
alter table amenities
  add column if not exists updated_at timestamptz not null default now();

