import { cookies, headers } from "next/headers";
import { createClient } from "./server";
import { isSupabaseConfigured } from "./config";
import { parseConsent, CONSENT_COOKIE } from "@/lib/consent";
import type {
  ListingRow,
  TiendaRow,
  Profile,
  NotificationRow,
  AnalyticsEventType,
  ReviewRow,
} from "./types";
import { categories } from "@/lib/categories";
import {
  allListings as demoAllListings,
  featuredListings as demoFeaturedListings,
  type Listing,
} from "@/lib/listings";
import {
  getStoreBySlug as getDemoStoreBySlug,
  getStoreListings as getDemoStoreListings,
  type Store,
} from "@/lib/stores";
import { postedLabel, monthYearLabel } from "@/lib/time";

export { postedLabel, monthYearLabel };

/**
 * Read helpers that map DB rows into the existing `Listing`/`Store` shapes so
 * ListingCard, formatPrice and filterListings need no changes — only the data
 * source changes. At this scale (tens of users, hundreds of listings)
 * fetch-all-then-filter-in-memory via the existing filterListings() is
 * simpler and lower risk than pushing every page's filters into SQL.
 *
 * While Supabase isn't configured (env vars absent) every helper falls back
 * to the demo data, so the site stays fully browsable pre-setup.
 */

const FALLBACK_IMAGE = "/demo/sofa-gris.jpg";

function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? "Otros / Varios";
}

export function mapListingRow(row: ListingRow): Listing {
  return {
    slug: row.slug,
    title: row.title,
    price: row.price != null ? Number(row.price) : null,
    priceType: row.price_type,
    currency: row.currency,
    city: row.city,
    region: row.region,
    postedLabel: postedLabel(row.created_at),
    categorySlug: row.category_slug,
    categoryName: categoryName(row.category_slug),
    condition: row.condition,
    image: row.images[0] ?? FALLBACK_IMAGE,
    listingType: row.listing_type,
  };
}

/** Full row + card shape, for the detail page and the owner dashboard. */
export interface ListingWithDetail {
  listing: Listing;
  row: ListingRow;
  seller: Profile | null;
}

// ── Listings ─────────────────────────────────────────────────────────────────

export async function getPublishedListings(): Promise<Listing[]> {
  if (!isSupabaseConfigured) return demoAllListings;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error || !data) return [];
  return (data as ListingRow[]).map(mapListingRow);
}

/** Featured strip: real listings when configured (newest first), demo before. */
export async function getFeaturedListings(): Promise<Listing[]> {
  if (!isSupabaseConfigured) return demoFeaturedListings;
  const listings = await getPublishedListings();
  return listings.slice(0, 8).map((l) => ({ ...l, featured: true }));
}

export async function getListingWithDetail(slug: string): Promise<ListingWithDetail | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as ListingRow;

  const { data: seller } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", row.seller_id)
    .maybeSingle();

  return {
    listing: mapListingRow(row),
    row,
    seller: (seller as Profile | null) ?? null,
  };
}

export async function getListingsByOwner(userId: string): Promise<ListingRow[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as ListingRow[];
}

export async function getOwnListingById(id: string): Promise<ListingRow | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  return (data as ListingRow | null) ?? null;
}

/** Fire-and-forget view counter (security-definer RPC, anon-safe). */
export async function incrementListingViews(slug: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = await createClient();
    await supabase.rpc("increment_listing_views", { listing_slug: slug });
  } catch {
    // View counting must never break the page.
  }
}

// ── Stores ───────────────────────────────────────────────────────────────────

export function mapTiendaRow(row: TiendaRow, listingSlugs: string[] = []): Store {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    banner: row.banner ?? FALLBACK_IMAGE,
    logo: row.logo ?? undefined,
    city: row.city,
    address: row.address || undefined,
    neighborhood: row.neighborhood || undefined,
    businessHours: row.business_hours || undefined,
    categorySlug: row.category_slug,
    categoryName: categoryName(row.category_slug),
    verificationStatus: row.verified ? "verified" : "unverified",
    professional: true,
    memberSince: monthYearLabel(row.created_at),
    followers: row.followers_count,
    rating: 0,
    reviewsCount: 0,
    whatsapp: row.whatsapp,
    instagram: row.instagram || undefined,
    facebook: row.facebook || undefined,
    description: row.description,
    listingSlugs,
  };
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  if (!isSupabaseConfigured) return getDemoStoreBySlug(slug) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("tiendas").select("*").eq("slug", slug).maybeSingle();
  if (!data) {
    // Demo stores linked from the (still-static) directory keep working.
    return getDemoStoreBySlug(slug) ?? null;
  }
  const row = data as TiendaRow;
  const { data: rows } = await supabase
    .from("listings")
    .select("id, slug")
    .eq("seller_id", row.owner_id)
    .eq("status", "published");
  const listingRows = (rows ?? []) as { id: string; slug: string }[];

  const store = mapTiendaRow(row, listingRows.map((r) => r.slug));

  if (listingRows.length > 0) {
    const { data: reviewRows } = await supabase
      .from("reviews")
      .select("rating")
      .in("listing_id", listingRows.map((r) => r.id));
    const ratings = (reviewRows ?? []) as { rating: number }[];
    if (ratings.length > 0) {
      store.rating =
        Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10;
      store.reviewsCount = ratings.length;
    }
  }

  return store;
}

