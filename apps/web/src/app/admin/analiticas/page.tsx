import type { Metadata } from "next";
import { Eye, MessageCircle, Users, FileText, TrendingUp, Store } from "lucide-react";
import Link from "next/link";
import { analyticsData, adminStats, newUsersPerDay, creditsRevenuePerDay, topStoresByFollowers } from "@/lib/demo-admin";

export const metadata: Metadata = { title: "Analíticas" };

function BarChart({
  data,
  color = "bg-primary",
}: {
  data: { day: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5 h-32 pt-2">
      {data.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[9px] text-muted-foreground">{d.value}</span>
          <div
            className={`w-full rounded-t-md ${color} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ height: `${Math.max((d.value / max) * 100, 3)}%` }}
            title={`${d.day}: ${d.value}`}
          />
          <span className="text-[10px] text-muted-foreground">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function HorizBar({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function BarChart30({ data, color = "bg-primary" }: { data: { date: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-0.5 h-32 pt-2">
      {data.map((d, i) => (
        <div key={d.date} className="flex flex-1 flex-col items-center gap-0.5">
          <div
            className={`w-full rounded-t-sm ${color} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ height: `${Math.max((d.value / max) * 100, 3)}%` }}
            title={`${d.date}: ${d.value}`}
          />
          {i % 5 === 0 && (
            <span className="text-[8px] text-muted-foreground whitespace-nowrap">{d.date.slice(0, 6)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

const totalVisits = analyticsData.visitsPerDay.reduce((s, d) => s + d.value, 0);
const totalWA = analyticsData.whatsappPerDay.reduce((s, d) => s + d.value, 0);
const totalListings = analyticsData.newListingsPerDay.reduce((s, d) => s + d.value, 0);
const conversionRate = ((totalWA / totalVisits) * 100).toFixed(1);

export default function AdminAnaliticasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analíticas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Últimos 7 días · actualizado hoy a las 00:00</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm text-muted-foreground">
          <span>Últimos 7 días</span>
          <span className="text-muted-foreground/40">▼</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Visitas totales"
          value={totalVisits.toLocaleString()}
          sub={`${adminStats.visitsToday.toLocaleString()} hoy`}
          icon={Eye}
          color="bg-blue-50 text-blue-600"
        />
        <KpiCard
          label="Clics en WhatsApp"
          value={totalWA.toLocaleString()}
          sub={`Conversión: ${conversionRate}%`}
          icon={MessageCircle}
          color="bg-[#25D366]/10 text-[#25D366]"
        />
        <KpiCard
          label="Nuevos anuncios"
          value={totalListings}
          sub={`${adminStats.activeListings.toLocaleString()} activos en total`}
          icon={FileText}
          color="bg-violet-50 text-violet-600"
        />
        <KpiCard
          label="Nuevos usuarios"
          value={adminStats.newUsersThisWeek}
          sub={`${adminStats.totalUsers.toLocaleString()} en total`}
          icon={Users}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <Eye className="size-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Visitas por día</p>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">{totalVisits.toLocaleString()} visitas esta semana</p>
          <BarChart data={analyticsData.visitsPerDay} color="bg-primary" />
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <MessageCircle className="size-4 text-[#25D366]" />
            <p className="text-sm font-semibold text-foreground">Clics WhatsApp / día</p>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">{totalWA} clics esta semana</p>
          <BarChart data={analyticsData.whatsappPerDay} color="bg-[#25D366]" />
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <FileText className="size-4 text-violet-600" />
            <p className="text-sm font-semibold text-foreground">Nuevos anuncios / día</p>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">{totalListings} anuncios esta semana</p>
          <BarChart data={analyticsData.newListingsPerDay} color="bg-violet-400" />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top cities */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-foreground">Top ciudades por anuncios</p>
          <div className="space-y-3">
            {analyticsData.topCities.map((c) => (
              <HorizBar key={c.name} label={c.name} value={c.listings} pct={c.pct * (100 / 55)} />
            ))}
          </div>
        </div>

        {/* Top categories */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-foreground">Top categorías</p>
          <div className="space-y-3">
            {analyticsData.topCategories.map((c) => {
              const maxVal = analyticsData.topCategories[0].listings;
              return (
                <HorizBar key={c.name} label={c.name} value={c.listings} pct={(c.listings / maxVal) * 100} />
              );
            })}
          </div>
        </div>

        {/* WhatsApp conversion */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-4 text-[#25D366]" />
            <p className="text-sm font-semibold text-foreground">Tasa de conversión WA</p>
          </div>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative flex size-32 items-center justify-center rounded-full bg-[#25D366]/10">
              <p className="text-3xl font-bold text-foreground">{conversionRate}%</p>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {totalWA} clics de WhatsApp sobre {totalVisits.toLocaleString()} visitas totales esta semana
            </p>
          </div>
          <div className="mt-2 grid grid-cols-2 divide-x rounded-xl bg-muted/50 text-center">
            <div className="px-4 py-3">
              <p className="text-lg font-bold text-foreground">{totalVisits.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Visitas</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-lg font-bold text-[#25D366]">{totalWA}</p>
              <p className="text-xs text-muted-foreground">Clics WA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top listings table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="border-b px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Top 10 anuncios por vistas</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">#</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Anuncio</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Categoría</th>
                <th className="px-5 py-3 text-right font-medium text-muted-foreground">Vistas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...analyticsData.topListingsByViews]
                .sort((a, b) => b.views - a.views)
                .map((l, i) => (
                  <tr key={l.title} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{l.title}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.category}</td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">{l.views.toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 30-day trend charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Nuevos usuarios — 30 días</p>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            {newUsersPerDay.reduce((s, d) => s + d.value, 0)} registros en los últimos 30 días
          </p>
          <BarChart30 data={newUsersPerDay} color="bg-primary" />
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="size-4 text-featured" />
            <p className="text-sm font-semibold text-foreground">Ingresos por créditos — 30 días</p>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            {(creditsRevenuePerDay.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}k FCFA en los últimos 30 días
          </p>
          <BarChart30 data={creditsRevenuePerDay} color="bg-featured" />
        </div>
      </div>

      {/* Store performance */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <Store className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Rendimiento de tiendas</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/40 text-xs font-medium text-muted-foreground">
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">Tienda</th>
                <th className="px-5 py-3 text-left">Categoría</th>
                <th className="px-5 py-3 text-right">Seguidores</th>
                <th className="px-5 py-3 text-right">Anuncios</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topStoresByFollowers.map((s, i) => (
                <tr key={s.slug} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-5 py-3">
                    <Link href={`/tienda/${s.slug}`} className="font-medium text-foreground hover:text-primary hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{s.categoryName}</td>
                  <td className="px-5 py-3 text-right font-semibold text-foreground">{s.followers.toLocaleString("es")}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{s.listingsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
