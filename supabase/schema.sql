-- ============================================================
-- Barcode.gen.scan.web — Supabase schema
-- Run this in the Supabase SQL Editor once.
-- Replaces Firebase Realtime Database (auth stays on Firebase).
-- ============================================================

-- ---------- TABLES ----------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  image       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.suppliers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  shop_name   text,
  category    text,
  description text,
  phone       text,
  email       text,
  address     text,
  image       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.items (
  id             uuid primary key default gen_random_uuid(),
  product_name   text not null,
  description    text,
  category       text,
  unit_measure   text,
  purchase_price numeric,
  selling_price  numeric,
  quantity       integer not null default 0,
  supplier_info  text,
  item_img       text,
  sku            text,
  barcode_id     text,
  barcode_img    text,
  status         text,
  "user"         text,
  lat            double precision,
  lng            double precision,
  address        text,
  created_at     timestamptz not null default now()
);

create table if not exists public.audit_trails (
  id               uuid primary key default gen_random_uuid(),
  unique_id        text,
  product_name     text,
  "user"           text,
  latitude         double precision,
  longitude        double precision,
  time_stamp       text,
  new_quantity     integer,
  previous_quantity integer,
  status           text,
  location_name    text,
  default_address  text,
  location_status  text,
  address          text,
  created_at       timestamptz not null default now()
);

-- ---------- SECURITY (dev: public access via anon key) ----------
-- The app runs fully on the anonymous/anon key with no user session.
-- Enable RLS but grant public access so CRUD works client-side.
-- Replace these policies with authenticated-only policies for production.

alter table public.categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.items enable row level security;
alter table public.audit_trails enable row level security;

create policy "public all categories" on public.categories
  for all using (true) with check (true);
create policy "public all suppliers" on public.suppliers
  for all using (true) with check (true);
create policy "public all items" on public.items
  for all using (true) with check (true);
create policy "public all audit_trails" on public.audit_trails
  for all using (true) with check (true);