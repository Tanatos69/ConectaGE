import type { ListingRow, Profile, TiendaRow } from "@conectage/shared";
import { getSupabaseClient } from "./supabase/client";

/**
 * Minimal read-only query set for the v1 browse screens — mirrors the shape
 * of apps/web/src/lib/supabase/queries.ts's getPublishedListings /
 * getListingWithDetail / getStoreBySlug, without the category-tree join or
 * blocked-seller filtering (dashboard/moderation parity is a follow-on
 * phase, see the plan).
 */

export async function getPublishedListings(limit = 50): Promise<ListingRow[]> {
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
  const { data, error } = await supabase.from("listings").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  const listing = data as ListingRow;

  const { data: seller } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", listing.seller_id)
    .maybeSingle();

  return { listing, seller: (seller as Profile | null) ?? null };
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
