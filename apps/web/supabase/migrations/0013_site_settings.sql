-- ============================================================================
-- ConectaGE — real site settings + site-assets storage bucket.
-- Run manually in Supabase Studio → SQL Editor, after 0012.
--
-- Key-value settings table (the classifieds-platform standard: LaraClassifier,
-- Osclass and Yclas all store admin config this way) so new settings never
-- need a schema migration. Values are jsonb: bare strings, numbers and
-- booleans, matching the typed DEFAULT_SETTINGS object in
-- apps/web/src/lib/supabase/settings.ts — that file is the source of truth
-- for which keys exist; rows here only override its defaults.
--
-- NEVER store secrets here: the table is world-readable (public select) so
-- the public layout can render maintenance mode / colors / banner.
-- ============================================================================

create table public.site_settings (
  key        text         primary key,
  value      jsonb        not null,
  updated_at timestamptz  not null default now(),
  updated_by uuid         references public.profiles (id) on delete set null
);

alter table public.site_settings enable row level security;

create policy "site_settings_public_select" on public.site_settings
  for select using (true);

-- No insert/update/delete policy on purpose: only the service-role admin
-- action writes here — same idiom as categories (0011).

-- ── Seed: current defaults (transcribed from the old demo siteSettings) ─────
-- `on conflict do nothing` keeps this idempotent and never clobbers values
-- an admin already changed.

insert into public.site_settings (key, value) values
  ('site_name',                          '"ConectaGE"'),
  ('logo_url',                           '""'),
  ('primary_color',                      '""'),
  ('site_whatsapp',                      '"+240 222 000 000"'),
  ('contact_email',                      '"info@conectage.com"'),
  ('footer_tagline',                     '"El mercado de anuncios clasificados de Guinea Ecuatorial."'),
  ('announcement_enabled',               'false'),
  ('announcement_text',                  '""'),
  ('announcement_href',                  '""'),
  ('home_show_categories',               'true'),
  ('home_show_featured',                 'true'),
  ('home_show_stores',                   'true'),
  ('listing_expiry_days',                '60'),
  ('max_images_per_listing',             '10'),
  ('max_listings_per_day',               '3'),
  ('moderation_required',                'true'),
  ('auto_approve_verified',              'true'),
  ('maintenance_mode',                   'false'),
  ('featured_price_7d',                  '5000'),
  ('featured_price_15d',                 '8000'),
  ('featured_price_30d',                 '12000'),
  ('payment_instructions',               '"Paga por transferencia bancaria (BANGE, cuenta 001-234567-89, titular ConectaGE) o Muni Dinero al +240 222 000 000. Envía el comprobante por WhatsApp al mismo número indicando el título de tu anuncio."'),
  ('keyword_blacklist',                  '"estafa fraude dinero rápido inversión garantizada"'),
  ('max_reports_before_auto_remove',     '5'),
  ('min_account_age_days_to_skip_queue', '7'),
  ('auto_flag_price_above',              '10000000')
on conflict (key) do nothing;

-- ── notifications: new types ────────────────────────────────────────────────
-- 'listing_approved' — a listing waiting in the pre-publish moderation queue
-- (settings-driven) was approved by an admin and is now visible.
-- 'featured_confirmed' / 'featured_rejected' — outcome of a seller's paid
-- destacado request.

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
  'featured_rejected'
));

-- ── Storage: public bucket for admin-uploaded site assets (logo etc.) ───────
-- Public read; NO write policy on storage.objects for this bucket — uploads
-- go exclusively through the service-role uploadSiteAssetAction.

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "site_assets_public_read" on storage.objects
  for select using (bucket_id = 'site-assets');
