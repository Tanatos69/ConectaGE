-- ============================================================================
-- GEMarket — saved searches move from localStorage into a real table.
-- Run manually in Supabase Studio → SQL Editor, after 0015.
--
-- User-managed data → full own-row RLS (unlike the admin-managed tables,
-- which have no write policies at all).
-- ============================================================================

create table public.saved_searches (
  id         uuid         primary key default gen_random_uuid(),
  user_id    uuid         not null references public.profiles (id) on delete cascade,
  label      text         not null,
  criteria   jsonb        not null,
  alerts     boolean      not null default true,
  created_at timestamptz  not null default now()
);

create index saved_searches_user_idx on public.saved_searches (user_id, created_at desc);

alter table public.saved_searches enable row level security;

create policy "saved_searches_own_select" on public.saved_searches
  for select using (auth.uid() = user_id);

create policy "saved_searches_own_insert" on public.saved_searches
  for insert with check (auth.uid() = user_id);

create policy "saved_searches_own_update" on public.saved_searches
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "saved_searches_own_delete" on public.saved_searches
  for delete using (auth.uid() = user_id);
