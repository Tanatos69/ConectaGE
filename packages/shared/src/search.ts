import type { ListingRow } from "./types";

/**
 * A set of search filters — persisted as jsonb in the `saved_searches` table
 * (same shape the web app uses, so a search saved on either platform is
 * portable). Mobile filters listings in-memory with matchesCriteria (tens of
 * users / hundreds of listings — see the note in web's queries.ts).
 */
export interface SearchCriteria {
  q?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  listingType?: "offer" | "wanted";
  sort?: "recent" | "price_asc" | "price_desc";
}

/** Does a single listing row satisfy the criteria? */
export function matchesCriteria(l: ListingRow, c: SearchCriteria): boolean {
  const q = c.q?.toLowerCase().trim();
  if (
    q &&
    !(
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q)
    )
  )
    return false;

  if (c.category && l.category_slug !== c.category) return false;
  if (c.subcategory && l.subcategory_slug !== c.subcategory) return false;
  if (c.city && c.city !== "Todas" && l.city !== c.city) return false;
  if (c.condition && l.condition !== c.condition) return false;
  if (c.listingType && (l.listing_type ?? "offer") !== c.listingType) return false;
  if (c.minPrice != null && l.price != null && l.price < c.minPrice) return false;
  if (c.maxPrice != null && l.price != null && l.price > c.maxPrice) return false;

  return true;
}

/** Filter + sort a list of rows against a set of criteria. */
export function filterListings(listings: ListingRow[], c: SearchCriteria): ListingRow[] {
  const filtered = listings.filter((l) => matchesCriteria(l, c));
  switch (c.sort) {
    case "price_asc":
      return [...filtered].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    case "price_desc":
      return [...filtered].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    default:
      return [...filtered].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

/** True when the criteria narrow the result set at all (vs. "all listings"). */
export function hasActiveFilters(c: SearchCriteria): boolean {
  return Boolean(
    c.q ||
      c.category ||
      c.subcategory ||
      (c.city && c.city !== "Todas") ||
      c.condition ||
      c.listingType ||
      c.minPrice != null ||
      c.maxPrice != null,
  );
}

/** How many filters (excluding the free-text query) are active — for a badge. */
export function activeFilterCount(c: SearchCriteria): number {
  let n = 0;
  if (c.category) n++;
  if (c.subcategory) n++;
  if (c.city && c.city !== "Todas") n++;
  if (c.condition) n++;
  if (c.listingType) n++;
  if (c.minPrice != null || c.maxPrice != null) n++;
  return n;
}
