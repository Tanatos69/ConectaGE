import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile, SearchCriteria } from "@gemarket/shared";
import { isListingFeatured } from "@gemarket/shared";
import { qk } from "./query-client";
import * as q from "./queries";
import * as actions from "./listing-actions";

/**
 * react-query hooks over the data layer (lib/queries.ts + lib/listing-actions.ts).
 * Screens use these instead of ad-hoc useEffect fetches, so caching, refetch,
 * and optimistic favorite/follow toggles are handled in one place.
 */

// ── Listings ─────────────────────────────────────────────────────────────────

export function useListings() {
  return useQuery({ queryKey: qk.listings, queryFn: () => q.getPublishedListings() });
}

export function useFeaturedListings() {
  const query = useListings();
  const featured = useMemo(
    () => (query.data ?? []).filter(isListingFeatured).slice(0, 10),
    [query.data],
  );
  return { ...query, data: featured };
}

export function useListing(slug: string) {
  return useQuery({ queryKey: qk.listing(slug), queryFn: () => q.getListingBySlug(slug), enabled: !!slug });
}

export function useOwnListings(userId?: string) {
  return useQuery({
    queryKey: qk.ownListings(userId ?? ""),
    queryFn: () => q.getListingsByOwner(userId!),
    enabled: !!userId,
  });
}

// ── Stores ───────────────────────────────────────────────────────────────────

export function useStores() {
  return useQuery({ queryKey: qk.stores, queryFn: () => q.getStores() });
}

export function useStore(slug: string) {
  return useQuery({ queryKey: qk.store(slug), queryFn: () => q.getStoreBySlug(slug), enabled: !!slug });
}

export function useStoreListings(ownerId?: string) {
  return useQuery({
    queryKey: qk.storeListings(ownerId ?? ""),
    queryFn: () => q.getStoreListings(ownerId!),
    enabled: !!ownerId,
  });
}

export function useOwnTienda(userId?: string) {
  return useQuery({
    queryKey: qk.ownTienda(userId ?? ""),
    queryFn: () => q.getTiendaByOwner(userId!),
    enabled: !!userId,
  });
}

export function useStoreRating(slug: string, listingIds: string[]) {
  return useQuery({
    queryKey: [...qk.storeRating(slug), listingIds.length],
    queryFn: () => q.getStoreRating(slug, listingIds),
    enabled: !!slug,
  });
}

// ── Profile ──────────────────────────────────────────────────────────────────

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: qk.profile(userId ?? ""),
    queryFn: () => q.getProfile(userId!),
    enabled: !!userId,
  });
}

export function useUpdateProfile(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Profile>) => q.updateProfile(userId, patch),
    onSuccess: () => client.invalidateQueries({ queryKey: qk.profile(userId) }),
  });
}

// ── Favorites (optimistic) ───────────────────────────────────────────────────

export function useFavoriteSlugs(userId?: string) {
  return useQuery({
    queryKey: qk.favoriteSlugs(userId ?? ""),
    queryFn: () => q.getFavoriteSlugs(userId!),
    enabled: !!userId,
  });
}

export function useFavoriteListings(userId?: string) {
  return useQuery({
    queryKey: qk.favoriteListings(userId ?? ""),
    queryFn: () => q.getFavoriteListings(userId!),
    enabled: !!userId,
  });
}

/** Convenience combining favorite state + optimistic toggle for card grids. */
export function useFavorites(userId?: string) {
  const { data: slugs } = useFavoriteSlugs(userId);
  const toggle = useToggleFavorite(userId);
  const set = useMemo(() => new Set(slugs ?? []), [slugs]);
  return {
    enabled: !!userId,
    has: (slug: string) => set.has(slug),
    toggle: (slug: string) => toggle.mutate({ slug, next: !set.has(slug) }),
  };
}

export function useToggleFavorite(userId?: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, next }: { slug: string; next: boolean }) => q.setFavorite(userId!, slug, next),
    onMutate: async ({ slug, next }) => {
      if (!userId) return;
      const key = qk.favoriteSlugs(userId);
      await client.cancelQueries({ queryKey: key });
      const prev = client.getQueryData<string[]>(key) ?? [];
      client.setQueryData<string[]>(key, next ? [...prev, slug] : prev.filter((s) => s !== slug));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (userId && ctx?.prev) client.setQueryData(qk.favoriteSlugs(userId), ctx.prev);
    },
    onSettled: () => {
      if (!userId) return;
      client.invalidateQueries({ queryKey: qk.favoriteSlugs(userId) });
      client.invalidateQueries({ queryKey: qk.favoriteListings(userId) });
    },
  });
}

// ── Follows (optimistic) ─────────────────────────────────────────────────────

