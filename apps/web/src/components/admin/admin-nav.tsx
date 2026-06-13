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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminStats } from "@/lib/demo-admin";

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  exact?: boolean;
}

const items: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/moderacion", label: "Moderación", icon: ShieldCheck, badge: adminStats.pendingModeration },
  { href: "/admin/anuncios", label: "Anuncios", icon: FileText },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/resenas", label: "Reseñas", icon: Star, badge: adminStats.pendingReviews },
  { href: "/admin/reportes", label: "Reportes", icon: Flag, badge: adminStats.totalReports },
  { href: "/admin/destacados", label: "Destacados", icon: Sparkles, badge: adminStats.pendingFeatured },
  { href: "/admin/analiticas", label: "Analíticas", icon: BarChart3 },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

function NavLink({ item, onClick }: { item: AdminNavItem; onClick?: () => void }) {
  const pathname = usePathname();
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
      <span className="flex-1">{item.label}</span>
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

export function AdminMobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = items.find((i) =>
    i.exact ? pathname === i.href : pathname.startsWith(i.href),
  );

  return (
    <>
      <div className="flex items-center justify-between border-b bg-background px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary px-2 py-0.5 text-xs font-bold text-white">
            Admin
          </span>
          <span className="text-sm font-medium text-foreground">
            {current?.label ?? "Dashboard"}
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex size-9 items-center justify-center rounded-xl border border-input bg-background text-muted-foreground"
          aria-label="Abrir menú admin"
        >
          <Menu className="size-4" />
        </button>
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
                Ver sitio público
                <ChevronRight className="ml-auto size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
