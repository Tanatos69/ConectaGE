"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, Heart, Bell, User, Coins, BellRing, Store, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  /** Hidden from the mobile bottom bar to keep it uncluttered. */
  mobile?: boolean;
  /** Shows the live unread-notifications count. */
  notificationBadge?: boolean;
}

const items: NavItem[] = [
  { href: "/mi-cuenta", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/mi-cuenta/anuncios", label: "Mis anuncios", icon: FileText },
  { href: "/mi-cuenta/tienda", label: "Mi tienda", icon: Store, mobile: false },
  { href: "/mi-cuenta/creditos", label: "Créditos", icon: Coins, mobile: false },
  { href: "/mi-cuenta/favoritos", label: "Favoritos", icon: Heart },
  { href: "/mi-cuenta/tiendas", label: "Tiendas que sigo", icon: Building2, mobile: false },
  { href: "/mi-cuenta/busquedas", label: "Alertas", icon: BellRing, mobile: false },
  { href: "/mi-cuenta/notificaciones", label: "Notificaciones", icon: Bell, notificationBadge: true },
  { href: "/mi-cuenta/perfil", label: "Mi perfil", icon: User },
];

/**
 * Live unread-notifications count; re-fetched on every route change.
 * Counts only the categories the user hasn't muted, so the badge always
 * matches what the notifications page actually shows.
 */
function useUnreadCount(): number {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  const allowedTypes = [
    "welcome",
    ...(profile?.notify_listings !== false ? ["listing_published"] : []),
    ...(profile?.notify_seller_requests !== false
      ? ["seller_request_approved", "seller_request_rejected"]
      : []),
    ...(profile?.notify_followed_stores !== false ? ["followed_store_listing"] : []),
  ].join(",");

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    let cancelled = false;
    createClient()
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .in("type", allowedTypes.split(","))
      .then(({ count: c }) => {
        if (!cancelled) setCount(c ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [user, pathname, allowedTypes]);

  // Derive the logged-out reset instead of setting state in the effect.
  return user ? count : 0;
}

export function DashboardNav({ variant }: { variant: "sidebar" | "mobile" }) {
  const pathname = usePathname();
  const unread = useUnreadCount();

  if (variant === "sidebar") {
    return (
      <nav className="space-y-0.5">
        {items.map(({ href, label, icon: Icon, exact, notificationBadge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const badge = notificationBadge ? unread : 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background/95 backdrop-blur-sm lg:hidden">
      {items
        .filter((i) => i.mobile !== false)
        .map(({ href, label, icon: Icon, exact, notificationBadge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const badge = notificationBadge ? unread : 0;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <div className="relative">
              <Icon className="size-5" />
              {badge > 0 && (
                <span className="absolute -right-1.5 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </div>
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
