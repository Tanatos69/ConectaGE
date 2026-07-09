-- ============================================================================
-- ConectaGE — per-category notification preferences
-- Run manually in Supabase Studio → SQL Editor, after 0004_social.sql.
--
-- Purely additive: ADD COLUMN with a DEFAULT on live tables with existing
-- rows is safe — every existing profile gets `true` for all three, matching
-- today's always-on behavior, and no trigger/RLS changes are needed (the
-- existing profiles_self_update policy already covers new columns; the
-- privileged-columns trigger only guards role/verified).
--
-- Notifications are still always created by the existing triggers in
-- 0002/0004 — these preferences only control what's SHOWN to the user
-- (filtered in lib/supabase/queries.ts getNotifications), not what's stored.
-- Keeping every row lets a future admin activity view see everything.
-- ============================================================================

alter table public.profiles add column notify_listings boolean not null default true;
alter table public.profiles add column notify_seller_requests boolean not null default true;
alter table public.profiles add column notify_followed_stores boolean not null default true;
