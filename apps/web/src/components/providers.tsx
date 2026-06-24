"use client";

import { LanguageProvider } from "@/lib/i18n/context";
import { AppStateProvider } from "@/lib/store/app-state";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AppStateProvider>{children}</AppStateProvider>
    </LanguageProvider>
  );
}
