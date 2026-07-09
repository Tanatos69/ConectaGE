-- ============================================================================
-- ConectaGE — reviews, store follows, listing favorites, follow-notifications
-- Run manually in Supabase Studio → SQL Editor, after 0003_analytics.sql.
--
-- store_follows/listing_favorites key off `slug` (not the uuid id) so the
-- client buttons — which only ever know the slug shown in the URL, matching
-- every other button in this app (FavoriteButton, category links, etc.) —
-- never need to thread an extra id through list views. Reviews key off the
-- real listing id instead, since review submission only happens from the
-- listing detail page, which already fetches the full row (including id).
-- ============================================================================

-- ── Reviews ──────────────────────────────────────────────────────────────────
-- One review per (listing, reviewer). Public read. The reviewer owns
-- rating/comment; the listing's seller owns seller_reply — enforced by the
-- column-protecting trigger below (same pattern as protect_privileged_profile_cols
-- in 0001_init.sql).

create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references public.listings (id) on delete cascade,
  reviewer_id  uuid not null references public.profiles (id) on delete cascade,
  rating       smallint not null check (rating between 1 and 5),
  comment      text not null check (char_length(comment) between 1 and 1000),
  seller_reply text check (seller_reply is null or char_length(seller_reply) <= 1000),
  created_at   timestamptz not null default now(),
  unique (listing_id, reviewer_id)
);

create index reviews_listing_idx on public.reviews (listing_id);

alter table public.reviews enable row level security;

create policy "reviews_public_select" on public.reviews
  for select using (true);

-- A seller can't review their own listing.
create policy "reviews_own_insert" on public.reviews
  for insert with check (
    auth.uid() = reviewer_id
    and auth.uid() <> (select seller_id from public.listings where id = listing_id)
  );

create policy "reviews_reviewer_update" on public.reviews
  for update using (auth.uid() = reviewer_id) with check (auth.uid() = reviewer_id);

create policy "reviews_seller_update" on public.reviews
  for update
  using (auth.uid() = (select seller_id from public.listings where id = listing_id))
  with check (auth.uid() = (select seller_id from public.listings where id = listing_id));

create or replace function public.protect_review_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_seller boolean;
begin
  select (seller_id = auth.uid()) into is_seller
  from public.listings where id = new.listing_id;

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

create trigger reviews_protect_columns
  before update on public.reviews
  for each row execute function public.protect_review_columns();

-- ── Store follows ────────────────────────────────────────────────────────────

alter table public.tiendas add column followers_count integer not null default 0;

create table public.store_follows (
  id           uuid primary key default gen_random_uuid(),
  follower_id  uuid not null references public.profiles (id) on delete cascade,
  tienda_slug  text not null references public.tiendas (slug) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (follower_id, tienda_slug)
);

alter table public.store_follows enable row level security;

create policy "store_follows_own_rw" on public.store_follows
  for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

create or replace function public.adjust_tienda_followers_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.tiendas set followers_count = followers_count + 1 where slug = new.tienda_slug;
    return new;
  else
    update public.tiendas set followers_count = greatest(0, followers_count - 1) where slug = old.tienda_slug;
    return old;
  end if;
end;
$$;

create trigger store_follows_after_insert
  after insert on public.store_follows
  for each row execute function public.adjust_tienda_followers_count();

create trigger store_follows_after_delete
  after delete on public.store_follows
  for each row execute function public.adjust_tienda_followers_count();

-- ── Listing favorites ────────────────────────────────────────────────────────

alter table public.listings add column favorites_count integer not null default 0;

create table public.listing_favorites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  listing_slug  text not null references public.listings (slug) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (user_id, listing_slug)
);

alter table public.listing_favorites enable row level security;

create policy "listing_favorites_own_rw" on public.listing_favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.adjust_listing_favorites_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.listings set favorites_count = favorites_count + 1 where slug = new.listing_slug;
    return new;
  else
    update public.listings set favorites_count = greatest(0, favorites_count - 1) where slug = old.listing_slug;
    return old;
  end if;
end;
$$;

create trigger listing_favorites_after_insert
  after insert on public.listing_favorites
  for each row execute function public.adjust_listing_favorites_count();

create trigger listing_favorites_after_delete
  after delete on public.listing_favorites
  for each row execute function public.adjust_listing_favorites_count();

-- ── Follow-notification: notify followers when a followed store publishes ──

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'listing_published',
  'seller_request_approved',
  'seller_request_rejected',
  'followed_store_listing'
));

create or replace function public.notify_followers_on_new_listing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seller_tienda record;
begin
  if new.status <> 'published' or (tg_op = 'UPDATE' and old.status = 'published') then
    return new;
  end if;

  for seller_tienda in
    select slug, name from public.tiendas where owner_id = new.seller_id
  loop
    insert into public.notifications (user_id, type, title, message)
    select
      sf.follower_id,
      'followed_store_listing',
      seller_tienda.name,
      seller_tienda.name || ' ha publicado un nuevo anuncio: "' || new.title || '".'
    from public.store_follows sf
    where sf.tienda_slug = seller_tienda.slug;
  end loop;

  return new;
end;
$$;

create trigger listings_notify_followers
  after insert or update of status on public.listings
  for each row execute function public.notify_followers_on_new_listing();
