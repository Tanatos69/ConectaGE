import { cache } from "react";
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
import { subcategories } from "@/lib/subcategories";
import { EQUATORIAL_GUINEA_CITIES_BY_PROVINCE, type CityByProvince } from "@/lib/cities";
import {
  allListings as demoAllListings,
  featuredListings as demoFeaturedListings,
  type Listing,
} from "@/lib/listings";
import {
  getStoreBySlug as getDemoStoreBySlug,
  getStoreListings as getDemoStoreListings,
  demoStores,
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

// ── Locations ────────────────────────────────────────────────────────────────

export interface LocationNode {
  id: string;
  slug: string;
  parentId: string | null;
  name: string;
  type: "province" | "city";
  sortOrder: number;
  isActive: boolean;
}

/**
 * Real province/city tree (flat list; group by parentId client-side) —
 * admin-managed in /admin/ubicaciones, cached per request like
 * getCategoryTree. Only active rows; the static cities.ts list remains the
 * unconfigured-dev fallback.
 */
export const getLocationTree = cache(async function getLocationTree(): Promise<LocationNode[]> {
  if (!isSupabaseConfigured) {
    return EQUATORIAL_GUINEA_CITIES_BY_PROVINCE.flatMap((p, pi) => [
      {
        id: p.province,
        slug: p.province,
        parentId: null,
        name: p.province,
        type: "province" as const,
        sortOrder: pi,
        isActive: true,
      },
      ...p.cities.map((c, ci) => ({
        id: `${p.province}:${c}`,
        slug: c,
        parentId: p.province,
        name: c,
        type: "city" as const,
        sortOrder: ci,
        isActive: true,
      })),
    ]);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("id, slug, parent_id, name, type, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return ((data ?? []) as {
    id: string;
    slug: string;
    parent_id: string | null;
    name: string;
    type: "province" | "city";
    sort_order: number;
    is_active: boolean;
  }[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    parentId: r.parent_id,
    name: r.name,
    type: r.type,
    sortOrder: r.sort_order,
    isActive: r.is_active,
  }));
});

/** Grouped province → cities shape, same as the old static cities.ts. */
export function locationsByProvince(tree: LocationNode[]): CityByProvince[] {
  return tree
    .filter((n) => n.parentId === null)
    .map((prov) => ({
      province: prov.name,
      cities: tree.filter((n) => n.parentId === prov.id).map((n) => n.name),
    }))
    .filter((p) => p.cities.length > 0);
}

/** Flat alphabetical city-name list, same shape as the old GE_CITIES.
 * A city only counts when its province is also active (hiding a province
 * hides its cities everywhere). */
export function flatCityNames(tree: LocationNode[]): string[] {
  const provinceIds = new Set(tree.filter((n) => n.parentId === null).map((n) => n.id));
  return tree
    .filter((n) => n.parentId !== null && provinceIds.has(n.parentId))
    .map((n) => n.name)
    .sort((a, b) => a.localeCompare(b, "es"));
}

export interface CategoryNode {
  id: string;
  slug: string;
  parentId: string | null;
  name: string;
  icon: string | null;
  sortOrder: number;
}

/**
 * Real category tree (flat list; group by parentId client-side) — cached
 * per request with React's cache() since many independent call sites need
 * it (header, footer, homepage, category pages, publicar wizard, admin),
 * and this collapses them into a single DB round trip per request.
 */
