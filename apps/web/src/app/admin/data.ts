import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  Profile,
  ListingRow,
  ReportRow,
  ReviewRow,
  TiendaRow,
  FeaturedRequestRow,
  Gender,
} from "@/lib/supabase/types";

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
  /** Users registered since this admin last opened /admin/usuarios. */
  newUsers: number;
  /** Listings created since this admin last opened /admin/anuncios. */
  newListings: number;
}

const EMPTY_BADGES: AdminBadges = {
  pendingSellerRequests: 0,
  pendingReports: 0,
  newUsers: 0,
  newListings: 0,
};

/**
 * "New since last visit" counts for sections with no pending/status field to
 * key off (see admin_view_state, migration 0017). Never having visited a
 * section yet reads as 0, not "every row ever" — the badge only starts
 * counting once the admin has actually looked at the page for the first
 * time, which markAdminSectionSeenAction records on mount.
 */
async function countNewSince(
  admin: ReturnType<typeof createAdminClient>,
  adminId: string,
  section: "users" | "listings",
  table: "profiles" | "listings",
): Promise<number> {
  const { data: state } = await admin
    .from("admin_view_state")
    .select("last_seen_at")
    .eq("admin_id", adminId)
    .eq("section", section)
    .maybeSingle();
  if (!state) return 0;

  const { count } = await admin
    .from(table)
    .select("id", { count: "exact", head: true })
    .gt("created_at", state.last_seen_at);
  return count ?? 0;
}

export async function getAdminBadges(adminId: string): Promise<AdminBadges> {
  if (!ready()) return EMPTY_BADGES;
  const admin = createAdminClient();
  const [requests, reports, newUsers, newListings] = await Promise.all([
    admin
      .from("seller_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    countNewSince(admin, adminId, "users", "profiles"),
    countNewSince(admin, adminId, "listings", "listings"),
  ]);
  return {
    pendingSellerRequests: requests.count ?? 0,
    pendingReports: reports.count ?? 0,
    newUsers,
    newListings,
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
  gender: Gender | null;
  /** ISO date (yyyy-mm-dd); age is derived at read time, never stored. */
  birth_date: string | null;
  blocked_at: string | null;
  blocked_reason: string | null;
  created_at: string;
  listingsCount: number;
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  if (!ready()) return [];
  const admin = createAdminClient();
  const [{ data: profiles }, { data: listings }] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, full_name, email, phone, city, role, gender, birth_date, blocked_at, blocked_reason, created_at",
      )
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

export interface AdminUserDetail {
  profile: Profile;
  listings: Pick<ListingRow, "id" | "slug" | "title" | "status" | "created_at" | "views_count">[];
  tienda: Pick<TiendaRow, "id" | "slug" | "name" | "verified"> | null;
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  if (!ready()) return null;
  const admin = createAdminClient();
  const [{ data: profile }, { data: listings }, { data: tienda }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    admin
      .from("listings")
      .select("id, slug, title, status, created_at, views_count")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false }),
    admin.from("tiendas").select("id, slug, name, verified").eq("owner_id", userId).maybeSingle(),
  ]);
  if (!profile) return null;

  return {
    profile: profile as Profile,
    listings: (listings ?? []) as AdminUserDetail["listings"],
    tienda: (tienda as AdminUserDetail["tienda"]) ?? null,
  };
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

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export interface AdminModerationListing {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  city: string;
  category_slug: string;
  images: string[];
  created_at: string;
  /** 'pending' rows are the pre-publish queue and sort first. */
  status: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerMemberSince: string;
  /** Same seller's other published listings with a near-identical title. */
  duplicateCount: number;
  pendingReportCount: number;
}

/**
 * Moderation queue: pending listings (pre-publish gate, when the
 * moderation settings route them here) sort first, followed by the 100 most
 * recent published listings as a post-publish spot-check. Duplicate
 * detection is a simple normalized-title match across a seller's own
 * published listings — no ML/scoring, just a signal to look twice.
 */
