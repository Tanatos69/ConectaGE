import type {
  ListingRow,
  Profile,
  TiendaRow,
  ReviewRow,
  NotificationRow,
  SearchCriteria,
  SiteSettings,
} from "@gemarket/shared";
import { DEFAULT_SITE_SETTINGS } from "@gemarket/shared";
import { getSupabaseClient } from "./supabase/client";

/**
 * Full read + write data layer for the mobile app. The web app's equivalents
 * live in Next server actions/queries (apps/web/src/lib/**) which can't run in
 * React Native; these call Supabase directly with the user's RLS-scoped
 * session, so every write is owner-scoped by the same policies the web relies
 * on. Consumed through the react-query hooks in lib/hooks.ts.
 */

type ReviewWithName = ReviewRow & { reviewerName: string };

// ── Listings (reads) ─────────────────────────────────────────────────────────

export async function getPublishedListings(limit = 200): Promise<ListingRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as ListingRow[];
}

export async function getListingBySlug(
  slug: string,
): Promise<{ listing: ListingRow; seller: Profile | null } | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from("listings").select("*").eq("slug", slug).maybeSingle();
  if (!data) return null;
  const listing = data as ListingRow;
  const { data: seller } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", listing.seller_id)
    .maybeSingle();
  return { listing, seller: (seller as Profile | null) ?? null };
}

export async function getListingsByOwner(userId: string): Promise<ListingRow[]> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });
  return (data as ListingRow[] | null) ?? [];
}

export async function getListingById(id: string): Promise<ListingRow | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  return (data as ListingRow | null) ?? null;
}

export async function incrementListingViews(slug: string): Promise<void> {
  try {
    await getSupabaseClient().rpc("increment_listing_views", { listing_slug: slug });
  } catch {
    // View counting must never break the page.
  }
}

// ── Stores ───────────────────────────────────────────────────────────────────

export async function getStores(limit?: number): Promise<TiendaRow[]> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from("tiendas")
    .select("*")
    .is("suspended_at", null)
    .order("verified", { ascending: false })
    .order("followers_count", { ascending: false })
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return (data as TiendaRow[] | null) ?? [];
}

export async function getStoreBySlug(slug: string): Promise<TiendaRow | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from("tiendas").select("*").eq("slug", slug).maybeSingle();
  if (!data) return null;
  const row = data as TiendaRow;
  if (row.suspended_at) return null;
  return row;
}

export async function getStoreListings(ownerId: string): Promise<ListingRow[]> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", ownerId)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  return (data as ListingRow[] | null) ?? [];
}

export async function getTiendaByOwner(userId: string): Promise<TiendaRow | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from("tiendas").select("*").eq("owner_id", userId).maybeSingle();
  return (data as TiendaRow | null) ?? null;
}

/** Average rating + count across a store's direct reviews and its listings'. */
export async function getStoreRating(
  tiendaSlug: string,
  listingIds: string[],
): Promise<{ rating: number; count: number }> {
  const supabase = getSupabaseClient();
  const orFilter =
    listingIds.length > 0
      ? `tienda_slug.eq.${tiendaSlug},listing_id.in.(${listingIds.join(",")})`
      : `tienda_slug.eq.${tiendaSlug}`;
  const { data } = await supabase.from("reviews").select("rating").or(orFilter);
  const ratings = (data ?? []) as { rating: number }[];
  if (ratings.length === 0) return { rating: 0, count: 0 };
  return {
    rating: Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10,
    count: ratings.length,
  };
}

// ── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function updateProfile(userId: string, patch: Partial<Profile>): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw new Error(error.message);
}

// ── Favorites ────────────────────────────────────────────────────────────────

export async function getFavoriteSlugs(userId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("listing_favorites")
    .select("listing_slug")
    .eq("user_id", userId);
  return (data ?? []).map((r: { listing_slug: string }) => r.listing_slug);
}

export async function getFavoriteListings(userId: string): Promise<ListingRow[]> {
  const slugs = await getFavoriteSlugs(userId);
  if (slugs.length === 0) return [];
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .in("slug", slugs)
    .eq("status", "published");
  return (data as ListingRow[] | null) ?? [];
}

