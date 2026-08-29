import { QueryClient } from "@tanstack/react-query";

/** Single app-wide query client. Data stays fresh ~1min; cached ~30min. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 30 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const qk = {
  listings: ["listings"] as const,
  listing: (slug: string) => ["listing", slug] as const,
  ownListings: (userId: string) => ["ownListings", userId] as const,
  stores: ["stores"] as const,
  store: (slug: string) => ["store", slug] as const,
  storeListings: (ownerId: string) => ["storeListings", ownerId] as const,
  ownTienda: (userId: string) => ["ownTienda", userId] as const,
  profile: (userId: string) => ["profile", userId] as const,
  favoriteSlugs: (userId: string) => ["favoriteSlugs", userId] as const,
  favoriteListings: (userId: string) => ["favoriteListings", userId] as const,
  followedSlugs: (userId: string) => ["followedSlugs", userId] as const,
  reviewsListing: (listingId: string) => ["reviews", "listing", listingId] as const,
  reviewsStore: (slug: string) => ["reviews", "store", slug] as const,
  savedSearches: (userId: string) => ["savedSearches", userId] as const,
  notifications: (userId: string) => ["notifications", userId] as const,
  unread: (userId: string) => ["unread", userId] as const,
  storeRating: (slug: string) => ["storeRating", slug] as const,
};