export async function getStoreListings(store: Store): Promise<Listing[]> {
  if (!isSupabaseConfigured) {
    const demo = getDemoStoreBySlug(store.slug);
    return demo ? getDemoStoreListings(demo) : [];
  }
  if (store.listingSlugs.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .in("slug", store.listingSlugs)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (data && data.length > 0) return (data as ListingRow[]).map(mapListingRow);
  // Demo store fallback (its slugs point at the static arrays).
  const demo = getDemoStoreBySlug(store.slug);
  return demo ? getDemoStoreListings(demo) : [];
}

export async function getTiendaByOwner(userId: string): Promise<TiendaRow | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("tiendas").select("*").eq("owner_id", userId).maybeSingle();
  return (data as TiendaRow | null) ?? null;
}

// ── Profiles / seller requests ───────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function getPendingSellerRequest(userId: string) {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("seller_requests")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .maybeSingle();
  return data;
}

// ── Analytics events (consent-gated) ─────────────────────────────────────────

/**
 * Logs a behavioral event from a Server Component, respecting the visitor's
 * cookie-consent choice: no consent cookie or analytics off → nothing is
 * stored; analytics on but personalization off → stored with user_id NULL.
 * Never throws — analytics must never break a page.
 */
export async function logEvent(
  type: AnalyticsEventType,
  data: {
    query?: string;
    categorySlug?: string;
    city?: string;
    listingType?: string;
    listingSlug?: string;
  },
): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const cookieStore = await cookies();
    const consent = parseConsent(cookieStore.get(CONSENT_COOKIE)?.value);
    if (!consent?.analytics) return;

    const ua = (await headers()).get("user-agent") ?? "";
    const device = /mobi|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";

    const supabase = await createClient();
    await supabase.rpc("log_event", {
      p_type: type,
      p_query: data.query ?? null,
      p_category: data.categorySlug ?? null,
      p_city: data.city ?? null,
      p_listing_type: data.listingType ?? null,
      p_listing_slug: data.listingSlug ?? null,
      p_device: device,
      p_link_user: consent.personalization,
    });
  } catch {
    // Swallow: a failed analytics write is never worth a broken page.
  }
}

// ── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<NotificationRow[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return data as NotificationRow[];
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export async function getReviewsForListing(listingId: string): Promise<
  (ReviewRow & { reviewerName: string })[]
> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });
  const rows = (reviews ?? []) as ReviewRow[];
  if (rows.length === 0) return [];

  const { data: reviewers } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", rows.map((r) => r.reviewer_id));
  const nameById = new Map(
    ((reviewers ?? []) as { id: string; full_name: string }[]).map((p) => [p.id, p.full_name]),
  );

  return rows.map((r) => ({ ...r, reviewerName: nameById.get(r.reviewer_id) || "Usuario" }));
}

/** Aggregate, read-only reviews across every listing a store has published. */
export async function getReviewsForStore(listingSlugs: string[]): Promise<
  (ReviewRow & { reviewerName: string })[]
> {
  if (!isSupabaseConfigured || listingSlugs.length === 0) return [];
  const supabase = await createClient();
  const { data: listingRows } = await supabase
    .from("listings")
    .select("id")
    .in("slug", listingSlugs);
  const listingIds = (listingRows ?? []).map((r: { id: string }) => r.id);
  if (listingIds.length === 0) return [];

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false })
    .limit(50);
  const rows = (reviews ?? []) as ReviewRow[];
  if (rows.length === 0) return [];

  const { data: reviewers } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", rows.map((r) => r.reviewer_id));
  const nameById = new Map(
    ((reviewers ?? []) as { id: string; full_name: string }[]).map((p) => [p.id, p.full_name]),
  );

  return rows.map((r) => ({ ...r, reviewerName: nameById.get(r.reviewer_id) || "Usuario" }));
}

// ── Favorites / follows ──────────────────────────────────────────────────────

export async function getFavoriteListings(userId: string): Promise<Listing[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data: favRows } = await supabase
    .from("listing_favorites")
    .select("listing_slug")
    .eq("user_id", userId);
  const slugs = (favRows ?? []).map((r: { listing_slug: string }) => r.listing_slug);
  if (slugs.length === 0) return [];

  const { data } = await supabase.from("listings").select("*").in("slug", slugs);
  return ((data ?? []) as ListingRow[]).map(mapListingRow);
}

export async function getFavoriteCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  const supabase = await createClient();
  const { count } = await supabase
    .from("listing_favorites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}

export async function getFollowedStores(userId: string): Promise<Store[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data: followRows } = await supabase
    .from("store_follows")
    .select("tienda_slug")
    .eq("follower_id", userId);
  const slugs = (followRows ?? []).map((r: { tienda_slug: string }) => r.tienda_slug);
  if (slugs.length === 0) return [];

  const { data } = await supabase.from("tiendas").select("*").in("slug", slugs);
  const tiendas = (data ?? []) as TiendaRow[];
  if (tiendas.length === 0) return [];

  const ownerIds = tiendas.map((t) => t.owner_id);
  const { data: listingRows } = await supabase
    .from("listings")
    .select("slug, seller_id")
    .in("seller_id", ownerIds)
    .eq("status", "published");
  const slugsByOwner = new Map<string, string[]>();
  for (const row of (listingRows ?? []) as { slug: string; seller_id: string }[]) {
    const list = slugsByOwner.get(row.seller_id) ?? [];
    list.push(row.slug);
    slugsByOwner.set(row.seller_id, list);
  }

  return tiendas.map((t) => mapTiendaRow(t, slugsByOwner.get(t.owner_id) ?? []));
}
