import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Profile, ListingRow, ReportRow, ReviewRow, TiendaRow } from "@/lib/supabase/types";

/**
 * Service-role reads for the admin section (bypasses RLS — every page using
 * this lives behind the middleware + admin-layout role checks).
 */

function ready(): boolean {
  return isSupabaseConfigured && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export interface AdminBadges {
  pendingSellerRequests: number;
  pendingReports: number;
}

export async function getAdminBadges(): Promise<AdminBadges> {
  if (!ready()) return { pendingSellerRequests: 0, pendingReports: 0 };
  const admin = createAdminClient();
  const [requests, reports] = await Promise.all([
    admin
      .from("seller_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return {
    pendingSellerRequests: requests.count ?? 0,
    pendingReports: reports.count ?? 0,
  };
}

export interface AdminOverview {
  totalUsers: number;
  newUsersThisWeek: number;
  publishedListings: number;
  totalListings: number;
  totalStores: number;
  pendingSellerRequests: number;
  pendingReports: number;
  totalReviews: number;
  visitsThisWeek: number;
  waClicksThisWeek: number;
  latestUsers: Pick<Profile, "id" | "full_name" | "email" | "role" | "created_at">[];
  latestListings: Pick<ListingRow, "id" | "slug" | "title" | "status" | "created_at">[];
}

export async function getAdminOverview(): Promise<AdminOverview | null> {
  if (!ready()) return null;
  const admin = createAdminClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const [
    users,
    newUsers,
    published,
    allListings,
    stores,
    requests,
    reports,
    reviews,
    visits,
    waClicks,
    latestUsers,
    latestListings,
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    admin
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    admin.from("listings").select("id", { count: "exact", head: true }),
    admin.from("tiendas").select("id", { count: "exact", head: true }),
    admin
      .from("seller_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("reviews").select("id", { count: "exact", head: true }),
    admin
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "view_listing")
      .gte("created_at", weekAgo),
    admin
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "whatsapp_click")
      .gte("created_at", weekAgo),
    admin
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("listings")
      .select("id, slug, title, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    totalUsers: users.count ?? 0,
    newUsersThisWeek: newUsers.count ?? 0,
    publishedListings: published.count ?? 0,
    totalListings: allListings.count ?? 0,
    totalStores: stores.count ?? 0,
    pendingSellerRequests: requests.count ?? 0,
    pendingReports: reports.count ?? 0,
    totalReviews: reviews.count ?? 0,
    visitsThisWeek: visits.count ?? 0,
    waClicksThisWeek: waClicks.count ?? 0,
    latestUsers: (latestUsers.data ?? []) as AdminOverview["latestUsers"],
    latestListings: (latestListings.data ?? []) as AdminOverview["latestListings"],
  };
}

export interface AdminUserRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  role: Profile["role"];
  created_at: string;
  listingsCount: number;
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  if (!ready()) return [];
  const admin = createAdminClient();
  const [{ data: profiles }, { data: listings }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, email, phone, city, role, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    admin.from("listings").select("seller_id"),
  ]);

  const countBySeller = new Map<string, number>();
  for (const l of (listings ?? []) as { seller_id: string }[]) {
    countBySeller.set(l.seller_id, (countBySeller.get(l.seller_id) ?? 0) + 1);
  }

  return ((profiles ?? []) as Omit<AdminUserRow, "listingsCount">[]).map((p) => ({
    ...p,
    listingsCount: countBySeller.get(p.id) ?? 0,
  }));
}

export interface AdminListingRow {
  id: string;
  slug: string;
  title: string;
  status: ListingRow["status"];
  city: string;
  category_slug: string;
  price: number | null;
  views_count: number;
  favorites_count: number;
  created_at: string;
  sellerName: string;
  sellerEmail: string;
}

export async function getAdminListings(): Promise<AdminListingRow[]> {
  if (!ready()) return [];
  const admin = createAdminClient();
  const { data: listings } = await admin
    .from("listings")
    .select(
      "id, slug, title, status, city, category_slug, price, views_count, favorites_count, created_at, seller_id",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (listings ?? []) as (Omit<AdminListingRow, "sellerName" | "sellerEmail"> & {
    seller_id: string;
  })[];
  if (rows.length === 0) return [];

  const { data: sellers } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", [...new Set(rows.map((r) => r.seller_id))]);
  const byId = new Map(
    ((sellers ?? []) as { id: string; full_name: string; email: string }[]).map((s) => [s.id, s]),
  );

  return rows.map((r) => ({
    ...r,
    sellerName: byId.get(r.seller_id)?.full_name || "—",
    sellerEmail: byId.get(r.seller_id)?.email || "—",
  }));
}

export interface AdminReviewRow extends ReviewRow {
  reviewerName: string;
  reviewerEmail: string;
  targetLabel: string;
  targetHref: string;
}

export async function getAdminReviews(): Promise<AdminReviewRow[]> {
  if (!ready()) return [];
  const admin = createAdminClient();
  const { data: reviews } = await admin
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (reviews ?? []) as ReviewRow[];
  if (rows.length === 0) return [];

  const listingIds = [...new Set(rows.map((r) => r.listing_id).filter(Boolean))] as string[];
  const [{ data: reviewers }, { data: listings }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", [...new Set(rows.map((r) => r.reviewer_id))]),
    listingIds.length > 0
      ? admin.from("listings").select("id, title, slug").in("id", listingIds)
      : Promise.resolve({ data: [] }),
  ]);

  const reviewerById = new Map(
    ((reviewers ?? []) as { id: string; full_name: string; email: string }[]).map((p) => [p.id, p]),
  );
  const listingById = new Map(
    ((listings ?? []) as { id: string; title: string; slug: string }[]).map((l) => [l.id, l]),
  );

  return rows.map((r) => {
    const listing = r.listing_id ? listingById.get(r.listing_id) : undefined;
    return {
      ...r,
      reviewerName: reviewerById.get(r.reviewer_id)?.full_name || "—",
      reviewerEmail: reviewerById.get(r.reviewer_id)?.email || "—",
      targetLabel: listing ? `Anuncio: ${listing.title}` : `Tienda: ${r.tienda_slug}`,
      targetHref: listing ? `/anuncios/${listing.slug}` : `/tienda/${r.tienda_slug}`,
    };
  });
}

export interface AdminReportRow extends ReportRow {
  reporterName: string;
  reporterEmail: string;
  listingTitle: string;
}

export async function getAdminReports(): Promise<AdminReportRow[]> {
  if (!ready()) return [];
  const admin = createAdminClient();
  const { data: reports } = await admin
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (reports ?? []) as ReportRow[];
  if (rows.length === 0) return [];

  const [{ data: reporters }, { data: listings }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", [...new Set(rows.map((r) => r.reporter_id))]),
    admin
      .from("listings")
      .select("slug, title")
      .in("slug", [...new Set(rows.map((r) => r.listing_slug))]),
  ]);

  const reporterById = new Map(
    ((reporters ?? []) as { id: string; full_name: string; email: string }[]).map((p) => [p.id, p]),
  );
  const titleBySlug = new Map(
    ((listings ?? []) as { slug: string; title: string }[]).map((l) => [l.slug, l.title]),
  );

  return rows.map((r) => ({
    ...r,
    reporterName: reporterById.get(r.reporter_id)?.full_name || "—",
    reporterEmail: reporterById.get(r.reporter_id)?.email || "—",
    listingTitle: titleBySlug.get(r.listing_slug) || r.listing_slug,
  }));
}

export type { TiendaRow };
