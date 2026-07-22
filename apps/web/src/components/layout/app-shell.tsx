"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStandalone } from "@/lib/pwa/standalone";
import { SiteFooter } from "@/components/layout/site-footer";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import type { CategoryNode } from "@/lib/supabase/queries";

/**
 * Owns the standalone-aware chrome around page content: reserves space for
 * (and renders) the bottom tab bar when installed as a home-screen app, and
 * hides the marketing footer in that same mode. /mi-cuenta already has its
 * own dedicated mobile nav (DashboardNav), so it keeps the regular footer
 * and never gets the bottom bar.
 */
export function AppShell({
  children,
  categories,
  siteName,
  logoUrl,
  tagline,
  contactEmail,
  contactWhatsapp,
}: {
  children: React.ReactNode;
  categories: CategoryNode[];
  siteName?: string;
  logoUrl?: string;
  tagline?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
}) {
  const standalone = useStandalone();
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/mi-cuenta");
  const showBottomNav = standalone && !isDashboard;

  return (
    <>
      <main className={cn("flex-1", showBottomNav && "pb-20 lg:pb-0")}>{children}</main>

      {!standalone && (
        // Also hidden via a pure-CSS display-mode query so Android/desktop
        // installs hide it on first paint, before this JS check even runs
        // (avoids a footer flash on mount). iOS doesn't support that media
        // query reliably (see standalone.ts), so it relies on this JS check
        // instead — a brief flash there is the accepted tradeoff.
        <div className="[@media(display-mode:standalone)]:hidden">
          <SiteFooter
            categories={categories}
            siteName={siteName}
            logoUrl={logoUrl}
            tagline={tagline}
            contactEmail={contactEmail}
            contactWhatsapp={contactWhatsapp}
          />
        </div>
      )}

      {showBottomNav && <AppBottomNav />}
    </>
  );
}
