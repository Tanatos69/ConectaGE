"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, Heart, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: number;
}

const items: NavItem[] = [
  { href: "/mi-cuenta", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/mi-cuenta/anuncios", label: "Mis anuncios", icon: FileText },
  { href: "/mi-cuenta/favoritos", label: "Favoritos", icon: Heart },
  { href: "/mi-cuenta/notificaciones", label: "Notificaciones", icon: Bell, badge: 3 },
  { href: "/mi-cuenta/perfil", label: "Mi perfil", icon: User },
];

export function DashboardNav({ variant }: { variant: "sidebar" | "mobile" }) {
  const pathname = usePathname();

  if (variant === "sidebar") {
    return (
      <nav className="space-y-0.5">
        {items.map(({ href, label, icon: Icon, exact, badge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
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
              {badge != null && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {badge}
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
      {items.map(({ href, label, icon: Icon, exact, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
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
              {badge != null && (
                <span className="absolute -right-1.5 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  {badge}
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
