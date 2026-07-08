"use client";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/lib/auth/context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();

  const name = profile?.full_name?.trim() || user?.email?.split("@")[0] || "Mi cuenta";
  const city = profile?.city ?? "";

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-8">
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

      <DashboardNav variant="mobile" />
    </>
  );
}
