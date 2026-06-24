"use client";

import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { StoreCard } from "@/components/store/store-card";
import { demoStores } from "@/lib/stores";
import { useTranslation } from "@/lib/i18n/context";

export function StoresStrip() {
  const { t } = useTranslation();
  const featured = demoStores.slice(0, 4);

  return (
    <section className="border-t bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              <Store className="size-3.5" />
              {t("header.stores")}
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Tiendas destacadas
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
              Vendedores profesionales verificados en Guinea Ecuatorial.
            </p>
          </div>
          <Link
            href="/tiendas"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            {t("footer.stores")} →
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="no-scrollbar -mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
          {featured.map((store) => (
            <div key={store.slug} className="w-[280px] shrink-0 snap-start sm:w-auto">
              <StoreCard store={store} />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/tiendas"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Ver todas las tiendas
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
