-- ============================================================================
-- GEMarket — optional demographics + consent-gated first-party analytics
-- Run manually in Supabase Studio → SQL Editor, after 0002_notifications.sql.
-- ============================================================================

-- ── Optional, self-declared demographics on profiles ───────────────────────
-- Both nullable; users set them (or don't) from Mi perfil. Editable through
-- the existing profiles_self_update RLS policy; the privileged-columns
-- trigger only guards role/verified, so no trigger change is needed.

alter table public.profiles add column gender text
  check (gender is null or gender in ('male', 'female', 'other', 'prefer_not_to_say'));

alter table public.profiles add column age_range text
  check (age_range is null or age_range in ('18-24', '25-34', '35-44', '45-54', '55+'));

-- ── First-party behavioral events (search → view → WhatsApp contact) ───────
-- The WhatsApp click is this marketplace's "conversion" event.

create table public.events (
  id           uuid primary key default gen_random_uuid(),
  -- Null when the visitor is anonymous OR declined the personalization
  -- consent category (analytics-only consent stores events unlinked).
  user_id      uuid references public.profiles (id) on delete set null,
  event_type   text not null check (event_type in ('search', 'view_listing', 'whatsapp_click')),
  query        text,
  category_slug text,
  city         text,
  listing_type text,
  listing_slug text,
  device       text check (device is null or device in ('mobile', 'desktop')),
  created_at   timestamptz not null default now()
);

create index events_type_created_idx on public.events (event_type, created_at desc);
create index events_created_idx on public.events (created_at desc);

alter table public.events enable row level security;

-- Intentionally NO select/insert/update/delete policies for anon or
-- authenticated roles: rows are written only through the security-definer
-- RPC below (same pattern as increment_listing_views) and read only through
-- the service-role client in the admin dashboard.

create or replace function public.log_event(
  p_type text,
  p_query text,
  p_category text,
  p_city text,
  p_listing_type text,
  p_listing_slug text,
  p_device text,
  p_link_user boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- p_link_user reflects the visitor's "Personalización" consent choice.
  -- Even when true, the id always comes from the caller's own verified
  -- session (auth.uid()) — never from a client-supplied value.
  insert into public.events
    (user_id, event_type, query, category_slug, city, listing_type, listing_slug, device)
  values (
    case when p_link_user then auth.uid() end,
    p_type,
    nullif(trim(coalesce(p_query, '')), ''),
    nullif(trim(coalesce(p_category, '')), ''),
    nullif(trim(coalesce(p_city, '')), ''),
    nullif(trim(coalesce(p_listing_type, '')), ''),
    nullif(trim(coalesce(p_listing_slug, '')), ''),
    case when p_device in ('mobile', 'desktop') then p_device end
  );
end;
$$;
