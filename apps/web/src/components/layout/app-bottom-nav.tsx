"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";

/**
 * Standalone-only (installed PWA) bottom tab bar for the public marketplace
 * section. Mirrors DashboardNav's mobile variant, but /mi-cuenta already has
 * its own bottom nav so this only ever renders outside that section (see
 * AppShell) — no overlap to guard against here.
 */
export function AppBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const accountHref = user ? "/mi-cuenta" : "/login";

  const cuentaActive = pathname.startsWith("/mi-cuenta") && !pathname.startsWith("/mi-cuenta/favoritos");

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex items-end border-t bg-background/95 backdrop-blur-sm lg:hidden",
        "pb-[calc(0.5rem+env(safe-area-inset-bottom))]",
      )}
    >
      <NavLink href="/" label="Inicio" icon={Home} active={pathname === "/"} />
      <NavLink href="/buscar" label="Buscar" icon={Search} active={pathname.startsWith("/buscar")} />

      <Link
        href="/publicar"
        aria-label="Publicar"
        className="relative flex flex-1 flex-col items-center justify-end gap-1 pb-1 text-[10px] font-medium text-primary"
      >
        <span className="-mt-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <Plus className="size-6" />
        </span>
        Publicar
      </Link>

      <NavLink
        href="/mi-cuenta/favoritos"
        label="Favoritos"
        icon={Heart}
        active={pathname.startsWith("/mi-cuenta/favoritos")}
      />
      <NavLink href={accountHref} label="Cuenta" icon={User} active={cuentaActive} />
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
