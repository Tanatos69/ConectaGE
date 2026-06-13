import type { Metadata } from "next";
import { AdminNav, AdminMobileHeader, AdminSidebarFooter } from "@/components/admin/admin-nav";
import { AdminBanner } from "@/components/admin/admin-banner";

export const metadata: Metadata = {
  title: { default: "Admin — ConectaGE", template: "%s | Admin ConectaGE" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminBanner />
      <AdminMobileHeader />

      <div className="mx-auto flex max-w-screen-xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 border-r bg-background lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto p-4">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white">
                Admin
              </span>
              <span className="text-sm font-semibold text-foreground">ConectaGE</span>
            </div>
            <AdminNav />
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
