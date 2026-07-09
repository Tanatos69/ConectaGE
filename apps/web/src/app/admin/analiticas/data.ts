import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { categories } from "@/lib/categories";
import { ageFromBirthDate } from "@/lib/time";
import type { EventRow, Profile } from "@/lib/supabase/types";

/**
 * Shared aggregation layer for /admin/analiticas (page) and its CSV export
 * route, so the file you download always matches the charts on screen.
 * Reads use the service-role client: the events table has no client RLS
 * policies at all, and these run only behind the admin gate.
 */

export interface AnalyticsFilters {
  from: Date;
  to: Date;
  category?: string;
  city?: string;
  eventType?: string;
}

export interface DayCount {
  date: string; // "12 jun"
  value: number;
}

export interface LabelCount {
  label: string;
  value: number;
}

export interface AnalyticsData {
  filters: AnalyticsFilters;
  totalUsers: number;
  signupsPerDay: DayCount[];
  listingsByStatus: LabelCount[];
  listingCities: LabelCount[];
  listingCategories: LabelCount[];
  visitsPerDay: DayCount[];
  waClicksPerDay: DayCount[];
  totalVisits: number;
  totalWaClicks: number;
  totalSearches: number;
  topSearchTerms: LabelCount[];
  searchesByCategory: LabelCount[];
  deviceSplit: LabelCount[];
  genderBreakdown: LabelCount[];
  ageBreakdown: LabelCount[];
  topListingsByViews: { title: string; category: string; views: number; slug: string }[];
  storesByListings: { name: string; slug: string; category: string; listings: number }[];
}

const GENDER_LABELS: Record<string, string> = {
  male: "Hombre",
  female: "Mujer",
  other: "Otro",
  prefer_not_to_say: "Prefiere no indicarlo",
};

function categoryName(slug: string | null): string {
  if (!slug) return "—";
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

function ageBucket(age: number | null): string | null {
  if (age == null) return null;
  if (age < 18) return "16-17";
  if (age <= 24) return "18-24";
  if (age <= 34) return "25-34";
  if (age <= 44) return "35-44";
  if (age <= 54) return "45-54";
  return "55+";
}

/** Parse the page/export searchParams into validated filters. */
export function parseFilters(params: {
  desde?: string;
  hasta?: string;
  cat?: string;
  ciudad?: string;
  evento?: string;
}): AnalyticsFilters {
  const to = params.hasta ? new Date(`${params.hasta}T23:59:59`) : new Date();
  const defaultFrom = new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);
  let from = params.desde ? new Date(`${params.desde}T00:00:00`) : defaultFrom;
  if (isNaN(from.getTime())) from = defaultFrom;
  const safeTo = isNaN(to.getTime()) ? new Date() : to;
  return {
    from: from > safeTo ? defaultFrom : from,
    to: safeTo,
    category: params.cat || undefined,
    city: params.ciudad || undefined,
    eventType: ["search", "view_listing", "whatsapp_click"].includes(params.evento ?? "")
      ? params.evento
      : undefined,
  };
}

function dayLabel(d: Date): string {
  return d
    .toLocaleDateString("es-ES", { day: "numeric", month: "short" })
    .replace(".", "");
}

/** Per-day buckets between from/to (inclusive), zero-filled. */
function bucketPerDay(rows: { created_at: string }[], from: Date, to: Date): DayCount[] {
  const buckets = new Map<string, number>();
  const labels: string[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  // Cap chart resolution at ~120 bars to keep the DOM sane on long ranges.
  const dayMs = 24 * 60 * 60 * 1000;
  const totalDays = Math.min(120, Math.ceil((to.getTime() - cursor.getTime()) / dayMs) + 1);
  for (let i = 0; i < totalDays; i++) {
    const label = dayLabel(new Date(cursor.getTime() + i * dayMs));
    labels.push(label);
    buckets.set(label, 0);
  }
  for (const row of rows) {
    const label = dayLabel(new Date(row.created_at));
    if (buckets.has(label)) buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }
  return labels.map((date) => ({ date, value: buckets.get(date) ?? 0 }));
}

function countBy<T>(rows: T[], key: (row: T) => string | null, top = 10): LabelCount[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const k = key(row);
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, top);
}

