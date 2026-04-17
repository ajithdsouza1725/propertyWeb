-- Optional SEO row seeds (per-page metadata). Admin can edit via API.
insert into seo_pages (page_key, page_title, meta_title, meta_description, og_image, schema_json, updated_at)
values
  ('homepage', null, null, null, null, null, now()),
  ('listings', null, null, null, null, null, now()),
  ('about', null, null, null, null, null, now()),
  ('contact', null, null, null, null, null, now())
on conflict (page_key) do nothing;

create index if not exists idx_enquiries_user_id on enquiries(user_id);
create index if not exists idx_saved_properties_user on saved_properties(user_id);
create index if not exists idx_notifications_user on notifications(user_id);
