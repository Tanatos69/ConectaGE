"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CITIES = ["Todas", "Malabo", "Bata", "Ebebiyín", "Akonibe", "Mongomo", "Luba", "Moka"];
const CONDITIONS = [
  { value: "new", label: "Nuevo" },
  { value: "used", label: "Usado" },
  { value: "refurbished", label: "Reacondicionado" },
];
const SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "most_viewed", label: "Más vistos" },
];

interface Filters {
  minPrice: string;
  maxPrice: string;
  conditions: string[];
  city: string;
  sort: string;
}

const DEFAULT: Filters = {
  minPrice: "",
  maxPrice: "",
  conditions: [],
  city: "Todas",
  sort: "newest",
};

function FilterContent({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  function toggle(val: string) {
    const next = filters.conditions.includes(val)
      ? filters.conditions.filter((c) => c !== val)
      : [...filters.conditions, val];
    onChange({ ...filters, conditions: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ordenar
        </p>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2.5 group">
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={filters.sort === opt.value}
                onChange={() => onChange({ ...filters, sort: opt.value })}
                className="size-4 accent-primary"
              />
              <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Precio (FCFA)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["minPrice", "maxPrice"] as const).map((key) => (
            <input
              key={key}
              type="number"
              min={0}
              placeholder={key === "minPrice" ? "Mínimo" : "Máximo"}
              value={filters[key]}
              onChange={(e) => onChange({ ...filters, [key]: e.target.value })}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Estado
        </p>
        <div className="space-y-1.5">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="flex cursor-pointer items-center gap-2.5 group">
              <input
                type="checkbox"
                checked={filters.conditions.includes(c.value)}
                onChange={() => toggle(c.value)}
                className="size-4 accent-primary rounded"
              />
              <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {c.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ciudad
        </p>
        <select
          value={filters.city}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function FilterSidebar() {
  const [filters, setFilters] = useState<Filters>(DEFAULT);
  const [open, setOpen] = useState(false);

  const active =
    filters.minPrice ||
    filters.maxPrice ||
    filters.conditions.length > 0 ||
    filters.city !== "Todas" ||
    filters.sort !== "newest";

  return (
    <>
      {/* Mobile toggle */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
        >
          <SlidersHorizontal className="size-4" />
          Filtros
          {active && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              !
            </span>
          )}
        </button>
        {active && (
          <button
            onClick={() => setFilters(DEFAULT)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-52 shrink-0 lg:block">
        <div className="sticky top-[120px] rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Filtros</h2>
            {active && (
              <button
                onClick={() => setFilters(DEFAULT)}
                className="text-xs text-primary hover:underline"
              >
                Limpiar
              </button>
            )}
          </div>
          <FilterContent filters={filters} onChange={setFilters} />
        </div>
      </aside>

      {/* Mobile bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar filtros"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background p-5 pb-8 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Filtros</h2>
              <button onClick={() => setOpen(false)} aria-label="Cerrar">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <FilterContent filters={filters} onChange={setFilters} />
            <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
              Ver resultados
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