export async function getAnalytics(filters: AnalyticsFilters): Promise<AnalyticsData | null> {
  if (!isSupabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const admin = createAdminClient();

  let eventsQuery = admin
    .from("events")
    .select("event_type, query, category_slug, city, listing_slug, device, created_at")
    .gte("created_at", filters.from.toISOString())
    .lte("created_at", filters.to.toISOString())
    .order("created_at", { ascending: true })
    .limit(20000);
  if (filters.category) eventsQuery = eventsQuery.eq("category_slug", filters.category);
  if (filters.city) eventsQuery = eventsQuery.eq("city", filters.city);
  if (filters.eventType) eventsQuery = eventsQuery.eq("event_type", filters.eventType);

  let listingsQuery = admin
    .from("listings")
    .select("title, slug, status, category_slug, city, views_count, seller_id");
  if (filters.category) listingsQuery = listingsQuery.eq("category_slug", filters.category);
  if (filters.city) listingsQuery = listingsQuery.eq("city", filters.city);

  const [{ data: eventRows }, { data: listingRows }, { data: profileRows }, { data: tiendaRows }] =
    await Promise.all([
      eventsQuery,
      listingsQuery,
      admin.from("profiles").select("created_at, gender, birth_date"),
      admin.from("tiendas").select("name, slug, category_slug, owner_id"),
    ]);

  const events = (eventRows ?? []) as Pick<
    EventRow,
    "event_type" | "query" | "category_slug" | "city" | "listing_slug" | "device" | "created_at"
  >[];
  const listings = (listingRows ?? []) as {
    title: string;
    slug: string;
    status: string;
    category_slug: string;
    city: string;
    views_count: number;
    seller_id: string;
  }[];
  const profiles = (profileRows ?? []) as Pick<Profile, "created_at" | "gender" | "birth_date">[];
  const tiendas = (tiendaRows ?? []) as {
    name: string;
    slug: string;
    category_slug: string;
    owner_id: string;
  }[];

  const views = events.filter((e) => e.event_type === "view_listing");
  const waClicks = events.filter((e) => e.event_type === "whatsapp_click");
  const searches = events.filter((e) => e.event_type === "search");

  const signupsInRange = profiles.filter((p) => {
    const t = new Date(p.created_at).getTime();
    return t >= filters.from.getTime() && t <= filters.to.getTime();
  });

  const listingCountBySeller = new Map<string, number>();
  for (const l of listings) {
    if (l.status !== "published") continue;
    listingCountBySeller.set(l.seller_id, (listingCountBySeller.get(l.seller_id) ?? 0) + 1);
  }

  return {
    filters,
    totalUsers: profiles.length,
    signupsPerDay: bucketPerDay(signupsInRange, filters.from, filters.to),
    listingsByStatus: countBy(listings, (l) => l.status, 4),
    listingCities: countBy(
      listings.filter((l) => l.status === "published"),
      (l) => l.city,
    ),
    listingCategories: countBy(
      listings.filter((l) => l.status === "published"),
      (l) => categoryName(l.category_slug),
    ),
    visitsPerDay: bucketPerDay(views, filters.from, filters.to),
    waClicksPerDay: bucketPerDay(waClicks, filters.from, filters.to),
    totalVisits: views.length,
    totalWaClicks: waClicks.length,
    totalSearches: searches.length,
    topSearchTerms: countBy(searches, (e) => e.query?.toLowerCase() ?? null),
    searchesByCategory: countBy(searches, (e) => categoryName(e.category_slug)),
    deviceSplit: countBy(events, (e) =>
      e.device === "mobile" ? "Móvil" : e.device === "desktop" ? "Escritorio" : null,
    ),
    genderBreakdown: countBy(profiles, (p) => (p.gender ? GENDER_LABELS[p.gender] : null), 5),
    // Ages are stored as birth dates and bucketed at read time.
    ageBreakdown: countBy(profiles, (p) => ageBucket(ageFromBirthDate(p.birth_date)), 6).sort(
      (a, b) => a.label.localeCompare(b.label),
    ),
    topListingsByViews: listings
      .filter((l) => l.status === "published" && l.views_count > 0)
      .sort((a, b) => b.views_count - a.views_count)
      .slice(0, 10)
      .map((l) => ({
        title: l.title,
        category: categoryName(l.category_slug),
        views: l.views_count,
        slug: l.slug,
      })),
    storesByListings: tiendas
      .map((t) => ({
        name: t.name,
        slug: t.slug,
        category: categoryName(t.category_slug),
        listings: listingCountBySeller.get(t.owner_id) ?? 0,
      }))
      .sort((a, b) => b.listings - a.listings)
      .slice(0, 10),
  };
}
