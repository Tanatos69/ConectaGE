"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Profile } from "@/lib/supabase/types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
}

const AuthContext = createContext<AuthContextValue>({ user: null, profile: null });

/**
 * Single source of truth for "who's logged in" on the client. The root
 * layout (Server Component) fetches user+profile and passes them down;
 * onAuthStateChange keeps the header etc. in sync without a reload by
 * calling router.refresh() so Server Components re-fetch.
 */
export function AuthProvider({
  initialUser,
  initialProfile,
  children,
}: {
  initialUser: User | null;
  initialProfile: Profile | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

  // Server-fetched values win whenever the tree re-renders after refresh()
  // (render-time adjustment instead of an effect, per React guidance).
  const [prevInitial, setPrevInitial] = useState({ initialUser, initialProfile });
  if (prevInitial.initialUser !== initialUser || prevInitial.initialProfile !== initialProfile) {
    setPrevInitial({ initialUser, initialProfile });
    setUser(initialUser);
    setProfile(initialProfile);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setUser(session?.user ?? null);
        if (!session?.user) setProfile(null);
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return <AuthContext.Provider value={{ user, profile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
