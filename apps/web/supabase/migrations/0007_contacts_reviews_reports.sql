-- ============================================================================
-- GEMarket — contact tracking (anti-review-bombing), direct store reviews,
--             and listing reports
-- Run manually in Supabase Studio → SQL Editor, after 0006_profile_v2.sql.
-- ============================================================================

-- ── Contact records ─────────────────────────────────────────────────────────
-- Written when a LOGGED-IN user clicks "Contactar por WhatsApp" on a listing.
-- This is functional data (it unlocks the review form — the marketplace
-- equivalent of a "verified purchase" badge), NOT consent-gated analytics;
-- the consent-gated whatsapp_click event in `events` is separate and can be
-- anonymous.

create table public.listing_contacts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  -- Contact came from a listing page (tienda_slug derived by trigger) OR
  -- straight from a store page (listing_slug null, tienda_slug set).
  listing_slug text references public.listings (slug) on delete cascade,
  tienda_slug  text,
  created_at   timestamptz not null default now(),
  check (listing_slug is not null or tienda_slug is not null),
  unique (user_id, listing_slug)
);

-- Store-page contacts (no listing) are also once per user per store.
create unique index listing_contacts_one_per_store
  on public.listing_contacts (user_id, tienda_slug)
  where listing_slug is null;

alter table public.listing_contacts enable row level security;

create policy "listing_contacts_own_rw" on public.listing_contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.fill_contact_tienda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.listing_slug is not null then
    select t.slug into new.tienda_slug
    from public.listings l
    join public.tiendas t on t.owner_id = l.seller_id
    where l.slug = new.listing_slug;
  end if;
  return new;
end;
$$;

create trigger listing_contacts_fill_tienda
  before insert on public.listing_contacts
  for each row execute function public.fill_contact_tienda();

-- ── Direct store reviews ────────────────────────────────────────────────────
-- reviews now target EITHER a listing OR a tienda (exactly one). Writing any
-- review requires having contacted that seller first (anti-bombing gate).

alter table public.reviews alter column listing_id drop not null;
alter table public.reviews add column tienda_slug text references public.tiendas (slug) on delete cascade;

alter table public.reviews add constraint reviews_exactly_one_target check (
  (listing_id is not null and tienda_slug is null)
  or (listing_id is null and tienda_slug is not null)
);

-- One review per user per tienda (the listing_id unique pair from 0004 stays).
create unique index reviews_one_per_user_per_tienda
  on public.reviews (reviewer_id, tienda_slug)
  where tienda_slug is not null;

-- Replace the insert policy: contact-gated, and never on your own content.
drop policy "reviews_own_insert" on public.reviews;
create policy "reviews_own_insert" on public.reviews
  for insert with check (
    auth.uid() = reviewer_id
    and (
      -- Listing review: must have contacted this listing; can't review your own.
      (
        listing_id is not null
        and auth.uid() <> (select seller_id from public.listings where id = listing_id)
        and exists (
          select 1 from public.listing_contacts lc
          join public.listings l on l.slug = lc.listing_slug
          where lc.user_id = auth.uid() and l.id = listing_id
        )
      )
      or
      -- Store review: must have contacted this store; can't review your own.
      (
        tienda_slug is not null
        and auth.uid() <> (select owner_id from public.tiendas where slug = tienda_slug)
        and exists (
          select 1 from public.listing_contacts lc
          where lc.user_id = auth.uid() and lc.tienda_slug = tienda_slug
        )
      )
    )
  );

-- Seller-reply policy for store reviews (0004's policy only covered listings).
create policy "reviews_store_owner_update" on public.reviews
  for update
  using (tienda_slug is not null
         and auth.uid() = (select owner_id from public.tiendas where slug = tienda_slug))
  with check (tienda_slug is not null
              and auth.uid() = (select owner_id from public.tiendas where slug = tienda_slug));

-- Update the column-protecting trigger to know about store reviews.
create or replace function public.protect_review_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_seller boolean;
begin
  if new.listing_id is not null then
    select (seller_id = auth.uid()) into is_seller
    from public.listings where id = new.listing_id;
  else
    select (owner_id = auth.uid()) into is_seller
    from public.tiendas where slug = new.tienda_slug;
  end if;

  if is_seller then
    if new.rating is distinct from old.rating
       or new.comment is distinct from old.comment
       or new.reviewer_id is distinct from old.reviewer_id then
      raise exception 'Solo puedes responder a la reseña, no editarla.';
    end if;
  else
    if new.seller_reply is distinct from old.seller_reply then
      raise exception 'No autorizado a modificar la respuesta del vendedor.';
    end if;
  end if;
  return new;
end;
$$;

-- ── Listing reports ─────────────────────────────────────────────────────────
-- The "Reportar" button becomes real: logged-in users file a report, admins
-- triage at /admin/reportes (service role — no client update policies).

create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles (id) on delete cascade,
  listing_slug text not null references public.listings (slug) on delete cascade,
  reason       text not null check (reason in (
    'fraud', 'prohibited', 'wrong_category', 'duplicate', 'offensive', 'other'
  )),
  details      text not null default '' check (char_length(details) <= 500),
  status       text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  reviewed_by  uuid references public.profiles (id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  -- One open report per user per listing.
  unique (reporter_id, listing_slug)
);

create index reports_status_idx on public.reports (status, created_at desc);

alter table public.reports enable row level security;

create policy "reports_own_select" on public.reports
  for select using (auth.uid() = reporter_id);

create policy "reports_own_insert" on public.reports
  for insert with check (auth.uid() = reporter_id);
