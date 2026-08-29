import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminNav, AdminMobileHeader, AdminSidebarFooter } from "@/components/admin/admin-nav";
import { AdminBanner } from "@/components/admin/admin-banner";
import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import { getAdminBadges } from "./data";

export const metadata: Metadata = {
  title: { default: "Admin — GEMarket", template: "%s | Admin GEMarket" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: the middleware already gates /admin, but this layout
  // re-checks with its own getUser() + role lookup so a middleware matcher
  // gap can never expose the admin UI.
  const user = await getUser();
  if (!user) redirect("/login?next=/admin");
  const profile = await getProfile(user.id);
  if (profile?.role !== "admin") redirect("/");

  const badges = await getAdminBadges(user.id);

  return (
    <div className="min-h-screen">
      <AdminBanner name={profile.full_name} avatarUrl={profile.avatar_url} />
      <AdminMobileHeader badges={badges} />

      <div className="mx-auto flex max-w-screen-xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 border-r bg-background lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto p-4">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white">
                Admin
              </span>
              <span className="text-sm font-semibold text-foreground">GEMarket</span>
            </div>
            <AdminNav badges={badges} />
            <AdminSidebarFooter />
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
