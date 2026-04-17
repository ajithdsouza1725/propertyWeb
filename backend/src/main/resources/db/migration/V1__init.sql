-- Core schema for MangaloreHomes (PostgreSQL)

create table if not exists users (
  id bigserial primary key,
  full_name text not null,
  email text unique,
  phone text unique,
  password_hash text not null,
  role text not null,
  profile_image text,
  business_name text,
  is_verified boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_role_check check (role in ('buyer','owner','agent','admin')),
  constraint users_status_check check (status in ('active','blocked','pending'))
);

create table if not exists property_types (
  id bigserial primary key,
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists localities (
  id bigserial primary key,
  city text not null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists amenities (
  id bigserial primary key,
  name text not null unique,
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists properties (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  purpose text not null,
  property_type_id bigint not null references property_types(id),
  description text,
  price bigint not null,
  security_deposit bigint,
  address_line text,
  city text,
  locality_id bigint references localities(id),
  pincode text,
  latitude double precision,
  longitude double precision,
  bedrooms int,
  bathrooms int,
  balconies int,
  area_sqft int,
  carpet_area_sqft int,
  furnishing_status text,
  parking_count int,
  property_age int,
  floor_number int,
  total_floors int,
  facing text,
  possession_status text,
  ownership_type text,
  is_featured boolean not null default false,
  is_verified boolean not null default false,
  approval_status text not null default 'pending',
  rejection_reason text,
  listing_status text not null default 'active',
  views_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint properties_purpose_check check (purpose in ('buy','rent')),
  constraint properties_furnishing_check check (furnishing_status is null or furnishing_status in ('furnished','semi-furnished','unfurnished')),
  constraint properties_possession_check check (possession_status is null or possession_status in ('ready','under-construction')),
  constraint properties_approval_check check (approval_status in ('pending','approved','rejected')),
  constraint properties_listing_check check (listing_status in ('active','sold','rented','inactive'))
);

create index if not exists idx_properties_purpose on properties(purpose);
create index if not exists idx_properties_locality on properties(locality_id);
create index if not exists idx_properties_type on properties(property_type_id);
create index if not exists idx_properties_price on properties(price);
create index if not exists idx_properties_approval on properties(approval_status);
create index if not exists idx_properties_listing on properties(listing_status);
create index if not exists idx_properties_user on properties(user_id);

create table if not exists property_images (
  id bigserial primary key,
  property_id bigint not null references properties(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_property_images_property on property_images(property_id, sort_order);

create table if not exists property_amenities (
  id bigserial primary key,
  property_id bigint not null references properties(id) on delete cascade,
  amenity_id bigint not null references amenities(id) on delete cascade,
  constraint uq_property_amenities unique(property_id, amenity_id)
);

create table if not exists enquiries (
  id bigserial primary key,
  property_id bigint not null references properties(id) on delete cascade,
  user_id bigint references users(id) on delete set null,
  name text not null,
  email text,
  phone text not null,
  message text,
  status text not null default 'new',
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enquiries_status_check check (status in ('new','contacted','closed','spam')),
  constraint enquiries_source_check check (source in ('website','whatsapp','call'))
);

create index if not exists idx_enquiries_property on enquiries(property_id);
create index if not exists idx_enquiries_status on enquiries(status);

create table if not exists saved_properties (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  property_id bigint not null references properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint uq_saved_properties unique(user_id, property_id)
);

create table if not exists testimonials (
  id bigserial primary key,
  name text not null,
  designation text,
  comment text not null,
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists banners (
  id bigserial primary key,
  title text,
  subtitle text,
  image_url text,
  button_text text,
  button_link text,
  page_type text not null default 'homepage',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists seo_pages (
  id bigserial primary key,
  page_key text not null unique,
  page_title text,
  meta_title text,
  meta_description text,
  og_image text,
  schema_json jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists property_views (
  id bigserial primary key,
  property_id bigint not null references properties(id) on delete cascade,
  user_id bigint references users(id) on delete set null,
  ip_address inet,
  viewed_at timestamptz not null default now()
);

create table if not exists notifications (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Seed essentials (safe to re-run due to unique constraints on slug/name).
insert into property_types (name, slug) values
  ('Apartment', 'apartment'),
  ('Villa', 'villa'),
  ('Independent House', 'independent-house'),
  ('Plot', 'plot'),
  ('Office', 'office'),
  ('Shop', 'shop'),
  ('Warehouse', 'warehouse'),
  ('Showroom', 'showroom')
on conflict (slug) do nothing;

insert into localities (city, name, slug, is_featured) values
  ('Mangalore', 'Kadri', 'kadri', true),
  ('Mangalore', 'Bejai', 'bejai', true),
  ('Mangalore', 'Kottara', 'kottara', true),
  ('Mangalore', 'Attavar', 'attavar', true),
  ('Mangalore', 'Surathkal', 'surathkal', false),
  ('Mangalore', 'Lalbagh', 'lalbagh', false),
  ('Mangalore', 'Derebail', 'derebail', false),
  ('Mangalore', 'Bondel', 'bondel', false),
  ('Mangalore', 'Valencia', 'valencia', false),
  ('Mangalore', 'Kulur', 'kulur', false)
on conflict (slug) do nothing;

insert into amenities (name, icon) values
  ('Lift', 'lift'),
  ('Parking', 'parking'),
  ('Security', 'security'),
  ('Power backup', 'power'),
  ('Swimming pool', 'pool'),
  ('Gym', 'gym'),
  ('Balcony', 'balcony'),
  ('Water supply', 'water')
on conflict (name) do nothing;