export async function getAdminModerationListings(): Promise<AdminModerationListing[]> {
  if (!ready()) return [];
  const admin = createAdminClient();
  const [{ data: pendingListings }, { data: publishedListings }, { data: allTitles }, { data: pendingReports }] = await Promise.all([
    admin
      .from("listings")
      .select("id, slug, title, description, price, city, category_slug, images, created_at, seller_id, status")
      .eq("status", "pending")
      .order("created_at", { ascending: true }), // oldest waiting first
    admin
      .from("listings")
      .select("id, slug, title, description, price, city, category_slug, images, created_at, seller_id, status")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(100),
    // Lightweight full scan (title only) so duplicate counts aren't limited
    // to whatever fits in the page above — this app's whole scale is small.
    admin.from("listings").select("seller_id, title").eq("status", "published"),
    admin.from("reports").select("listing_slug").eq("status", "pending"),
  ]);

  const rows = [...(pendingListings ?? []), ...(publishedListings ?? [])] as {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number | null;
    city: string;
    category_slug: string;
    images: string[];
    created_at: string;
    seller_id: string;
    status: string;
  }[];
  if (rows.length === 0) return [];

  const sellerIds = [...new Set(rows.map((r) => r.seller_id))];
  const { data: sellers } = await admin
    .from("profiles")
    .select("id, full_name, email, created_at")
    .in("id", sellerIds);
  const sellerById = new Map(
    (
      (sellers ?? []) as { id: string; full_name: string; email: string; created_at: string }[]
    ).map((s) => [s.id, s]),
  );

  const reportCountBySlug = new Map<string, number>();
  for (const r of (pendingReports ?? []) as { listing_slug: string }[]) {
    reportCountBySlug.set(r.listing_slug, (reportCountBySlug.get(r.listing_slug) ?? 0) + 1);
  }

  const titlesBySeller = new Map<string, string[]>();
  for (const r of (allTitles ?? []) as { seller_id: string; title: string }[]) {
    const list = titlesBySeller.get(r.seller_id) ?? [];
    list.push(normalizeTitle(r.title));
    titlesBySeller.set(r.seller_id, list);
  }

  return rows.map((r) => {
    const seller = sellerById.get(r.seller_id);
    const normalized = normalizeTitle(r.title);
    const sellerTitles = titlesBySeller.get(r.seller_id) ?? [];
    const matches = sellerTitles.filter((t) => t === normalized).length;
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      price: r.price,
      city: r.city,
      category_slug: r.category_slug,
      images: r.images,
      created_at: r.created_at,
      status: r.status,
      sellerId: r.seller_id,
      sellerName: seller?.full_name || "—",
      sellerEmail: seller?.email || "—",
      sellerMemberSince: seller?.created_at || r.created_at,
      duplicateCount: Math.max(0, matches - 1),
      pendingReportCount: reportCountBySlug.get(r.slug) ?? 0,
    };
  });
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
  listingId: string | null;
  listingTitle: string;
  sellerId: string | null;
  sellerName: string;
  sellerEmail: string;
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
      .select("id, slug, title, seller_id")
      .in("slug", [...new Set(rows.map((r) => r.listing_slug))]),
  ]);

  const reporterById = new Map(
    ((reporters ?? []) as { id: string; full_name: string; email: string }[]).map((p) => [p.id, p]),
  );
  const listingBySlug = new Map(
    (
      (listings ?? []) as { id: string; slug: string; title: string; seller_id: string }[]
    ).map((l) => [l.slug, l]),
  );

  const sellerIds = [...new Set(Array.from(listingBySlug.values()).map((l) => l.seller_id))];
  const { data: sellers } =
    sellerIds.length > 0
      ? await admin.from("profiles").select("id, full_name, email").in("id", sellerIds)
      : { data: [] };
  const sellerById = new Map(
    ((sellers ?? []) as { id: string; full_name: string; email: string }[]).map((p) => [p.id, p]),
  );

  return rows.map((r) => {
    const listing = listingBySlug.get(r.listing_slug);
    const seller = listing ? sellerById.get(listing.seller_id) : undefined;
    return {
      ...r,
      reporterName: reporterById.get(r.reporter_id)?.full_name || "—",
      reporterEmail: reporterById.get(r.reporter_id)?.email || "—",
      listingId: listing?.id ?? null,
      listingTitle: listing?.title || r.listing_slug,
      sellerId: listing?.seller_id ?? null,
      sellerName: seller?.full_name || "—",
      sellerEmail: seller?.email || "—",
    };
  });
}

export interface AdminTiendaRow {
  id: string;
  slug: string;
  name: string;
  city: string;
  category_slug: string;
  verified: boolean;
  followers_count: number;
  created_at: string;
  suspended_at: string | null;
  suspended_reason: string | null;
  whatsapp: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  listingsCount: number;
}

export async function getAdminTiendas(): Promise<AdminTiendaRow[]> {
  if (!ready()) return [];
  const admin = createAdminClient();
  const [{ data: tiendas }, { data: listings }] = await Promise.all([
    admin
      .from("tiendas")
      .select(
        "id, slug, name, city, category_slug, verified, followers_count, created_at, owner_id, suspended_at, suspended_reason, whatsapp",
      )
      .order("created_at", { ascending: false }),
    admin.from("listings").select("seller_id"),
  ]);
  const rows = (tiendas ?? []) as {
    id: string;
    slug: string;
    name: string;
    city: string;
    category_slug: string;
    verified: boolean;
    followers_count: number;
    created_at: string;
    owner_id: string;
    suspended_at: string | null;
    suspended_reason: string | null;
    whatsapp: string;
  }[];
  if (rows.length === 0) return [];

  const countBySeller = new Map<string, number>();
  for (const l of (listings ?? []) as { seller_id: string }[]) {
    countBySeller.set(l.seller_id, (countBySeller.get(l.seller_id) ?? 0) + 1);
  }

  const { data: owners } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", [...new Set(rows.map((r) => r.owner_id))]);
  const ownerById = new Map(
    ((owners ?? []) as { id: string; full_name: string; email: string }[]).map((o) => [o.id, o]),
  );

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    city: r.city,
    category_slug: r.category_slug,
    verified: r.verified,
    followers_count: r.followers_count,
    created_at: r.created_at,
    suspended_at: r.suspended_at,
    suspended_reason: r.suspended_reason,
    whatsapp: r.whatsapp,
    ownerId: r.owner_id,
    ownerName: ownerById.get(r.owner_id)?.full_name || "—",
    ownerEmail: ownerById.get(r.owner_id)?.email || "—",
    listingsCount: countBySeller.get(r.owner_id) ?? 0,
  }));
}

