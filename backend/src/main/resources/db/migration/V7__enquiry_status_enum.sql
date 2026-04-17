-- Normalize enquiry status to NEW / ASSIGNED / CLOSED.
-- Previous values: new/contacted/closed/spam (text) + assignment columns.

-- Drop constraint FIRST so updates can proceed
alter table enquiries
  drop constraint if exists enquiries_status_check;

-- Convert existing rows
update enquiries
set status = 'CLOSED'
where lower(status) in ('closed','spam');

update enquiries
set status = 'ASSIGNED'
where assigned_seller_id is not null and lower(status) <> 'closed';

update enquiries
set status = 'NEW'
where status is null or status = '' or lower(status) in ('new','contacted');

-- Add new constraint
alter table enquiries
  add constraint enquiries_status_check check (status in ('NEW','ASSIGNED','CLOSED'));
