import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  FileText,
  Store,
  Eye,
  MessageCircle,
  Flag,
  Star,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { getAdminOverview } from "./data";
import { postedLabel } from "@/lib/time";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-xl", color)}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

const roleLabel: Record<string, string> = {
  buyer: "Comprador",
  seller: "Vendedor",
  admin: "Admin",
};

const statusLabel: Record<string, string> = {
  published: "Publicado",
  pending: "En revisión",
  rejected: "Rechazado",
  expired: "Expirado",
};

export default async function AdminDashboardPage() {
  const data = await getAdminOverview();

  if (!data) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-foreground">Dashboard no disponible</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Configura las variables de entorno de Supabase para activar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Datos reales de la plataforma en este momento.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Usuarios"
          value={data.totalUsers.toLocaleString("es-ES")}
          sub={`+${data.newUsersThisWeek} esta semana`}
          icon={Users}
          color="bg-emerald-50 text-emerald-600"
          href="/admin/usuarios"
        />
        <KpiCard
          label="Anuncios publicados"
          value={data.publishedListings.toLocaleString("es-ES")}
          sub={`${data.totalListings.toLocaleString("es-ES")} en total`}
          icon={FileText}
          color="bg-violet-50 text-violet-600"
          href="/admin/anuncios"
        />
        <KpiCard
          label="Tiendas"
          value={data.totalStores.toLocaleString("es-ES")}
          icon={Store}
          color="bg-blue-50 text-blue-600"
          href="/admin/tiendas"
        />
        <KpiCard
          label="Reseñas"
          value={data.totalReviews.toLocaleString("es-ES")}
          icon={Star}
          color="bg-amber-50 text-amber-600"
          href="/admin/resenas"
        />
        <KpiCard
          label="Visitas de anuncios (7 días)"
          value={data.visitsThisWeek.toLocaleString("es-ES")}
          sub="Según consentimiento de analítica"
          icon={Eye}
          color="bg-blue-50 text-blue-600"
          href="/admin/analiticas"
        />
        <KpiCard
          label="Clics WhatsApp (7 días)"
          value={data.waClicksThisWeek.toLocaleString("es-ES")}
          icon={MessageCircle}
          color="bg-[#25D366]/10 text-[#25D366]"
          href="/admin/analiticas"
        />
        <KpiCard
          label="Solicitudes de tienda"
          value={data.pendingSellerRequests}
          sub="Pendientes de revisar"
          icon={UserCheck}
          color="bg-amber-50 text-amber-600"
          href="/admin/vendedores"
        />
        <KpiCard
          label="Reportes"
          value={data.pendingReports}
          sub="Pendientes de revisar"
          icon={Flag}
          color="bg-red-50 text-destructive"
          href="/admin/reportes"
        />
      </div>

      {/* Latest activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Últimos usuarios</p>
            <Link
              href="/admin/usuarios"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </div>
          {data.latestUsers.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-muted-foreground">
              Todavía no hay usuarios registrados.
            </p>
          ) : (
            <div className="divide-y">
              {data.latestUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {u.full_name || u.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-foreground">{roleLabel[u.role]}</p>
                    <p className="text-xs text-muted-foreground">{postedLabel(u.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Últimos anuncios</p>
            <Link
              href="/admin/anuncios"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </div>
          {data.latestListings.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-muted-foreground">
              Todavía no hay anuncios.
            </p>
          ) : (
            <div className="divide-y">
              {data.latestListings.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <Link
                    href={`/anuncios/${l.slug}`}
                    className="min-w-0 truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {l.title}
                  </Link>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-foreground">
                      {statusLabel[l.status]}
                    </p>
                    <p className="text-xs text-muted-foreground">{postedLabel(l.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
