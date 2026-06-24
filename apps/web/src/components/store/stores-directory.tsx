"use client";

import { useMemo, useState } from "react";
import { Store as StoreIcon } from "lucide-react";
import { StoreCard } from "@/components/store/store-card";
import { demoStores } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

export function StoresDirectory() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<string>("all");
  const [city, setCity] = useState<string>("all");

  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    demoStores.forEach((s) => map.set(s.categorySlug, s.categoryName));
    return Array.from(map, ([slug, name]) => ({ slug, name }));
  }, []);

  const cityOptions = useMemo(
    () => Array.from(new Set(demoStores.map((s) => s.city))),
    [],
  );

  const stores = demoStores.filter(
    (s) =>
      (category === "all" || s.categorySlug === category) &&
      (city === "all" || s.city === city),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <StoreIcon className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("stores.directoryTitle")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("stores.directorySubtitle")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            category === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background text-muted-foreground hover:bg-secondary",
          )}
        >
          {t("stores.allCategories")}
        </button>
        {categoryOptions.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setCategory(c.slug)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === c.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-muted-foreground hover:bg-secondary",
            )}
          >
            {c.name}
          </button>
        ))}

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="ml-auto h-9 rounded-full border border-input bg-background px-3 text-sm text-foreground"
          aria-label={t("stores.cityFilter")}
        >
          <option value="all">{t("stores.allCities")}</option>
          {cityOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {stores.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={store.slug} store={store} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border bg-card py-16 text-center text-sm text-muted-foreground shadow-sm">
          {t("stores.empty")}
        </p>
      )}
    </div>
  );
}