export interface AdminCategoryNode {
  id: string;
  slug: string;
  parentId: string | null;
  name: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

/** Unlike the public getCategoryTree(), this includes inactive rows too so
 * an admin can find and re-enable something they previously hid. */
export async function getAdminCategoryTree(): Promise<AdminCategoryNode[]> {
  if (!ready()) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("categories")
    .select("id, slug, parent_id, name, icon, sort_order, is_active")
    .order("sort_order", { ascending: true });

  return (
    (data ?? []) as {
      id: string;
      slug: string;
      parent_id: string | null;
      name: string;
      icon: string | null;
      sort_order: number;
      is_active: boolean;
    }[]
  ).map((r) => ({
    id: r.id,
    slug: r.slug,
    parentId: r.parent_id,
    name: r.name,
    icon: r.icon,
    sortOrder: r.sort_order,
    isActive: r.is_active,
  }));
}

export interface AdminAuditEntry {
  id: string;
  action: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
  adminName: string;
}

/** Audit trail for one user (blocks, role changes, notes…), newest first. */
export async function getUserAuditEntries(userId: string): Promise<AdminAuditEntry[]> {
  if (!ready()) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_audit_log")
    .select("id, admin_id, action, meta, created_at")
    .eq("target_type", "user")
    .eq("target_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  const rows = (data ?? []) as {
    id: string;
    admin_id: string;
    action: string;
    meta: Record<string, unknown> | null;
    created_at: string;
  }[];
  if (rows.length === 0) return [];

  const adminIds = [...new Set(rows.map((r) => r.admin_id))];
  const { data: admins } = await admin.from("profiles").select("id, full_name").in("id", adminIds);
  const nameById = new Map(
    ((admins ?? []) as { id: string; full_name: string }[]).map((a) => [a.id, a.full_name]),
  );

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    meta: r.meta,
    createdAt: r.created_at,
    adminName: nameById.get(r.admin_id) || "—",
  }));
}

export interface AdminLocationNode {
  id: string;
  slug: string;
  parentId: string | null;
  name: string;
  type: "province" | "city";
  sortOrder: number;
  isActive: boolean;
}

/** Unlike the public getLocationTree(), this includes inactive rows too so
 * an admin can find and re-enable a city they previously hid. */
export async function getAdminLocationTree(): Promise<AdminLocationNode[]> {
  if (!ready()) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("locations")
    .select("id, slug, parent_id, name, type, sort_order, is_active")
    .order("sort_order", { ascending: true });

  return (
    (data ?? []) as {
      id: string;
      slug: string;
      parent_id: string | null;
      name: string;
      type: "province" | "city";
      sort_order: number;
      is_active: boolean;
    }[]
  ).map((r) => ({
    id: r.id,
    slug: r.slug,
    parentId: r.parent_id,
    name: r.name,
    type: r.type,
    sortOrder: r.sort_order,
    isActive: r.is_active,
  }));
}

export interface AdminFeaturedRequestRow extends FeaturedRequestRow {
  listingSlug: string;
  listingTitle: string;
  sellerName: string;
  sellerEmail: string;
}

export async function getAdminFeaturedRequests(): Promise<AdminFeaturedRequestRow[]> {
  if (!ready()) return [];
  const admin = createAdminClient();
  const { data: requests } = await admin
    .from("featured_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (requests ?? []) as FeaturedRequestRow[];
  if (rows.length === 0) return [];

  const [{ data: listings }, { data: users }] = await Promise.all([
    admin
      .from("listings")
      .select("id, slug, title")
      .in("id", [...new Set(rows.map((r) => r.listing_id))]),
    admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", [...new Set(rows.map((r) => r.user_id))]),
  ]);
  const listingById = new Map(
    ((listings ?? []) as { id: string; slug: string; title: string }[]).map((l) => [l.id, l]),
  );
  const userById = new Map(
    ((users ?? []) as { id: string; full_name: string; email: string }[]).map((u) => [u.id, u]),
  );

  return rows.map((r) => {
    const listing = listingById.get(r.listing_id);
    const user = userById.get(r.user_id);
    return {
      ...r,
      listingSlug: listing?.slug ?? "",
      listingTitle: listing?.title ?? "—",
      sellerName: user?.full_name || "—",
      sellerEmail: user?.email || "—",
    };
  });
}

export type { TiendaRow };
