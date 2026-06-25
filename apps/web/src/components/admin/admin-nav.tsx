"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Users,
  Tag,
  Star,
  Flag,
  Sparkles,
  BarChart3,
  Settings,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminStats } from "@/lib/demo-admin";
import { useTranslation } from "@/lib/i18n/context";

interface AdminNavItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  badge?: number;
  exact?: boolean;
}

const items: AdminNavItem[] = [
  { href: "/admin", labelKey: "admin.dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/moderacion", labelKey: "admin.moderation", icon: ShieldCheck, badge: adminStats.pendingModeration },
  { href: "/admin/anuncios", labelKey: "admin.listings", icon: FileText },
  { href: "/admin/usuarios", labelKey: "admin.users", icon: Users },
  { href: "/admin/tiendas", labelKey: "admin.stores", icon: Store, badge: adminStats.pendingStoreVerifications },
  { href: "/admin/categorias", labelKey: "admin.categories", icon: Tag },
  { href: "/admin/resenas", labelKey: "admin.reviews", icon: Star, badge: adminStats.pendingReviews },
  { href: "/admin/reportes", labelKey: "admin.reports", icon: Flag, badge: adminStats.totalReports },
  { href: "/admin/destacados", labelKey: "admin.featured", icon: Sparkles, badge: adminStats.pendingFeatured },
  { href: "/admin/analiticas", labelKey: "admin.analytics", icon: BarChart3 },
  { href: "/admin/ajustes", labelKey: "admin.settings", icon: Settings },
];

function NavLink({ item, onClick }: { item: AdminNavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{t(item.labelKey)}</span>
      {item.badge != null && item.badge > 0 && (
        <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}

export function AdminNav() {
  return (
    <nav className="space-y-0.5">
      {items.map((item) => (
        <NavLink key={item.href} item={item} />
      ))}
    </nav>
  );
}

export function AdminSidebarFooter() {
  const { t } = useTranslation();
  return (
    <div className="mt-6 border-t pt-4">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      >
        <ExternalLink className="size-4" />
        {t("admin.viewSite")}
      </Link>
    </div>
  );
}

export function AdminMobileHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const pathname = usePathname();
  const current = items.find((i) =>
    i.exact ? pathname === i.href : pathname.startsWith(i.href),
  );

  return (
    <>
      <div className="flex items-center gap-3 border-b bg-background px-4 py-3 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex size-9 items-center justify-center rounded-xl border border-input bg-background text-muted-foreground"
          aria-label={t("admin.openMenu")}
        >
          <Menu className="size-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary px-2 py-0.5 text-xs font-bold text-white">
            Admin
          </span>
          <span className="text-sm font-medium text-foreground">
            {current ? t(current.labelKey) : t("admin.dashboard")}
          </span>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-background p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white">
                  Admin
                </span>
                <span className="text-sm font-semibold text-foreground">ConectaGE</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="space-y-0.5">
              {items.map((item) => (
                <NavLink key={item.href} item={item} onClick={() => setOpen(false)} />
              ))}
            </nav>
            <div className="mt-4 border-t pt-4">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"
                onClick={() => setOpen(false)}
              >
                <ExternalLink className="size-4" />
                {t("admin.viewSite")}
                <ChevronRight className="ml-auto size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
