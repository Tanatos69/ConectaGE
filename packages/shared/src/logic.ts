import type { ListingRow } from "./types";
import type { SearchCriteria } from "./search";

/**
 * Framework-free business logic shared by web and mobile. Web's canonical
 * copies live in its server actions (apps/web/src/lib/actions/*) which can't
 * be imported by React Native; these pure functions reproduce the same rules
 * so a listing published from the phone follows the same moderation path.
 */

/** Strip everything but digits and a leading +, matching the web's normalizer. */
export function normalizePhone(raw: string): string {
  return raw.replace(/[^+0-9]/g, "");
}

export function isValidWhatsApp(raw: string): boolean {
  return /^\+[0-9]{6,15}$/.test(normalizePhone(raw));
}

/** URL-safe slug + random suffix, matching apps/web slugify(). */
export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "anuncio"}-${suffix}`;
}

/** Build a wa.me deep link with an optional prefilled message. */
export function buildWhatsAppLink(phone: string, message?: string): string {
  const number = normalizePhone(phone).replace(/^\+/, "");
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// ── Moderation ─────────────────────────────────────────────────────────────

/** Admin publishing rules (subset of the web `site_settings` row). */
export interface SiteSettings {
  moderation_required: boolean;
  auto_approve_verified: boolean;
  min_account_age_days_to_skip_queue: number;
  keyword_blacklist: string;
  auto_flag_price_above: number;
  max_images_per_listing: number;
  max_listings_per_day: number;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  moderation_required: false,
  auto_approve_verified: true,
  min_account_age_days_to_skip_queue: 0,
  keyword_blacklist: "",
  auto_flag_price_above: 0,
  max_images_per_listing: 8,
  max_listings_per_day: 0,
};

/**
 * Pure port of web's decideInitialStatus: given the admin settings and the
 * seller's trust facts (verified store, account age), decide whether a new
 * listing publishes immediately or lands in the moderation queue. The caller
 * (mobile publish flow) fetches `site_settings`, the seller's tienda.verified
 * and profile.created_at, then passes them here.
 */
export function decideInitialStatus(args: {
  settings: SiteSettings;
  title: string;
  description: string;
  price: number | null;
  tiendaVerified: boolean;
  accountAgeDays: number;
}): "published" | "pending" {
  const { settings, title, description, price, tiendaVerified, accountAgeDays } = args;

  const text = `${title} ${description}`.toLowerCase();
  const blacklisted = settings.keyword_blacklist
    .split(/\s+/)
    .filter(Boolean)
    .some((word) => text.includes(word.toLowerCase()));
  const priceFlagged =
    settings.auto_flag_price_above > 0 && price != null && price > settings.auto_flag_price_above;

  // Automatic flags always send the listing to review, even for trusted sellers.
  if (blacklisted || priceFlagged) return "pending";
  if (!settings.moderation_required) return "published";
  if (settings.auto_approve_verified && tiendaVerified) return "published";
  if (
    settings.min_account_age_days_to_skip_queue > 0 &&
    accountAgeDays >= settings.min_account_age_days_to_skip_queue
  )
    return "published";

  return "pending";
}

// ── Saved-search descriptions ───────────────────────────────────────────────

/** Human-readable (Spanish) summary of a saved search, e.g. for the list. */
export function describeCriteria(c: SearchCriteria): string {
  const parts: string[] = [];
  if (c.q) parts.push(`"${c.q}"`);
  if (c.listingType === "wanted") parts.push("Busco");
  if (c.category) parts.push(c.category);
  if (c.city && c.city !== "Todas") parts.push(c.city);
  if (c.minPrice != null || c.maxPrice != null) {
    parts.push(`${c.minPrice ?? 0}–${c.maxPrice ?? "∞"}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Todos los anuncios";
}

/** Whether a listing row is genuinely featured right now (flag + unexpired). */
export function isListingFeatured(row: Pick<ListingRow, "is_featured" | "featured_until">): boolean {
  return (
    row.is_featured && Boolean(row.featured_until) && new Date(row.featured_until!) > new Date()
  );
}
