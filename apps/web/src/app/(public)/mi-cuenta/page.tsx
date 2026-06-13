import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, FileText, User, Eye, LayoutDashboard, Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { demoUser, demoMyListings, demoNotifications } from "@/lib/demo-user";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Mi cuenta" };

const notifIcons: Record<string, React.ElementType> = {
  approved: CheckCircle,
  rejected: AlertTriangle,
  expiring: Clock,
  review: LayoutDashboard,
  review_approved: CheckCircle,
};

const notifColors: Record<string, string> = {
  approved: "text-green-600 bg-green-50",
  rejected: "text-destructive bg-destructive/10",
  expiring: "text-amber-600 bg-amber-50",
  review: "text-blue-600 bg-blue-50",
  review_approved: "text-green-600 bg-green-50",
};

export default function DashboardPage() {
  const unread = demoNotifications.filter((n) => !n.read).length;
  const recentListings = demoMyListings.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Hola, {demoUser.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Miembro desde {demoUser.memberSince} · {demoUser.city}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Anuncios activos",
            value: demoUser.stats.activeListings,
            href: "/mi-cuenta/anuncios",
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "En revisión",
            value: demoUser.stats.pendingListings,
            href: "/mi-cuenta/anuncios?status=pending",
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Favoritos",
            value: demoUser.stats.favorites,
            href: "/mi-cuenta/favoritos",
            color: "text-rose-600 bg-rose-50",
          },
          {
            label: "Vistas totales",
            value: demoUser.stats.totalViews,
            href: "/mi-cuenta/anuncios",
            color: "text-violet-600 bg-violet-50",
          },
        ].map(({ label, value, href, color }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className={`text-2xl font-extrabold ${color.split(" ")[0]}`}>{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/publicar"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Nuevo anuncio
        </Link>
        <Link
          href="/mi-cuenta/anuncios"
          className="flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
        >
          <FileText className="size-4" />
          Mis anuncios
        </Link>
        <Link
          href="/mi-cuenta/perfil"
          className="flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
        >
          <User className="size-4" />
          Editar perfil
        </Link>
      </div>

      {/* Recent notifications */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-foreground">Notificaciones recientes</h2>
          {unread > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
              {unread} nuevas
            </span>
          )}
        </div>
        <div className="divide-y">
          {demoNotifications.slice(0, 3).map((n) => {
            const Icon = notifIcons[n.type] ?? CheckCircle;
            const colorClass = notifColors[n.type] ?? "text-primary bg-primary/10";
            return (
              <div key={n.id} className={`flex items-start gap-3 px-5 py-3.5 ${!n.read ? "bg-accent/30" : ""}`}>
                <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.date}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t">
          <Link href="/mi-cuenta/notificaciones" className="text-xs font-medium text-primary hover:underline">
            Ver todas las notificaciones →
          </Link>
        </div>
      </div>

      {/* My latest listings */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-foreground">Mis últimos anuncios</h2>
        </div>
        <div className="divide-y">
          {recentListings.map((listing) => (
            <div key={listing.slug} className="flex items-center gap-3 px-5 py-3.5">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-secondary">
                <Image src={listing.image} alt={listing.title} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{listing.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    listing.status === "published" ? "bg-green-50 text-green-700" :
                    listing.status === "pending" ? "bg-amber-50 text-amber-700" :
                    listing.status === "rejected" ? "bg-red-50 text-red-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {{ published: "Publicado", pending: "En revisión", rejected: "Rechazado", expired: "Expirado" }[listing.status]}
                  </span>
                  {listing.views > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="size-3" />
                      {listing.views}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-foreground">
                  {formatPrice(listing)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t">
          <Link href="/mi-cuenta/anuncios" className="text-xs font-medium text-primary hover:underline">
            Ver todos mis anuncios →
          </Link>
        </div>
      </div>
    </div>
  );
}
