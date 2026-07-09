"use client";

import { LanguageProvider } from "@/lib/i18n/context";
import { AppStateProvider } from "@/lib/store/app-state";
import { AuthProvider } from "@/lib/auth/context";
import { FollowsProvider } from "@/lib/store/follows-context";
import { FavoritesProvider } from "@/lib/store/favorites-context";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";
import type { ReactNode } from "react";

export function Providers({
  children,
  initialUser,
  initialProfile,
}: {
  children: ReactNode;
  initialUser: User | null;
  initialProfile: Profile | null;
}) {
  return (
    <AuthProvider initialUser={initialUser} initialProfile={initialProfile}>
      <FollowsProvider>
        <FavoritesProvider>
          <LanguageProvider>
            <AppStateProvider>{children}</AppStateProvider>
          </LanguageProvider>
        </FavoritesProvider>
      </FollowsProvider>
    </AuthProvider>
  );
}
