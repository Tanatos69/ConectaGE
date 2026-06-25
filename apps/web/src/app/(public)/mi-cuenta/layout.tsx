"use client";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { UserAvatar } from "@/components/ui/user-avatar";
import { demoUser } from "@/lib/demo-user";
import { useAppState } from "@/lib/store/app-state";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profilePicture } = useAppState();

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-8">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-[106px] space-y-3">
              <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <UserAvatar name={demoUser.name} src={profilePicture} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {demoUser.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{demoUser.city}</p>
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
