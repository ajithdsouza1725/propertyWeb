alter table enquiries
  add column if not exists assigned_seller_id bigint references users(id) on delete set null;

alter table enquiries
  add column if not exists assigned_at timestamptz;

create index if not exists idx_enquiries_assigned_seller on enquiries(assigned_seller_id);

