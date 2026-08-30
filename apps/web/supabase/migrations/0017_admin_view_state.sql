-- ============================================================================
-- GEMarket — "seen" tracking for admin-panel activity badges.
-- Run manually in Supabase Studio → SQL Editor, after 0016.
--
-- Pending seller requests and pending reports already self-clear (their
-- badge is just "status = pending", which flips when an admin acts on the
-- item). New users and new listings have no such status to flip, so this
-- table tracks, per admin and per section, the last time they visited that
-- section — the badge is simply "how many rows appeared since then".
-- ============================================================================

create table public.admin_view_state (
  admin_id     uuid         not null references public.profiles (id) on delete cascade,
  section      text         not null check (section in ('users', 'listings')),
  last_seen_at timestamptz  not null default now(),
  primary key (admin_id, section)
);

alter table public.admin_view_state enable row level security;

-- No policies at all: only the service-role admin actions read/write here
-- (same idiom as admin_audit_log, 0015) — an admin's own "last seen"
-- timestamp isn't something a client should be able to forge directly.
