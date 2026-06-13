import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { AdminNav, AdminMobileHeader } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: { default: "Admin — ConectaGE", template: "%s | Admin ConectaGE" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Demo banner */}
      <div className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-xs text-amber-800 border-b border-amber-200">
        <ShieldAlert className="size-3.5 shrink-0" />
        <span>
          <strong>Área restringida.</strong> En producción, requiere sesión con rol{" "}
          <code className="rounded bg-amber-100 px-1">moderator</code> o{" "}
          <code className="rounded bg-amber-100 px-1">super_admin</code>.
        </span>
      </div>

      {/* Mobile header */}
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
            <div className="mt-6 border-t pt-4">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <ExternalLink className="size-4" />
                Ver sitio público
              </Link>
            </div>
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
