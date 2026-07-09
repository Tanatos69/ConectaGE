"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface FavoritesValue {
  loaded: boolean;
  isFavorite: (listingSlug: string) => boolean;
  /** Returns false if the caller isn't logged in — the button should redirect to /login. */
  toggleFavorite: (listingSlug: string) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesValue>({
  loaded: false,
  isFavorite: () => false,
  toggleFavorite: async () => false,
});

/**
 * Server-backed favorites (listing_favorites table), replacing the old
 * localStorage slice — required for a real, cross-device favorite count that
 * sellers can see on their own listings.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setFavorites(new Set());
      setLoaded(true);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    createClient()
      .from("listing_favorites")
      .select("listing_slug")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setFavorites(new Set((data ?? []).map((r: { listing_slug: string }) => r.listing_slug)));
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function toggleFavorite(listingSlug: string): Promise<boolean> {
    if (!user) return false;
    const supabase = createClient();
    const currentlyFavorite = favorites.has(listingSlug);

    // Optimistic update.
    setFavorites((prev) => {
      const next = new Set(prev);
      if (currentlyFavorite) next.delete(listingSlug);
      else next.add(listingSlug);
      return next;
    });

    if (currentlyFavorite) {
      await supabase
        .from("listing_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_slug", listingSlug);
    } else {
      await supabase
        .from("listing_favorites")
        .insert({ user_id: user.id, listing_slug: listingSlug });
    }
    return true;
  }

  return (
    <FavoritesContext.Provider
      value={{
        loaded,
        isFavorite: (slug) => favorites.has(slug),
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
