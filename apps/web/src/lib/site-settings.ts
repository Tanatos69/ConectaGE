/**
 * Site-wide settings: defaults + types. Isomorphic on purpose — the admin
 * settings form (client component) needs the key list and types, so this
 * file must not import any server-only module. The server-side reader lives
 * in lib/supabase/settings.ts.
 *
 * Stored as one jsonb row per key in `site_settings` (migration 0013) and
 * edited from /admin/ajustes. This object is the source of truth for which
 * keys exist and their types — DB rows only override it, so a key shipped
 * here before its row exists still resolves to its default.
 *
 * The table is world-readable by design (the public layout needs maintenance
 * mode, colors and the banner) — never add secrets.
 */
export const DEFAULT_SETTINGS = {
  site_name: "GEMarket",
  /** Public URL of an uploaded logo; empty = the built-in SVG wordmark. */
  logo_url: "",
  /** Hex color overriding --primary site-wide; empty = brand default. */
  primary_color: "",
  site_whatsapp: "+240 222 000 000",
  contact_email: "info@conectage.com",
  footer_tagline: "El mercado de anuncios clasificados de Guinea Ecuatorial.",
  announcement_enabled: false,
  announcement_text: "",
  announcement_href: "",
  home_show_categories: true,
  home_show_featured: true,
  home_show_stores: true,
  listing_expiry_days: 60,
  max_images_per_listing: 10,
  max_listings_per_day: 3,
  moderation_required: true,
  auto_approve_verified: true,
  maintenance_mode: false,
  featured_price_7d: 5000,
  featured_price_15d: 8000,
  featured_price_30d: 12000,
  payment_instructions:
    "Paga por transferencia bancaria (BANGE, cuenta 001-234567-89, titular GEMarket) o Muni Dinero al +240 222 000 000. Envía el comprobante por WhatsApp al mismo número indicando el título de tu anuncio.",
  keyword_blacklist: "estafa fraude dinero rápido inversión garantizada",
  max_reports_before_auto_remove: 5,
  min_account_age_days_to_skip_queue: 7,
  auto_flag_price_above: 10000000,
};

export type SiteSettings = typeof DEFAULT_SETTINGS;
export type SiteSettingKey = keyof SiteSettings;
