import type { Metadata } from "next";
import Link from "next/link";
import {
  Eye,
  MessageCircle,
  Users,
  Search,
  TrendingUp,
  Store,
  Download,
  SlidersHorizontal,
} from "lucide-react";
import { categories } from "@/lib/categories";
import { GE_CITIES } from "@/lib/cities";
import { getAnalytics, parseFilters, type DayCount, type LabelCount } from "./data";

export const metadata: Metadata = { title: "Analíticas" };

// ── Chart primitives (kept from the original mocked page) ───────────────────

function BarChart({ data, color = "bg-primary" }: { data: DayCount[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const compact = data.length > 14;
  return (
    <div className="flex items-end gap-0.5 h-32 pt-2">
      {data.map((d, i) => (
        <div key={d.date} className="flex flex-1 flex-col items-center gap-0.5">
          {!compact && <span className="text-[9px] text-muted-foreground">{d.value}</span>}
          <div
            className={`w-full rounded-t-sm ${color} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ height: `${Math.max((d.value / max) * 100, 3)}%` }}
            title={`${d.date}: ${d.value}`}
          />
          {(!compact || i % 5 === 0) && (
            <span className="text-[8px] text-muted-foreground whitespace-nowrap">{d.date}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function HorizBars({ items, empty }: { items: LabelCount[]; empty: string }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-xs text-muted-foreground">{empty}</p>;
  }
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{item.label}</span>
            <span className="text-muted-foreground">{item.value.toLocaleString("es-ES")}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
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

// ── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{
    desde?: string;
    hasta?: string;
    cat?: string;
    ciudad?: string;
    evento?: string;
  }>;
}

const inputClass =
  "h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function AdminAnaliticasPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const data = await getAnalytics(filters);

  if (!data) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-foreground">Analíticas no disponibles</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Configura las variables de entorno de Supabase (incl. SUPABASE_SERVICE_ROLE_KEY) y
          ejecuta la migración 0003_analytics.sql para activar esta página.
        </p>
      </div>
    );
  }

  const conversionRate =
    data.totalVisits > 0 ? ((data.totalWaClicks / data.totalVisits) * 100).toFixed(1) : "—";

  const exportParams = new URLSearchParams();
  if (params.desde) exportParams.set("desde", params.desde);
  if (params.hasta) exportParams.set("hasta", params.hasta);
  if (params.cat) exportParams.set("cat", params.cat);
  if (params.ciudad) exportParams.set("ciudad", params.ciudad);
  if (params.evento) exportParams.set("evento", params.evento);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analíticas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Datos reales de la plataforma (analítica propia, sujeta al consentimiento de los
            usuarios).
          </p>
        </div>
        <a
          href={`/admin/analiticas/export?${exportParams.toString()}`}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Download className="size-4" />
          Exportar CSV
        </a>
      </div>

      {/* Filter bar */}
      <form
        method="GET"
        className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          Filtros
        </div>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Desde
          <input
            type="date"
            name="desde"
            defaultValue={params.desde ?? toDateInput(filters.from)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Hasta
          <input
            type="date"
            name="hasta"
            defaultValue={params.hasta ?? toDateInput(filters.to)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Categoría
          <select name="cat" defaultValue={params.cat ?? ""} className={inputClass}>
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Ciudad
          <select name="ciudad" defaultValue={params.ciudad ?? ""} className={inputClass}>
            <option value="">Todas</option>
            {GE_CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Evento
          <select name="evento" defaultValue={params.evento ?? ""} className={inputClass}>
            <option value="">Todos</option>
            <option value="search">Búsquedas</option>
            <option value="view_listing">Visitas de anuncio</option>
            <option value="whatsapp_click">Clics de WhatsApp</option>
          </select>
        </label>
        <button
          type="submit"
          className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Aplicar
        </button>
        <Link
          href="/admin/analiticas"
          className="h-10 rounded-xl border border-input px-4 text-sm font-medium leading-10 text-muted-foreground hover:bg-secondary"
        >
          Limpiar
        </Link>
      </form>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Visitas de anuncios"
          value={data.totalVisits.toLocaleString("es-ES")}
          sub="En el periodo filtrado"
          icon={Eye}
          color="bg-blue-50 text-blue-600"
        />
        <KpiCard
          label="Clics en WhatsApp"
          value={data.totalWaClicks.toLocaleString("es-ES")}
          sub={`Conversión: ${conversionRate}${conversionRate !== "—" ? "%" : ""}`}
          icon={MessageCircle}
          color="bg-[#25D366]/10 text-[#25D366]"
        />
        <KpiCard
          label="Búsquedas"
          value={data.totalSearches.toLocaleString("es-ES")}
          sub="Incluye navegación por categorías"
          icon={Search}
          color="bg-violet-50 text-violet-600"
        />
        <KpiCard
          label="Usuarios registrados"
          value={data.totalUsers.toLocaleString("es-ES")}
          sub="Total de la plataforma"
          icon={Users}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Time-series charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <Eye className="size-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Visitas de anuncios / día</p>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            {data.totalVisits.toLocaleString("es-ES")} en el periodo
          </p>
          <BarChart data={data.visitsPerDay} color="bg-primary" />
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <MessageCircle className="size-4 text-[#25D366]" />
            <p className="text-sm font-semibold text-foreground">Clics WhatsApp / día</p>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            {data.totalWaClicks.toLocaleString("es-ES")} en el periodo
          </p>
          <BarChart data={data.waClicksPerDay} color="bg-[#25D366]" />
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <Users className="size-4 text-emerald-600" />
            <p className="text-sm font-semibold text-foreground">Nuevos usuarios / día</p>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            {data.signupsPerDay.reduce((s, d) => s + d.value, 0)} registros en el periodo
          </p>
          <BarChart data={data.signupsPerDay} color="bg-emerald-400" />
        </div>
      </div>

      {/* Search intelligence */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-foreground">Términos más buscados</p>
          <HorizBars
            items={data.topSearchTerms}
            empty="Sin búsquedas con texto en el periodo."
          />
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-foreground">Búsquedas por categoría</p>
          <HorizBars items={data.searchesByCategory} empty="Sin datos en el periodo." />
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-4 text-[#25D366]" />
            <p className="text-sm font-semibold text-foreground">Conversión a WhatsApp</p>
          </div>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative flex size-32 items-center justify-center rounded-full bg-[#25D366]/10">
              <p className="text-3xl font-bold text-foreground">
                {conversionRate}
                {conversionRate !== "—" && "%"}
              </p>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {data.totalWaClicks.toLocaleString("es-ES")} clics de WhatsApp sobre{" "}
              {data.totalVisits.toLocaleString("es-ES")} visitas de anuncios
            </p>
          </div>
          <div className="mt-2 border-t pt-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Dispositivos</p>
            <HorizBars items={data.deviceSplit} empty="Sin datos en el periodo." />
          </div>
        </div>
      </div>

      {/* Marketplace structure */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-foreground">Anuncios por ciudad</p>
          <HorizBars items={data.listingCities} empty="Todavía no hay anuncios publicados." />
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-foreground">Anuncios por categoría</p>
          <HorizBars items={data.listingCategories} empty="Todavía no hay anuncios publicados." />
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-foreground">Anuncios por estado</p>
          <HorizBars items={data.listingsByStatus} empty="Todavía no hay anuncios." />
        </div>
      </div>

      {/* Demographics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-foreground">Usuarios por género</p>
          <p className="mb-4 text-xs text-muted-foreground">
            Dato opcional declarado por los usuarios en su perfil.
          </p>
          <HorizBars
            items={data.genderBreakdown}
            empty="Ningún usuario ha indicado su género todavía."
          />
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-foreground">Usuarios por edad</p>
          <p className="mb-4 text-xs text-muted-foreground">
            Dato opcional declarado por los usuarios en su perfil.
          </p>
          <HorizBars
            items={data.ageBreakdown}
            empty="Ningún usuario ha indicado su edad todavía."
          />
        </div>
      </div>

      {/* Top listings table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="border-b px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Top 10 anuncios por vistas</p>
        </div>
        {data.topListingsByViews.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-muted-foreground">
            Todavía no hay anuncios con vistas.
          </p>
        ) : (
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
                {data.topListingsByViews.map((l, i) => (
                  <tr key={l.slug} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      <Link href={`/anuncios/${l.slug}`} className="hover:text-primary hover:underline">
                        {l.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{l.category}</td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">
                      {l.views.toLocaleString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Store performance */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <Store className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">
            Tiendas por anuncios publicados
          </p>
        </div>
        {data.storesByListings.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-muted-foreground">
            Todavía no hay tiendas aprobadas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40 text-xs font-medium text-muted-foreground">
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Tienda</th>
                  <th className="px-5 py-3 text-left">Categoría</th>
                  <th className="px-5 py-3 text-right">Anuncios</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.storesByListings.map((s, i) => (
                  <tr key={s.slug} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/tienda/${s.slug}`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{s.category}</td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">
                      {s.listings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Los ingresos por créditos no se muestran todavía: el sistema de pagos está pendiente de
        implementación (&ldquo;próximamente&rdquo;).
      </p>
    </div>
  );
}