export async function setFavorite(userId: string, listingSlug: string, next: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  if (next) {
    const { error } = await supabase
      .from("listing_favorites")
      .upsert({ user_id: userId, listing_slug: listingSlug }, { onConflict: "user_id,listing_slug" });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("listing_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("listing_slug", listingSlug);
    if (error) throw new Error(error.message);
  }
}

// ── Follows ──────────────────────────────────────────────────────────────────

export async function getFollowedStoreSlugs(userId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from("store_follows").select("tienda_slug").eq("follower_id", userId);
  return (data ?? []).map((r: { tienda_slug: string }) => r.tienda_slug);
}

export async function setFollow(userId: string, tiendaSlug: string, next: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  if (next) {
    const { error } = await supabase
      .from("store_follows")
      .upsert({ follower_id: userId, tienda_slug: tiendaSlug }, { onConflict: "follower_id,tienda_slug" });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("store_follows")
      .delete()
      .eq("follower_id", userId)
      .eq("tienda_slug", tiendaSlug);
    if (error) throw new Error(error.message);
  }
}

// ── Reviews ──────────────────────────────────────────────────────────────────

async function attachReviewerNames(rows: ReviewRow[]): Promise<ReviewWithName[]> {
  if (rows.length === 0) return [];
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", rows.map((r) => r.reviewer_id));
  const nameById = new Map(
    ((data ?? []) as { id: string; full_name: string }[]).map((p) => [p.id, p.full_name]),
  );
  return rows.map((r) => ({ ...r, reviewerName: nameById.get(r.reviewer_id) || "Usuario" }));
}

export async function getReviewsForListing(listingId: string): Promise<ReviewWithName[]> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });
  return attachReviewerNames((data ?? []) as ReviewRow[]);
}

export async function getReviewsForStore(tiendaSlug: string, listingIds: string[]): Promise<ReviewWithName[]> {
  const supabase = getSupabaseClient();
  const orFilter =
    listingIds.length > 0
      ? `tienda_slug.eq.${tiendaSlug},listing_id.in.(${listingIds.join(",")})`
      : `tienda_slug.eq.${tiendaSlug}`;
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .or(orFilter)
    .order("created_at", { ascending: false })
    .limit(50);
  return attachReviewerNames((data ?? []) as ReviewRow[]);
}

export async function createReview(input: {
  reviewerId: string;
  listingId?: string;
  tiendaSlug?: string;
  rating: number;
  comment: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("reviews").insert({
    reviewer_id: input.reviewerId,
    listing_id: input.listingId ?? null,
    tienda_slug: input.tiendaSlug ?? null,
    rating: input.rating,
    comment: input.comment,
  });
  if (error) throw new Error(error.message);
}

// ── Saved searches ───────────────────────────────────────────────────────────

export interface SavedSearchRow {
  id: string;
  label: string;
  criteria: SearchCriteria;
  alerts: boolean;
  created_at: string;
}

export async function getSavedSearches(userId: string): Promise<SavedSearchRow[]> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("saved_searches")
    .select("id, label, criteria, alerts, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as SavedSearchRow[] | null) ?? [];
}

export async function createSavedSearch(input: {
  userId: string;
  label: string;
  criteria: SearchCriteria;
  alerts: boolean;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("saved_searches").insert({
    user_id: input.userId,
    label: input.label,
    criteria: input.criteria,
    alerts: input.alerts,
  });
  if (error) throw new Error(error.message);
}

export async function deleteSavedSearch(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("saved_searches").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setSavedSearchAlerts(id: string, alerts: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("saved_searches").update({ alerts }).eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<NotificationRow[]> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data as NotificationRow[] | null) ?? [];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = getSupabaseClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  return count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await getSupabaseClient().from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await getSupabaseClient()
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
}

// ── Contact tracking ─────────────────────────────────────────────────────────

export async function recordContact(
  userId: string,
  target: { listingSlug?: string; tiendaSlug?: string },
): Promise<void> {
  try {
    await getSupabaseClient().from("listing_contacts").insert({
      user_id: userId,
      listing_slug: target.listingSlug ?? null,
      tienda_slug: target.tiendaSlug ?? null,
    });
  } catch {
    // Contact logging is best-effort; never block the WhatsApp handoff.
  }
}

// ── Site settings (moderation rules) ─────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("site_settings")
      .select(
        "moderation_required, auto_approve_verified, min_account_age_days_to_skip_queue, keyword_blacklist, auto_flag_price_above, max_images_per_listing, max_listings_per_day",
      )
      .maybeSingle();
    if (!data) return DEFAULT_SITE_SETTINGS;
    return { ...DEFAULT_SITE_SETTINGS, ...(data as Partial<SiteSettings>) };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
