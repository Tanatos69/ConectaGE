import { createClient } from "./server";
import { isSupabaseConfigured } from "./config";
import type { ListingRow, TiendaRow, Profile } from "./types";
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

/** Spanish relative label for a timestamp, e.g. "Hace 2 horas". */
export function postedLabel(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.max(1, Math.floor(diffMs / 60_000));
  if (min < 60) return `Hace ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Hace ${days} día${days !== 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  return `Hace ${months} mes${months !== 1 ? "es" : ""}`;
}

/** "Enero 2025"-style label used by memberSince fields. */
export function monthYearLabel(iso: string): string {
  const label = new Date(iso).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
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
    followers: 0,
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
    .select("slug")
    .eq("seller_id", row.owner_id)
    .eq("status", "published");
  return mapTiendaRow(row, (rows ?? []).map((r: { slug: string }) => r.slug));
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
