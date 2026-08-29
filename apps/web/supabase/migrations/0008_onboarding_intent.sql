-- ============================================================================
-- GEMarket — buyer/seller onboarding intent
-- Run manually in Supabase Studio → SQL Editor, after 0007.
--
-- Purely additive: ADD COLUMN with a DEFAULT of null on a live table with
-- real rows is safe. null means "not shown/answered yet"; every existing
-- account is treated as unanswered, so the modal appears once for them too.
-- ============================================================================

alter table public.profiles add column onboarding_intent text
  check (onboarding_intent is null or onboarding_intent in ('buyer', 'seller', 'skipped'));
