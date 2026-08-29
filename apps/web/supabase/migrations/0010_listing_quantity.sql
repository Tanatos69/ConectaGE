-- ============================================================================
-- GEMarket — quantity available on listings
-- Run manually in Supabase Studio → SQL Editor, after 0009.
--
-- Purely additive: ADD COLUMN with a DEFAULT of null on a live table with
-- real rows is safe. Null means "not applicable/not tracked" — same
-- convention as the existing nullable `condition` column. Shown on the
-- create form only for stock-style categories (electrónica, moda, muebles,
-- salud, varios); not enforced at the DB level since categories aren't a
-- fixed set the schema can check against.
-- ============================================================================

alter table public.listings add column quantity integer
  check (quantity is null or quantity >= 0);
