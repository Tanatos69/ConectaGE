"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface FollowsValue {
  loaded: boolean;
  isFollowing: (tiendaSlug: string) => boolean;
  /** Returns false if the caller isn't logged in — the button should redirect to /login. */
  toggleFollow: (tiendaSlug: string) => Promise<boolean>;
}

const FollowsContext = createContext<FollowsValue>({
  loaded: false,
  isFollowing: () => false,
  toggleFollow: async () => false,
});

/**
 * Server-backed follows (store_follows table), replacing the old localStorage
 * slice — required so the follow-notification trigger has a real list of
 * followers, and so follows show up cross-device in Mi cuenta.
 */
export function FollowsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [follows, setFollows] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setFollows(new Set());
      setLoaded(true);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    createClient()
      .from("store_follows")
      .select("tienda_slug")
      .eq("follower_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setFollows(new Set((data ?? []).map((r: { tienda_slug: string }) => r.tienda_slug)));
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function toggleFollow(tiendaSlug: string): Promise<boolean> {
    if (!user) return false;
    const supabase = createClient();
    const currentlyFollowing = follows.has(tiendaSlug);

    // Optimistic update.
    setFollows((prev) => {
      const next = new Set(prev);
      if (currentlyFollowing) next.delete(tiendaSlug);
      else next.add(tiendaSlug);
      return next;
    });

    if (currentlyFollowing) {
      await supabase
        .from("store_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("tienda_slug", tiendaSlug);
    } else {
      await supabase
        .from("store_follows")
        .insert({ follower_id: user.id, tienda_slug: tiendaSlug });
    }
    return true;
  }

  return (
    <FollowsContext.Provider
      value={{
        loaded,
        isFollowing: (slug) => follows.has(slug),
        toggleFollow,
      }}
    >
      {children}
    </FollowsContext.Provider>
  );
}

export function useFollows() {
  return useContext(FollowsContext);
}
