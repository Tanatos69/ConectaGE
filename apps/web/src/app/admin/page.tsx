import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  FileText,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  ArrowRight,
} from "lucide-react";
import {
  adminStats,
  pendingListings,
  adminUsers,
  listingReports,
} from "@/lib/demo-admin";
import { analyticsData } from "@/lib/demo-admin";
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
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
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

function BarChart({ data }: { data: { day: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5 h-28 pt-2">
      {data.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-primary/70 transition-all hover:bg-primary"
            style={{ height: `${Math.max((d.value / max) * 100, 3)}%` }}
            title={String(d.value)}
          />
          <span className="text-[10px] text-muted-foreground">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

const statusBadge: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  published: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-destructive",
  active: "bg-green-50 text-green-700",
  banned: "bg-red-50 text-destructive",
};

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  published: "Publicado",
  rejected: "Rechazado",
  active: "Activo",
  banned: "Baneado",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Viernes, 13 de junio de 2025</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Usuarios registrados"
          value={adminStats.totalUsers.toLocaleString()}
          sub={`+${adminStats.newUsersThisWeek} esta semana`}
          icon={Users}
          color="bg-blue-50 text-blue-600"
          href="/admin/usuarios"
        />
        <KpiCard
          label="Anuncios activos"
          value={adminStats.activeListings.toLocaleString()}
          icon={FileText}
          color="bg-emerald-50 text-emerald-600"
          href="/admin/anuncios"
        />
        <KpiCard
          label="Pendientes de revisión"
          value={adminStats.pendingModeration}
          sub="Requieren acción"
          icon={Clock}
          color="bg-amber-50 text-amber-600"
          href="/admin/moderacion"
        />
        <KpiCard
          label="Visitas hoy"
          value={adminStats.visitsToday.toLocaleString()}
          sub={`${adminStats.whatsappClicksToday} clics en WhatsApp`}
          icon={Eye}
          color="bg-violet-50 text-violet-600"
          href="/admin/analiticas"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-foreground">Visitas — últimos 7 días</p>
          <p className="mb-3 text-xs text-muted-foreground">
            {analyticsData.visitsPerDay.reduce((s, d) => s + d.value, 0).toLocaleString()} visitas totales
          </p>
          <BarChart data={analyticsData.visitsPerDay} />
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-foreground">Nuevos anuncios — últimos 7 días</p>
          <p className="mb-3 text-xs text-muted-foreground">
            {analyticsData.newListingsPerDay.reduce((s, d) => s + d.value, 0)} anuncios nuevos
          </p>
          <BarChart data={analyticsData.newListingsPerDay} />
        </div>
      </div>

      {/* Quick tables */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pending listings */}
        <div className="lg:col-span-1 rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Pendientes de revisión</p>
            <Link href="/admin/moderacion" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y">
            {pendingListings.slice(0, 3).map((l) => (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{l.seller.username} · {l.submittedAt}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button className="flex size-7 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Aprobar">
                    <CheckCircle className="size-3.5" />
                  </button>
                  <button className="flex size-7 items-center justify-center rounded-lg bg-red-50 text-destructive hover:bg-red-100 transition-colors" title="Rechazar">
                    <XCircle className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Últimos usuarios</p>
            <Link href="/admin/usuarios" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y">
            {adminUsers.slice(2, 7).map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.city} · {u.registeredAt}</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", statusBadge[u.status])}>
                  {statusLabel[u.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest reports */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Últimos reportes</p>
            <Link href="/admin/reportes" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y">
            {listingReports.map((r) => (
              <div key={r.id} className="flex items-start gap-3 px-5 py-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <Flag className="size-3.5 text-destructive" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{r.listingTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.reason === "fraud" ? "Fraude" : r.reason === "wrong_category" ? "Categoría incorrecta" : "Duplicado"} · {r.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
