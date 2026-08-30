-- ============================================================================
-- GEMarket — locations move from hardcoded TypeScript into a real table.
-- Run manually in Supabase Studio → SQL Editor, after 0013.
--
-- Self-referencing tree, same shape and RLS idiom as categories (0011):
-- provinces have parent_id null, cities point at their province. Listings
-- and tiendas keep storing the city NAME as text (soft reference, exactly
-- like category_slug) — no change to their schemas, so deactivating a city
-- hides it from dropdowns without touching existing listings.
--
-- Seed transcribed from apps/web/src/lib/cities.ts (8 provinces, 29 cities);
-- that file remains only as the unconfigured-dev fallback.
-- ============================================================================

create table public.locations (
  id         uuid         primary key default gen_random_uuid(),
  parent_id  uuid         references public.locations (id) on delete cascade,
  name       text         not null,
  slug       text         not null,
  type       text         not null check (type in ('province', 'city')),
  sort_order smallint     not null default 0,
  is_active  boolean      not null default true,
  created_at timestamptz  not null default now(),
  unique (parent_id, slug)
);

create unique index locations_top_level_slug_idx
  on public.locations (slug)
  where parent_id is null;

create index locations_parent_idx on public.locations (parent_id);

alter table public.locations enable row level security;

create policy "locations_public_select" on public.locations
  for select using (true);

-- No insert/update/delete policy on purpose: only the service-role admin
-- actions write here — same idiom as categories (0011).

-- ── Seed: 8 provinces ────────────────────────────────────────────────────────

insert into public.locations (slug, name, type, sort_order) values
  ('bioko-norte', 'Bioko Norte', 'province', 0),
  ('bioko-sur',   'Bioko Sur',   'province', 1),
  ('litoral',     'Litoral',     'province', 2),
  ('centro-sur',  'Centro Sur',  'province', 3),
  ('kie-ntem',    'Kié-Ntem',    'province', 4),
  ('wele-nzas',   'Wele-Nzas',   'province', 5),
  ('djibloho',    'Djibloho',    'province', 6),
  ('annobon',     'Annobón',     'province', 7);

-- ── Seed: cities per province ────────────────────────────────────────────────

insert into public.locations (slug, parent_id, name, type, sort_order)
select v.slug, (select id from public.locations where slug = 'bioko-norte' and parent_id is null), v.name, 'city', v.sort_order
from (values
  ('malabo', 'Malabo', 0),
  ('rebola', 'Rebola', 1),
  ('baney', 'Baney', 2),
  ('riaba', 'Riaba', 3)
) as v(slug, name, sort_order);

insert into public.locations (slug, parent_id, name, type, sort_order)
select v.slug, (select id from public.locations where slug = 'bioko-sur' and parent_id is null), v.name, 'city', v.sort_order
from (values
  ('luba', 'Luba', 0),
  ('moka', 'Moka', 1),
  ('batete', 'Batete', 2)
) as v(slug, name, sort_order);

insert into public.locations (slug, parent_id, name, type, sort_order)
select v.slug, (select id from public.locations where slug = 'litoral' and parent_id is null), v.name, 'city', v.sort_order
from (values
  ('bata', 'Bata', 0),
  ('mbini', 'Mbini', 1),
  ('cogo', 'Cogo', 2),
  ('acalayong', 'Acalayong', 3),
  ('machinda', 'Machinda', 4)
) as v(slug, name, sort_order);

insert into public.locations (slug, parent_id, name, type, sort_order)
select v.slug, (select id from public.locations where slug = 'centro-sur' and parent_id is null), v.name, 'city', v.sort_order
from (values
  ('evinayong', 'Evinayong', 0),
  ('niefang', 'Niefang', 1),
  ('sevilla-de-niefang', 'Sevilla de Niefang', 2),
  ('ncue', 'Ncue', 3),
  ('belebu', 'Belebú', 4)
) as v(slug, name, sort_order);

insert into public.locations (slug, parent_id, name, type, sort_order)
select v.slug, (select id from public.locations where slug = 'kie-ntem' and parent_id is null), v.name, 'city', v.sort_order
from (values
  ('ebebiyin', 'Ebebiyín', 0),
  ('nsork', 'Nsork', 1),
  ('mikomeseng', 'Mikomeseng', 2),
  ('nkimi', 'Nkimi', 3),
  ('bidjabidjan', 'Bidjabidjan', 4)
) as v(slug, name, sort_order);

insert into public.locations (slug, parent_id, name, type, sort_order)
select v.slug, (select id from public.locations where slug = 'wele-nzas' and parent_id is null), v.name, 'city', v.sort_order
from (values
  ('mongomo', 'Mongomo', 0),
  ('akonibe', 'Akonibe', 1),
  ('anisoc', 'Añisoc', 2),
  ('nsoc-nsomo', 'Nsoc Nsomo', 3),
  ('mengomeyen', 'Mengomeyén', 4)
) as v(slug, name, sort_order);

insert into public.locations (slug, parent_id, name, type, sort_order)
select v.slug, (select id from public.locations where slug = 'djibloho' and parent_id is null), v.name, 'city', v.sort_order
from (values
  ('ciudad-de-la-paz', 'Ciudad de la Paz', 0)
) as v(slug, name, sort_order);

insert into public.locations (slug, parent_id, name, type, sort_order)
select v.slug, (select id from public.locations where slug = 'annobon' and parent_id is null), v.name, 'city', v.sort_order
from (values
  ('san-antonio-de-pale', 'San Antonio de Palé', 0)
) as v(slug, name, sort_order);
