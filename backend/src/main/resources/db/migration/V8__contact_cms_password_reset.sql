create table if not exists contact_messages (
  id bigserial primary key,
  name text not null,
  email text,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists password_reset_tokens (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_reset_token_hash_active
  on password_reset_tokens (token_hash)
  where used = false;

create table if not exists cms_sections (
  section text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into cms_sections (section, payload, updated_at) values
(
  'homepage',
  '{"heroTitle":"Find a home in Mangalore that feels right.","heroSubtitle":"Browse verified listings across Kadri, Bejai, Kottara, Attavar and more.","bannerUrl":"","featuredPropertyIds":"p_1001, p_1003, p_1006","featuredLocalities":"kadri, bejai, kottara","testimonialIds":"1,2,3"}'::jsonb,
  now()
),
(
  'seo',
  '{"pageKey":"homepage","title":"","description":"","ogImageUrl":"","schemaJson":""}'::jsonb,
  now()
),
(
  'settings',
  '{"siteName":"MangaloreHomes","logoUrl":"","faviconUrl":"","supportPhone":"+91 98XX-XXX-XXX","supportEmail":"support@mangalorehomes.in","whatsapp":""}'::jsonb,
  now()
)
on conflict (section) do nothing;