export const getCategoryTree = cache(async function getCategoryTree(): Promise<CategoryNode[]> {
  if (!isSupabaseConfigured) {
    const top: CategoryNode[] = categories.map((c, i) => ({
      id: c.slug,
      slug: c.slug,
      parentId: null,
      name: c.name,
      icon: c.iconName,
      sortOrder: i,
    }));
    const children: CategoryNode[] = Object.entries(subcategories).flatMap(([parentSlug, subs]) =>
      subs.map((s, i) => ({
        id: `${parentSlug}:${s.slug}`,
        slug: s.slug,
        // Matches parent.id above (slug-as-id in this fallback tree only).
        parentId: parentSlug,
        name: s.name,
        icon: null,
        sortOrder: i,
      })),
    );
    return [...top, ...children];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, parent_id, name, icon, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    (data ?? []) as {
      id: string;
      slug: string;
      parent_id: string | null;
      name: string;
      icon: string | null;
      sort_order: number;
    }[]
  ).map((r) => ({
    id: r.id,
    slug: r.slug,
    parentId: r.parent_id,
    name: r.name,
    icon: r.icon,
    sortOrder: r.sort_order,
  }));
});

function categoryNameFromTree(tree: CategoryNode[], slug: string): string {
  return tree.find((c) => c.parentId === null && c.slug === slug)?.name ?? slug;
}

/**
 * Real published-listing counts per category/subcategory, for the category
 * browsing pages — replaces the old static demo `count` field. Falls back
 * to the demo counts (not zero) while unconfigured, so the pre-setup site
 * still reads as a populated marketplace for sales-demo purposes.
 */
export const getCategoryListingCounts = cache(async function getCategoryListingCounts(): Promise<{
  byCategory: Map<string, number>;
  bySubcategory: Map<string, number>;
}> {
  if (!isSupabaseConfigured) {
    return {
      byCategory: new Map(categories.map((c) => [c.slug, c.count])),
      bySubcategory: new Map(
        Object.entries(subcategories).flatMap(([catSlug, subs]) =>
          subs.map((s) => [`${catSlug}:${s.slug}`, s.count] as const),
        ),
      ),
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("category_slug, subcategory_slug")
    .eq("status", "published");

  const byCategory = new Map<string, number>();
  const bySubcategory = new Map<string, number>();
  for (const row of (data ?? []) as { category_slug: string; subcategory_slug: string }[]) {
    byCategory.set(row.category_slug, (byCategory.get(row.category_slug) ?? 0) + 1);
    if (row.subcategory_slug) {
      const key = `${row.category_slug}:${row.subcategory_slug}`;
      bySubcategory.set(key, (bySubcategory.get(key) ?? 0) + 1);
    }
  }
  return { byCategory, bySubcategory };
});

/**
 * A blocked seller's content is hidden from every public surface (never a
 * status change on the listings themselves, so unblocking makes everything
 * reappear automatically). Sellers keep seeing their own content while
 * blocked via the unfiltered owner-scoped queries — the account itself is
 * locked out at sign-in/middleware, not the data.
 */
async function getBlockedSellerIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Set<string>> {
  const { data } = await supabase.from("profiles").select("id").not("blocked_at", "is", null);
  return new Set((data ?? []).map((p: { id: string }) => p.id));
}

export function mapListingRow(row: ListingRow, categoryTree: CategoryNode[]): Listing {
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
    categoryName: categoryNameFromTree(categoryTree, row.category_slug),
    condition: row.condition,
    image: row.images[0] ?? FALLBACK_IMAGE,
    listingType: row.listing_type,
    // Additive with the separate localStorage credits-promoted check in
    // ListingCard (`listing.featured || isPromoted(slug)`) — both systems
    // can flag a listing as featured without conflicting.
    featured: row.is_featured && Boolean(row.featured_until) && new Date(row.featured_until!) > new Date(),
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
  const [{ data, error }, blockedIds, categoryTree] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(500),
    getBlockedSellerIds(supabase),
    getCategoryTree(),
  ]);
  if (error || !data) return [];
  return (data as ListingRow[])
    .filter((row) => !blockedIds.has(row.seller_id))
    .map((row) => mapListingRow(row, categoryTree));
}

