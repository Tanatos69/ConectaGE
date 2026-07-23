"use client";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/lib/auth/context";
import { useStandalone } from "@/lib/pwa/standalone";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const standalone = useStandalone();

  const name = profile?.full_name?.trim() || user?.email?.split("@")[0] || "Mi cuenta";
  const city = profile?.city ?? "";

  return (
    <>
      {/* Standalone mode gets its bottom-nav clearance from AppShell's
          <main> instead — this section's own mobile bar is retired there
          (see below) so there'd be nothing left to reserve space for. */}
      <div className={cn("mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 lg:pb-8", !standalone && "pb-24")}>
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-[106px] space-y-3">
              <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <UserAvatar name={name} src={profile?.avatar_url} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {name}
                    </p>
                    {city && <p className="truncate text-xs text-muted-foreground">{city}</p>}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border bg-card p-2 shadow-sm">
                <DashboardNav variant="sidebar" />
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>

      {/* Standalone mode uses the single unified AppBottomNav (rendered by
          AppShell) instead — showing both here would be the double-bar bug
          this was built to avoid. */}
      {!standalone && <DashboardNav variant="mobile" />}
    </>
  );
}
