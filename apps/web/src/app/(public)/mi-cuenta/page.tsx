import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Plus, FileText, User, Eye, Store, CheckCircle, AlertTriangle, Bell, Sparkles, Circle, Camera, Building2, Search } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { getUser } from "@/lib/supabase/server";
import {
  getProfile,
  getListingsByOwner,
  getNotifications,
  getFavoriteCount,
  getFollowCount,
  mapListingRow,
  getCategoryTree,
  monthYearLabel,
} from "@/lib/supabase/queries";
import { postedLabel } from "@/lib/time";
import type { NotificationKind } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Mi cuenta" };

const notifIcons: Record<NotificationKind, React.ElementType> = {
  listing_published: CheckCircle,
  seller_request_approved: Store,
  seller_request_rejected: AlertTriangle,
  followed_store_listing: Bell,
  welcome: Sparkles,
  listing_removed: AlertTriangle,
  listing_approved: CheckCircle,
  featured_confirmed: Sparkles,
  featured_rejected: AlertTriangle,
  saved_search_match: Search,
};

const notifColors: Record<NotificationKind, string> = {
  listing_published: "text-green-600 bg-green-50",
  seller_request_approved: "text-green-600 bg-green-50",
  seller_request_rejected: "text-destructive bg-destructive/10",
  followed_store_listing: "text-blue-600 bg-blue-50",
  welcome: "text-primary bg-primary/10",
  listing_removed: "text-destructive bg-destructive/10",
  listing_approved: "text-green-600 bg-green-50",
  featured_confirmed: "text-amber-600 bg-amber-50",
  featured_rejected: "text-destructive bg-destructive/10",
  saved_search_match: "text-blue-600 bg-blue-50",
};

const statusLabel: Record<string, string> = {
  published: "Publicado",
  pending: "En revisión",
  rejected: "Rechazado",
  expired: "Expirado",
};

const statusStyle: Record<string, string> = {
  published: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
  expired: "bg-muted text-muted-foreground",
};

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/mi-cuenta");

  const [profile, rows, notifications, favoriteCount, followCount, categoryTree] = await Promise.all([
    getProfile(user.id),
    getListingsByOwner(user.id),
    getNotifications(user.id),
    getFavoriteCount(user.id),
    getFollowCount(user.id),
    getCategoryTree(),
  ]);

  const firstName = (profile?.full_name?.trim() || user.email?.split("@")[0] || "").split(" ")[0];
  const active = rows.filter((r) => r.status === "published");
  const pending = rows.filter((r) => r.status === "pending");
  const totalViews = rows.reduce((sum, r) => sum + r.views_count, 0);
  const latest = rows.slice(0, 3);
  const unread = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 3);

  // First-steps checklist — hidden once everything is done.
  const steps = [
    {
      done: Boolean(profile?.avatar_url),
      label: "Añade tu foto de perfil",
      hint: "Genera más confianza con compradores y vendedores.",
      href: "/mi-cuenta/perfil/editar",
      icon: Camera,
    },
    {
      done: rows.length > 0,
      label: "Publica tu primer anuncio",
      hint: "Es gratis y tarda menos de 2 minutos.",
      href: "/publicar",
      icon: Plus,
    },
    {
      done: followCount > 0,
      label: "Sigue tiendas que te interesen",
      hint: "Te avisamos cuando publiquen novedades.",
      href: "/tiendas",
      icon: Building2,
    },
  ];
  const showFirstSteps = steps.some((s) => !s.done);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Hola, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile
            ? `Miembro desde ${monthYearLabel(profile.created_at)}${profile.city ? ` · ${profile.city}` : ""}`
            : ""}
        </p>
      </div>

      {/* First-steps checklist for new users */}
      {showFirstSteps && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Primeros pasos</h2>
          </div>
          <div className="space-y-2">
            {steps.map(({ done, label, hint, href, icon: Icon }) =>
              done ? (
                <div key={label} className="flex items-center gap-3 rounded-xl px-3 py-2 opacity-60">
                  <CheckCircle className="size-4 shrink-0 text-green-600" />
                  <span className="text-sm text-muted-foreground line-through">{label}</span>
                </div>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-sm transition-colors hover:bg-secondary"
                >
                  <Circle className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{label}</span>
                    <span className="block text-xs text-muted-foreground">{hint}</span>
                  </span>
                  <Icon className="size-4 shrink-0 text-primary" />
                </Link>
              ),
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Recuerda: compradores y vendedores tratan directamente por WhatsApp. Queda en lugares
            públicos y no pagues por adelantado.
          </p>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Anuncios activos",
            value: active.length,
            href: "/mi-cuenta/anuncios",
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "En revisión",
            value: pending.length,
            href: "/mi-cuenta/anuncios?status=pending",
            color: "text-amber-600 bg-amber-50",
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
        <Link
          href="/mi-cuenta/favoritos"
          className="rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-2xl font-extrabold text-rose-600">{favoriteCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Favoritos</p>
        </Link>
        <Link
          href="/mi-cuenta/anuncios"
          className="rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-2xl font-extrabold text-violet-600">{totalViews}</p>
          <p className="mt-1 text-xs text-muted-foreground">Vistas totales</p>
        </Link>
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
          href="/mi-cuenta/perfil/editar"
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
        {recentNotifications.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">No tienes notificaciones todavía.</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentNotifications.map((n) => {
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
                    <p className="text-xs text-muted-foreground mt-0.5">{postedLabel(n.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
        {latest.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">Aún no has publicado ningún anuncio.</p>
            <Link href="/publicar" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
              Publicar mi primer anuncio →
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {latest.map((row) => {
              const listing = mapListingRow(row, categoryTree);
              return (
                <div key={row.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-secondary">
                    <Image src={listing.image} alt={listing.title} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{listing.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle[row.status]}`}>
                        {statusLabel[row.status]}
                      </span>
                      {row.views_count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="size-3" />
                          {row.views_count}
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
              );
            })}
          </div>
        )}
        <div className="px-5 py-3 border-t">
          <Link href="/mi-cuenta/anuncios" className="text-xs font-medium text-primary hover:underline">
            Ver todos mis anuncios →
          </Link>
        </div>
      </div>
    </div>
  );
}
