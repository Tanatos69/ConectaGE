-- ============================================================================
-- ConectaGE — web push subscriptions + wiring saved_searches.alerts (0016)
--             into a real match trigger (it's been a no-op column until now).
-- Run manually in Supabase Studio → SQL Editor, after 0017_admin_view_state.sql.
-- ============================================================================

-- ── Push subscriptions ───────────────────────────────────────────────────────
-- One row per browser/device subscription (a user may have several — phone +
-- desktop). Client inserts its own row on PushManager.subscribe() and deletes
-- it on unsubscribe — same own-row RLS shape as store_follows (0004).

create table public.push_subscriptions (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles (id) on delete cascade,
  endpoint   text        not null unique,
  p256dh     text        not null,
  auth       text        not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions_own_rw" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── notifications: new type for saved-search matches ────────────────────────

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'listing_published',
  'seller_request_approved',
  'seller_request_rejected',
  'followed_store_listing',
  'welcome',
  'listing_removed',
  'listing_approved',
  'featured_confirmed',
  'featured_rejected',
  'saved_search_match'
));

-- ── Trigger: notify saved-search owners when a matching listing publishes ──
-- `criteria` mirrors the flat SearchCriteria shape (src/lib/search.ts): q,
-- category, city, minPrice, maxPrice, condition, listingType. Every field is
-- optional — a null/absent field means "no filter on this field", same as
-- filterListings() on the client. `q` matches via strpos() (not ilike) to
-- sidestep %/_ wildcard-escaping entirely, since it's user-authored text.

create or replace function public.notify_saved_search_matches()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  match record;
  q text;
begin
  if new.status <> 'published' or (tg_op = 'UPDATE' and old.status = 'published') then
    return new;
  end if;

  for match in
    select user_id, criteria from public.saved_searches where alerts = true
  loop
    q := lower(coalesce(match.criteria->>'q', ''));

    if (match.criteria->>'category' is null or match.criteria->>'category' = new.category_slug)
       and (match.criteria->>'city' is null or match.criteria->>'city' = 'Todas' or match.criteria->>'city' = new.city)
       and (match.criteria->>'condition' is null or match.criteria->>'condition' = new.condition)
       and (match.criteria->>'listingType' is null or match.criteria->>'listingType' = new.listing_type::text)
       and (match.criteria->>'minPrice' is null or new.price is null or new.price >= (match.criteria->>'minPrice')::numeric)
       and (match.criteria->>'maxPrice' is null or new.price is null or new.price <= (match.criteria->>'maxPrice')::numeric)
       and (q = '' or strpos(lower(new.title), q) > 0 or strpos(lower(new.city), q) > 0)
    then
      insert into public.notifications (user_id, type, title, message)
      values (
        match.user_id,
        'saved_search_match',
        new.title,
        'Un nuevo anuncio coincide con tu búsqueda guardada: "' || new.title || '".'
      );
    end if;
  end loop;

  return new;
end;
$$;

create trigger listings_notify_saved_search_matches
  after insert or update of status on public.listings
  for each row execute function public.notify_saved_search_matches();
