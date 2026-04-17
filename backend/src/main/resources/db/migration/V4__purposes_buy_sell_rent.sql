-- Re-enable marketplace purposes (buy/sell/rent).
-- Note: V3 made it buy-only. This migration widens it again.

alter table properties
  drop constraint if exists properties_purpose_check;

alter table properties
  add constraint properties_purpose_check check (purpose in ('buy','sell','rent'));

