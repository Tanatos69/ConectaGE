-- ============================================================================
-- ConectaGE — admin audit trail + tienda suspension + admin notes on users.
-- Run manually in Supabase Studio → SQL Editor, after 0014.
-- ============================================================================

-- ── Admin audit log ──────────────────────────────────────────────────────────
-- Every admin server action records what was done, by whom, to what. RLS is
-- enabled with NO policies at all: reads and writes both happen exclusively
-- through the service-role client (the admin actions and the admin UI).

create table public.admin_audit_log (
  id          uuid         primary key default gen_random_uuid(),
  admin_id    uuid         not null references public.profiles (id) on delete cascade,
  action      text         not null,
  target_type text         not null,
  target_id   text,
  meta        jsonb,
  created_at  timestamptz  not null default now()
);

create index admin_audit_log_created_idx on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

-- ── Tienda suspension ────────────────────────────────────────────────────────
-- Suspending hides the store from every public surface (directory, strip,
-- its own page) without touching its data; the owner keeps access to their
-- dashboard. Cleared columns = active again.

alter table public.tiendas add column suspended_at timestamptz;
alter table public.tiendas add column suspended_reason text;

-- Admin notes on users deliberately do NOT get a profiles column: profiles
-- has a public-select-all policy (profiles_public_select), so any column
-- there is world-readable. Internal notes are stored as admin_audit_log
-- rows instead (action = 'note', target_type = 'user') — service-role-only
-- by the absence of policies above, with authorship and history for free.