export function useFollowedSlugs(userId?: string) {
  return useQuery({
    queryKey: qk.followedSlugs(userId ?? ""),
    queryFn: () => q.getFollowedStoreSlugs(userId!),
    enabled: !!userId,
  });
}

export function useToggleFollow(userId?: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, next }: { slug: string; next: boolean }) => q.setFollow(userId!, slug, next),
    onMutate: async ({ slug, next }) => {
      if (!userId) return;
      const key = qk.followedSlugs(userId);
      await client.cancelQueries({ queryKey: key });
      const prev = client.getQueryData<string[]>(key) ?? [];
      client.setQueryData<string[]>(key, next ? [...prev, slug] : prev.filter((s) => s !== slug));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (userId && ctx?.prev) client.setQueryData(qk.followedSlugs(userId), ctx.prev);
    },
    onSettled: () => {
      if (userId) client.invalidateQueries({ queryKey: qk.followedSlugs(userId) });
    },
  });
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export function useReviewsForListing(listingId?: string) {
  return useQuery({
    queryKey: qk.reviewsListing(listingId ?? ""),
    queryFn: () => q.getReviewsForListing(listingId!),
    enabled: !!listingId,
  });
}

export function useReviewsForStore(slug: string, listingIds: string[]) {
  return useQuery({
    queryKey: [...qk.reviewsStore(slug), listingIds.length],
    queryFn: () => q.getReviewsForStore(slug, listingIds),
    enabled: !!slug,
  });
}

export function useCreateReview(invalidateKey: readonly unknown[]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: q.createReview,
    onSuccess: () => client.invalidateQueries({ queryKey: invalidateKey }),
  });
}

// ── Saved searches ───────────────────────────────────────────────────────────

export function useSavedSearches(userId?: string) {
  return useQuery({
    queryKey: qk.savedSearches(userId ?? ""),
    queryFn: () => q.getSavedSearches(userId!),
    enabled: !!userId,
  });
}

export function useCreateSavedSearch(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { label: string; criteria: SearchCriteria; alerts: boolean }) =>
      q.createSavedSearch({ userId, ...input }),
    onSuccess: () => client.invalidateQueries({ queryKey: qk.savedSearches(userId) }),
  });
}

export function useDeleteSavedSearch(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => q.deleteSavedSearch(id),
    onSuccess: () => client.invalidateQueries({ queryKey: qk.savedSearches(userId) }),
  });
}

export function useSetSavedSearchAlerts(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, alerts }: { id: string; alerts: boolean }) => q.setSavedSearchAlerts(id, alerts),
    onSuccess: () => client.invalidateQueries({ queryKey: qk.savedSearches(userId) }),
  });
}

// ── Notifications ────────────────────────────────────────────────────────────

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: qk.notifications(userId ?? ""),
    queryFn: () => q.getNotifications(userId!),
    enabled: !!userId,
  });
}

export function useUnreadCount(userId?: string) {
  return useQuery({
    queryKey: qk.unread(userId ?? ""),
    queryFn: () => q.getUnreadCount(userId!),
    enabled: !!userId,
    refetchInterval: 60_000,
  });
}

export function useMarkAllNotificationsRead(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => q.markAllNotificationsRead(userId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: qk.notifications(userId) });
      client.invalidateQueries({ queryKey: qk.unread(userId) });
    },
  });
}

// ── Listing mutations ────────────────────────────────────────────────────────

export function useCreateListing(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<actions.CreateListingInput, "userId">) =>
      actions.createListing({ ...input, userId }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: qk.listings });
      client.invalidateQueries({ queryKey: qk.ownListings(userId) });
    },
  });
}

export function useUpdateListing(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: actions.UpdateListingInput }) =>
      actions.updateListing(id, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: qk.listings });
      client.invalidateQueries({ queryKey: qk.ownListings(userId) });
    },
  });
}

export function useListingStatusMutation(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Parameters<typeof actions.setListingStatus>[1] }) =>
      actions.setListingStatus(id, status),
    onSuccess: () => client.invalidateQueries({ queryKey: qk.ownListings(userId) }),
  });
}

export function useDeleteListing(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actions.deleteListing(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: qk.listings });
      client.invalidateQueries({ queryKey: qk.ownListings(userId) });
    },
  });
}

// ── Tienda mutations ─────────────────────────────────────────────────────────

export function useCreateTienda(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: actions.TiendaInput) => actions.createTienda(userId, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: qk.ownTienda(userId) });
      client.invalidateQueries({ queryKey: qk.stores });
    },
  });
}

export function useUpdateTienda(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: actions.TiendaInput }) =>
      actions.updateTienda(id, userId, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: qk.ownTienda(userId) });
      client.invalidateQueries({ queryKey: qk.stores });
    },
  });
}
