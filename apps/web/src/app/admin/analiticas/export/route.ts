import { NextResponse } from "next/server";
import { BRAND } from "@gemarket/shared";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAnalytics, parseFilters } from "../data";

function csvField(value: string | number): string {
  const s = String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function section(title: string, header: string[], rows: (string | number)[][]): string {
  const lines = [title, header.map(csvField).join(",")];
  for (const row of rows) lines.push(row.map(csvField).join(","));
  lines.push("");
  return lines.join("\r\n");
}

/**
 * Aggregate analytics CSV, honoring the same filters as the dashboard.
 * Route handlers don't render inside the admin layout, so this re-verifies
 * the admin role itself (middleware gating alone is not enough defense).
 */
export async function GET(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "No configurado" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const filters = parseFilters({
    desde: searchParams.get("desde") ?? undefined,
    hasta: searchParams.get("hasta") ?? undefined,
    cat: searchParams.get("cat") ?? undefined,
    ciudad: searchParams.get("ciudad") ?? undefined,
    evento: searchParams.get("evento") ?? undefined,
  });

  const data = await getAnalytics(filters);
  if (!data) return NextResponse.json({ error: "Sin datos" }, { status: 503 });

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const parts: string[] = [
    section(
      `Informe de analíticas ${BRAND.name}`,
      ["Desde", "Hasta", "Categoría", "Ciudad", "Evento"],
      [[fmt(filters.from), fmt(filters.to), filters.category ?? "Todas", filters.city ?? "Todas", filters.eventType ?? "Todos"]],
    ),
    section(
      "Resumen",
      ["Métrica", "Valor"],
      [
        ["Usuarios registrados (total)", data.totalUsers],
        ["Visitas de anuncios (periodo)", data.totalVisits],
        ["Clics de WhatsApp (periodo)", data.totalWaClicks],
        ["Búsquedas (periodo)", data.totalSearches],
        [
          "Conversión visitas→WhatsApp (%)",
          data.totalVisits > 0 ? ((data.totalWaClicks / data.totalVisits) * 100).toFixed(1) : "N/D",
        ],
      ],
    ),
    section("Visitas de anuncios por día", ["Día", "Visitas"], data.visitsPerDay.map((d) => [d.date, d.value])),
    section("Clics de WhatsApp por día", ["Día", "Clics"], data.waClicksPerDay.map((d) => [d.date, d.value])),
    section("Nuevos usuarios por día", ["Día", "Registros"], data.signupsPerDay.map((d) => [d.date, d.value])),
    section("Términos más buscados", ["Término", "Búsquedas"], data.topSearchTerms.map((i) => [i.label, i.value])),
    section("Búsquedas por categoría", ["Categoría", "Búsquedas"], data.searchesByCategory.map((i) => [i.label, i.value])),
    section("Dispositivos", ["Dispositivo", "Eventos"], data.deviceSplit.map((i) => [i.label, i.value])),
    section("Anuncios por ciudad", ["Ciudad", "Anuncios"], data.listingCities.map((i) => [i.label, i.value])),
    section("Anuncios por categoría", ["Categoría", "Anuncios"], data.listingCategories.map((i) => [i.label, i.value])),
    section("Anuncios por estado", ["Estado", "Anuncios"], data.listingsByStatus.map((i) => [i.label, i.value])),
    section("Usuarios por género (opcional, declarado)", ["Género", "Usuarios"], data.genderBreakdown.map((i) => [i.label, i.value])),
    section("Usuarios por edad (opcional, declarado)", ["Rango", "Usuarios"], data.ageBreakdown.map((i) => [i.label, i.value])),
    section(
      "Top anuncios por vistas",
      ["Anuncio", "Categoría", "Vistas"],
      data.topListingsByViews.map((l) => [l.title, l.category, l.views]),
    ),
    section(
      "Tiendas por anuncios publicados",
      ["Tienda", "Categoría", "Anuncios"],
      data.storesByListings.map((s) => [s.name, s.category, s.listings]),
    ),
  ];

  // UTF-8 BOM so Excel opens accents correctly.
  const csv = "﻿" + parts.join("\r\n");
  const filename = `${BRAND.slug}-analiticas_${fmt(filters.from)}_${fmt(filters.to)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
