-- ============================================================================
-- GEMarket — real featured listings (admin/destacados de-fake)
-- Run manually in Supabase Studio → SQL Editor, after 0011.
--
-- Additive only: is_featured/featured_until on listings default to
-- false/null, so every existing row is simply "not featured" — safe on a
-- live table. featured_requests is brand new (no prior mock table existed
-- in the DB; /admin/destacados was pure client-side fixture data before).
-- ============================================================================

alter table public.listings add column is_featured boolean not null default false;
alter table public.listings add column featured_until timestamptz;

create table public.featured_requests (
  id             uuid primary key default gen_random_uuid(),
  listing_id     uuid not null references public.listings (id) on delete cascade,
  user_id        uuid not null references public.profiles (id) on delete cascade,
  plan_days      smallint not null check (plan_days in (7, 15, 30)),
  amount         numeric(12, 0),
  currency       text not null default 'XAF' check (currency in ('XAF', 'USD', 'EUR')),
  payment_method text not null default 'admin_manual'
                 check (payment_method in ('bank_transfer', 'mobile_money', 'admin_manual')),
  status         text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'rejected', 'expired')),
  confirmed_by   uuid references public.profiles (id),
  confirmed_at   timestamptz,
  starts_at      timestamptz,
  ends_at        timestamptz,
  created_at     timestamptz not null default now()
);

create index featured_requests_status_idx on public.featured_requests (status, created_at desc);

alter table public.featured_requests enable row level security;

-- A requester can see/create their own requests — lays the groundwork for a
-- future self-serve "promote my listing" flow even though this pass only
-- builds the admin side (manual-feature + payment-confirmation queue).
create policy "featured_requests_own_select" on public.featured_requests
  for select using (auth.uid() = user_id);

create policy "featured_requests_own_insert" on public.featured_requests
  for insert with check (auth.uid() = user_id);

-- No update/delete policy: confirm/reject/expire/manually-feature all stay
-- service-role-only, same idiom as reports and seller_requests.
