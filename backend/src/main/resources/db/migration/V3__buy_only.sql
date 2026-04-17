-- Make marketplace buy-only (remove rent support).
-- - Deletes any existing rent listings
-- - Tightens DB check constraint to allow only 'buy'

delete from properties where purpose = 'rent';

alter table properties
  drop constraint if exists properties_purpose_check;

alter table properties
  add constraint properties_purpose_check check (purpose in ('buy'));

