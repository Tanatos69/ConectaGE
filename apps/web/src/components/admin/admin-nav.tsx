"use client";

import { useState, useTransition } from "react";
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
  UserCheck,
  LogOut,
  MapPin,
} from "lucide-react";
import { BRAND } from "@gemarket/shared";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { signOutAction } from "@/lib/actions/auth";

/** Real pending counts, fetched server-side in admin/layout.tsx. */
export interface AdminNavBadges {
  pendingSellerRequests: number;
  pendingReports: number;
  newUsers: number;
  newListings: number;
}

interface AdminNavItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  badgeKey?: keyof AdminNavBadges;
  exact?: boolean;
}

const items: AdminNavItem[] = [
  { href: "/admin", labelKey: "admin.dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/moderacion", labelKey: "admin.moderation", icon: ShieldCheck },
  { href: "/admin/anuncios", labelKey: "admin.listings", icon: FileText, badgeKey: "newListings" },
  { href: "/admin/vendedores", labelKey: "admin.sellers", icon: UserCheck, badgeKey: "pendingSellerRequests" },
  { href: "/admin/usuarios", labelKey: "admin.users", icon: Users, badgeKey: "newUsers" },
  { href: "/admin/tiendas", labelKey: "admin.stores", icon: Store },
  { href: "/admin/categorias", labelKey: "admin.categories", icon: Tag },
  { href: "/admin/ubicaciones", labelKey: "admin.locations", icon: MapPin },
  { href: "/admin/resenas", labelKey: "admin.reviews", icon: Star },
  { href: "/admin/reportes", labelKey: "admin.reports", icon: Flag, badgeKey: "pendingReports" },
  { href: "/admin/destacados", labelKey: "admin.featured", icon: Sparkles },
  { href: "/admin/analiticas", labelKey: "admin.analytics", icon: BarChart3 },
  { href: "/admin/ajustes", labelKey: "admin.settings", icon: Settings },
];

function NavLink({
  item,
  badges,
  onClick,
}: {
  item: AdminNavItem;
  badges?: AdminNavBadges;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;
  const badge = item.badgeKey && badges ? badges[item.badgeKey] : 0;

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
      {badge > 0 && (
        <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

export function AdminNav({ badges }: { badges?: AdminNavBadges }) {
  return (
    <nav className="space-y-0.5">
      {items.map((item) => (
        <NavLink key={item.href} item={item} badges={badges} />
      ))}
    </nav>
  );
}

export function LogoutButton({ onClick, className }: { onClick?: () => void; className?: string }) {
  const { t } = useTranslation();
  const [loggingOut, startLogout] = useTransition();

  function handleLogout() {
    if (loggingOut) return; // ignore double-clicks while the first request is in flight
    onClick?.();
    startLogout(async () => {
      await signOutAction();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-60",
        className,
      )}
    >
      <LogOut className="size-4" />
      {t("admin.logout")}
    </button>
  );
}

export function AdminSidebarFooter() {
  const { t } = useTranslation();
  return (
    <div className="mt-6 space-y-0.5 border-t pt-4">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      >
        <ExternalLink className="size-4" />
        {t("admin.viewSite")}
      </Link>
      <LogoutButton />
    </div>
  );
}

export function AdminMobileHeader({ badges }: { badges?: AdminNavBadges }) {
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
                <span className="text-sm font-semibold text-foreground">{BRAND.name}</span>
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
                <NavLink key={item.href} item={item} badges={badges} onClick={() => setOpen(false)} />
              ))}
            </nav>
            <div className="mt-4 space-y-0.5 border-t pt-4">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"
                onClick={() => setOpen(false)}
              >
                <ExternalLink className="size-4" />
                {t("admin.viewSite")}
                <ChevronRight className="ml-auto size-3.5" />
              </Link>
              <LogoutButton onClick={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
