-- ============================================================================
-- GEMarket — rebrand from "ConectaGE" (naming dispute, 2026-08).
-- Run manually in Supabase Studio → SQL Editor, after 0018.
--
-- Code side is handled by packages/shared/src/brand.ts + the follow-up commit.
-- This migration only touches DATA the app already wrote to the live DB:
--   1. site_settings rows an admin's save persisted with the old name.
--   2. the welcome notification already delivered to existing users.
--
-- NOT handled here (must be done in the Supabase dashboard):
--   • Auth → URL Configuration → Site URL: set to the new public URL.
--   • Auth → URL Configuration → Redirect URLs: add the mobile deep-link
--     scheme `gemarket://**` (and remove `conectage://**` once no build
--     using it is in the wild).
--   • Auth → Providers → Google/Facebook: no change (callback stays on the
--     *.supabase.co domain).
-- ============================================================================

-- 1. Site settings ----------------------------------------------------------
-- Only rewrite rows that still carry the old brand; an admin-customised value
-- that never mentioned it is left untouched. contact_email is intentionally
-- NOT changed — brand.ts still points at @conectage.com until the new mail
-- domain is live (update this migration + brand.ts together when it is).

update public.site_settings
   set value = '"GEMarket"', updated_at = now()
 where key = 'site_name'
   and value = '"ConectaGE"';

update public.site_settings
   set value = to_jsonb(replace(value #>> '{}', 'titular ConectaGE', 'titular GEMarket')),
       updated_at = now()
 where key = 'payment_instructions'
   and value #>> '{}' like '%titular ConectaGE%';

-- 2. Historical welcome notifications --------------------------------------
update public.notifications
   set title   = replace(title, 'ConectaGE', 'GEMarket'),
       message = replace(message, 'ConectaGE', 'GEMarket')
 where title like '%ConectaGE%'
    or message like '%ConectaGE%';
