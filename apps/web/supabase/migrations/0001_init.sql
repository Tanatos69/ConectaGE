-- ============================================================================
-- ConectaGE — initial schema: real accounts + real listings
-- Run manually in Supabase Studio → SQL Editor (no CLI wiring this pass).
--
-- Bootstrapping the first admin: sign up normally through /registro, then in
-- Studio → Table Editor → profiles, hand-set that row's role to 'admin'.
-- There is intentionally NO in-app path to create admins.
-- ============================================================================

-- ── Enums ───────────────────────────────────────────────────────────────────

create type public.user_role as enum ('buyer', 'seller', 'admin');
create type public.request_status as enum ('pending', 'approved', 'rejected');
create type public.listing_status as enum ('published', 'pending', 'rejected', 'expired');
create type public.listing_type as enum ('offer', 'wanted');
create type public.price_type as enum ('fixed', 'negotiable', 'free', 'on_request');

-- ── profiles ────────────────────────────────────────────────────────────────

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  -- Required for posting (WhatsApp contact button); nullable because OAuth
  -- signups arrive without one and complete it later.
  phone       text check (phone is null or phone ~ '^\+[0-9]{6,15}$'),
  city        text,
  avatar_url  text,
  role        public.user_role not null default 'buyer',
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_public_select" on public.profiles
  for select using (true);

create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Users may update their own row, but never their role/verified flags.
-- PostgREST runs as the db role named after the JWT role: 'authenticated',
-- 'anon' or 'service_role'. Studio's table editor runs as 'postgres'.
create or replace function public.protect_privileged_profile_cols()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.verified is distinct from old.verified)
     and current_user not in ('service_role', 'postgres', 'supabase_admin', 'supabase_auth_admin') then
    raise exception 'No autorizado a modificar role/verified';
  end if;
  return new;
end;
$$;

create trigger prevent_privileged_self_update
  before update on public.profiles
  for each row execute function public.protect_privileged_profile_cols();

-- Auto-create a profile row on signup (email/password metadata or OAuth).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, city)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '[^+0-9]', '', 'g'), ''),
    nullif(new.raw_user_meta_data ->> 'city', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── seller_requests ─────────────────────────────────────────────────────────

create table public.seller_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  store_name  text not null,
  message     text not null default '',
  status      public.request_status not null default 'pending',
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);

-- One pending request per user.
create unique index seller_requests_one_pending_per_user
  on public.seller_requests (user_id)
  where status = 'pending';

alter table public.seller_requests enable row level security;

create policy "seller_requests_own_select" on public.seller_requests
  for select using (auth.uid() = user_id);

create policy "seller_requests_own_insert" on public.seller_requests
  for insert with check (auth.uid() = user_id);

-- No UPDATE/DELETE policies on purpose: approve/reject happens exclusively
-- through the service-role server action.

-- ── tiendas ─────────────────────────────────────────────────────────────────

create table public.tiendas (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null unique references public.profiles (id) on delete cascade,
  slug           text not null unique,
  name           text not null,
  tagline        text not null default '',
  banner         text,
  logo           text,
  city           text not null default '',
  address        text not null default '',
  neighborhood   text not null default '',
  business_hours text not null default '',
  instagram      text not null default '',
  facebook       text not null default '',
  category_slug  text not null default 'varios',
  whatsapp       text not null default '',
  description    text not null default '',
  verified       boolean not null default false,
  created_at     timestamptz not null default now()
);

alter table public.tiendas enable row level security;

create policy "tiendas_public_select" on public.tiendas
  for select using (true);

-- No INSERT policy for regular users: only the service-role approval action
-- creates a tienda row.
create policy "tiendas_owner_update" on public.tiendas
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create or replace function public.protect_privileged_tienda_cols()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.owner_id is distinct from old.owner_id or new.verified is distinct from old.verified)
     and current_user not in ('service_role', 'postgres', 'supabase_admin') then
    raise exception 'No autorizado a modificar owner_id/verified';
  end if;
  return new;
end;
$$;

create trigger prevent_privileged_tienda_update
  before update on public.tiendas
  for each row execute function public.protect_privileged_tienda_cols();

-- ── listings ────────────────────────────────────────────────────────────────

create table public.listings (
  id               uuid primary key default gen_random_uuid(),
  seller_id        uuid not null references public.profiles (id) on delete cascade,
  title            text not null check (char_length(title) between 5 and 100),
  slug             text not null unique,
  description      text not null check (char_length(description) between 10 and 2000),
  price            numeric(14, 0) check (price is null or price >= 0),
  price_type       public.price_type not null default 'fixed',
  currency         text not null default 'XAF' check (currency in ('XAF', 'USD', 'EUR')),
  category_slug    text not null,
  subcategory_slug text not null default '',
  city             text not null,
  region           text not null default '',
  condition        text check (condition is null or condition in ('new', 'used', 'refurbished')),
  images           text[] not null default '{}',
  whatsapp         text not null,
  show_phone       boolean not null default false,
  phone            text not null default '',
  listing_type     public.listing_type not null default 'offer',
  -- Listings auto-publish on insert (no moderation queue this pass).
  status           public.listing_status not null default 'published',
  extra_fields     jsonb not null default '{}',
  views_count      integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index listings_status_created_idx on public.listings (status, created_at desc);
create index listings_seller_idx on public.listings (seller_id);
create index listings_category_idx on public.listings (category_slug);

alter table public.listings enable row level security;

create policy "listings_public_or_own_select" on public.listings
  for select using (status = 'published' or seller_id = auth.uid());

create policy "listings_own_insert" on public.listings
  for insert with check (seller_id = auth.uid());

create policy "listings_own_update" on public.listings
  for update using (seller_id = auth.uid()) with check (seller_id = auth.uid());

create policy "listings_own_delete" on public.listings
  for delete using (seller_id = auth.uid());

create or replace function public.set_listing_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_listing_updated_at();

-- Anonymous visitors can't UPDATE listings, so view counting goes through a
-- narrow security-definer RPC instead of a broad UPDATE policy.
create or replace function public.increment_listing_views(listing_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.listings
  set views_count = views_count + 1
  where slug = listing_slug and status = 'published';
$$;

-- ── Storage: buckets + folder-per-user write policies ───────────────────────

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true), ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "storage_public_read" on storage.objects
  for select using (bucket_id in ('listing-images', 'avatars'));

-- Users may only write inside their own {user_id}/... folder.
create policy "storage_own_folder_insert" on storage.objects
  for insert with check (
    bucket_id in ('listing-images', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_own_folder_update" on storage.objects
  for update using (
    bucket_id in ('listing-images', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_own_folder_delete" on storage.objects
  for delete using (
    bucket_id in ('listing-images', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
