"use client";

import { LanguageProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth/context";
import { FollowsProvider } from "@/lib/store/follows-context";
import { FavoritesProvider } from "@/lib/store/favorites-context";
import { PushProvider } from "@/lib/store/push-context";
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
          <PushProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </PushProvider>
        </FavoritesProvider>
      </FollowsProvider>
    </AuthProvider>
  );
}
