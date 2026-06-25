import type { Listing } from "@/lib/listings";
import type { SearchCriteria } from "@/lib/store/app-state";

/**
 * Single source of truth for matching listings against a set of criteria.
 * Reused by /buscar, the category pages, and the saved-search "matching now"
 * counts. (`SearchCriteria` is a type-only import from the client store, so this
 * module stays usable from both server and client components.)
 */
export function filterListings(listings: Listing[], c: SearchCriteria): Listing[] {
  const q = c.q?.toLowerCase().trim();

  return listings.filter((l) => {
    if (
      q &&
      !(
        l.title.toLowerCase().includes(q) ||
        l.categoryName.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q)
      )
    )
      return false;

    if (c.category && l.categorySlug !== c.category) return false;
    if (c.city && c.city !== "Todas" && l.city !== c.city) return false;
    if (c.condition && l.condition !== c.condition) return false;
    if (c.listingType && (l.listingType ?? "offer") !== c.listingType) return false;
    if (c.minPrice != null && l.price != null && l.price < c.minPrice) return false;
    if (c.maxPrice != null && l.price != null && l.price > c.maxPrice) return false;

    return true;
  });
}

/** Human-readable summary of a saved search (Spanish), e.g. for the dashboard. */
export function describeCriteria(c: SearchCriteria): string {
  const parts: string[] = [];
  if (c.q) parts.push(`"${c.q}"`);
  if (c.listingType === "wanted") parts.push("Busco");
  if (c.category) parts.push(c.category);
  if (c.city && c.city !== "Todas") parts.push(c.city);
  return parts.length > 0 ? parts.join(" · ") : "Todos los anuncios";
}

/** Build the /buscar URL that reproduces a set of criteria. */
export function criteriaToSearchUrl(c: SearchCriteria): string {
  const params = new URLSearchParams();
  if (c.q) params.set("q", c.q);
  if (c.category) params.set("cat", c.category);
  if (c.city && c.city !== "Todas") params.set("ciudad", c.city);
  if (c.listingType) params.set("tipo", c.listingType);
  const qs = params.toString();
  return qs ? `/buscar?${qs}` : "/buscar";
}