/** Featured strip: real listings when configured (newest first), demo before. */
export async function getFeaturedListings(limit = 8): Promise<Listing[]> {
  if (!isSupabaseConfigured) return demoFeaturedListings;
  const listings = await getPublishedListings();
  // Genuinely featured only (real is_featured flag, current) — no fake
  // fallback padding. FeaturedListings already hides the whole section
  // when this is empty.
  return listings.filter((l) => l.featured).slice(0, limit);
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

  const [{ data: seller }, categoryTree] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", row.seller_id).maybeSingle(),
    getCategoryTree(),
  ]);

  if ((seller as Profile | null)?.blocked_at) return null;

  return {
    listing: mapListingRow(row, categoryTree),
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

export function mapTiendaRow(row: TiendaRow, categoryTree: CategoryNode[], listingSlugs: string[] = []): Store {
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
    categoryName: categoryNameFromTree(categoryTree, row.category_slug),
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

/**
 * Public stores directory + home strip. Real tiendas only — verified first,
 * then by following count; blocked owners' stores hidden.
 */
export async function getStores(limit?: number): Promise<Store[]> {
  if (!isSupabaseConfigured) return demoStores;
  const supabase = await createClient();
  let query = supabase
    .from("tiendas")
    .select("*")
    .order("verified", { ascending: false })
    .order("followers_count", { ascending: false })
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const [{ data }, blockedIds] = await Promise.all([query, getBlockedSellerIds(supabase)]);
  const tiendas = ((data ?? []) as TiendaRow[]).filter((t) => !blockedIds.has(t.owner_id));
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

  const categoryTree = await getCategoryTree();
  return tiendas.map((t) => mapTiendaRow(t, categoryTree, slugsByOwner.get(t.owner_id) ?? []));
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  if (!isSupabaseConfigured) return getDemoStoreBySlug(slug) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("tiendas").select("*").eq("slug", slug).maybeSingle();
  if (!data) return null;
  const row = data as TiendaRow;

  const { data: owner } = await supabase
    .from("profiles")
    .select("blocked_at")
    .eq("id", row.owner_id)
    .maybeSingle();
  if ((owner as { blocked_at: string | null } | null)?.blocked_at) return null;

  const { data: rows } = await supabase
    .from("listings")
    .select("id, slug")
    .eq("seller_id", row.owner_id)
    .eq("status", "published");
  const listingRows = (rows ?? []) as { id: string; slug: string }[];

  const categoryTree = await getCategoryTree();
  const store = mapTiendaRow(row, categoryTree, listingRows.map((r) => r.slug));

  // Aggregate rating across direct store reviews + its listings' reviews.
  const orFilter =
    listingRows.length > 0
      ? `tienda_slug.eq.${slug},listing_id.in.(${listingRows.map((r) => r.id).join(",")})`
      : `tienda_slug.eq.${slug}`;
  const { data: reviewRows } = await supabase.from("reviews").select("rating").or(orFilter);
  const ratings = (reviewRows ?? []) as { rating: number }[];
  if (ratings.length > 0) {
    store.rating =
      Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10;
    store.reviewsCount = ratings.length;
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
  if (!data || data.length === 0) return [];
  const categoryTree = await getCategoryTree();
  return (data as ListingRow[]).map((row) => mapListingRow(row, categoryTree));
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

/**
 * Notification rows are always created (see the triggers in 0002/0004),
 * but the recipient's per-category preferences (profiles.notify_*) decide
 * what actually shows up here — filtered on read, not skipped on write, so
 * a future admin activity view can still see everything.
 */
export async function getNotifications(userId: string): Promise<NotificationRow[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const [{ data, error }, { data: prefs }] = await Promise.all([
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("profiles")
      .select("notify_listings, notify_seller_requests, notify_followed_stores")
      .eq("id", userId)
      .maybeSingle(),
  ]);
  if (error || !data) return [];
  const rows = data as NotificationRow[];
  if (!prefs) return rows;

  return rows.filter((n) => {
    if (n.type === "listing_published") return prefs.notify_listings;
    if (n.type === "seller_request_approved" || n.type === "seller_request_rejected") {
      return prefs.notify_seller_requests;
    }
    if (n.type === "followed_store_listing") return prefs.notify_followed_stores;
    return true;
  });
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

/**
 * Store reviews: direct reviews of the tienda itself PLUS reviews left on
 * its published listings, newest first.
 */
export async function getReviewsForStore(
  tiendaSlug: string,
  listingSlugs: string[],
): Promise<(ReviewRow & { reviewerName: string })[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();

  let listingIds: string[] = [];
  if (listingSlugs.length > 0) {
    const { data: listingRows } = await supabase
      .from("listings")
      .select("id")
      .in("slug", listingSlugs);
    listingIds = (listingRows ?? []).map((r: { id: string }) => r.id);
  }

  const [{ data: storeReviews }, { data: listingReviews }] = await Promise.all([
    supabase
      .from("reviews")
      .select("*")
      .eq("tienda_slug", tiendaSlug)
      .order("created_at", { ascending: false })
      .limit(50),
    listingIds.length > 0
      ? supabase
          .from("reviews")
          .select("*")
          .in("listing_id", listingIds)
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] as ReviewRow[] }),
  ]);

  const rows = [...((storeReviews ?? []) as ReviewRow[]), ...((listingReviews ?? []) as ReviewRow[])]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 50);
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

/** Whether the user has a recorded WhatsApp contact for this listing/store. */
export async function hasContacted(
  userId: string,
  target: { listingSlug?: string; tiendaSlug?: string },
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const supabase = await createClient();
  let query = supabase
    .from("listing_contacts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (target.tiendaSlug) query = query.eq("tienda_slug", target.tiendaSlug);
  else if (target.listingSlug) query = query.eq("listing_slug", target.listingSlug);
  else return false;
  const { count } = await query;
  return (count ?? 0) > 0;
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

  const [{ data }, categoryTree] = await Promise.all([
    supabase.from("listings").select("*").in("slug", slugs),
    getCategoryTree(),
  ]);
  return ((data ?? []) as ListingRow[]).map((row) => mapListingRow(row, categoryTree));
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

/**
 * Public user profile: visible only while the user has ≥1 published listing
 * (content-driven privacy — no listings, no public page). Exposes name,
 * avatar, city, member-since and review aggregates; never email/phone.
 */
export async function getPublicUserProfile(userId: string): Promise<{
  profile: Profile;
  listings: Listing[];
  rating: number;
  reviewsCount: number;
} | null> {
  if (!isSupabaseConfigured) return null;
  // Only accept UUIDs — the route also serves legacy demo usernames.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) return null;

  const supabase = await createClient();
  const [{ data: profile }, { data: listingRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("listings")
      .select("*")
      .eq("seller_id", userId)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  const rows = (listingRows ?? []) as ListingRow[];
  if (!profile || (profile as Profile).blocked_at || rows.length === 0) return null;

  const [{ data: reviewRows }, categoryTree] = await Promise.all([
    supabase.from("reviews").select("rating").in("listing_id", rows.map((r) => r.id)),
    getCategoryTree(),
  ]);
  const ratings = (reviewRows ?? []) as { rating: number }[];

  return {
    profile: profile as Profile,
    listings: rows.map((row) => mapListingRow(row, categoryTree)),
    rating:
      ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10
        : 0,
    reviewsCount: ratings.length,
  };
}

export async function getFollowCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  const supabase = await createClient();
  const { count } = await supabase
    .from("store_follows")
    .select("id", { count: "exact", head: true })
    .eq("follower_id", userId);
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

  const [{ data }, blockedIds] = await Promise.all([
    supabase.from("tiendas").select("*").in("slug", slugs),
    getBlockedSellerIds(supabase),
  ]);
  const tiendas = ((data ?? []) as TiendaRow[]).filter((t) => !blockedIds.has(t.owner_id));
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

  const categoryTree = await getCategoryTree();
  return tiendas.map((t) => mapTiendaRow(t, categoryTree, slugsByOwner.get(t.owner_id) ?? []));
}
