import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { iconByName, toneStyles, toneBySlug, DEFAULT_TONE } from "@/lib/categories";
import { getCategoryTree, getCategoryListingCounts } from "@/lib/supabase/queries";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Todas las categorías",
  description:
    "Explora todas las categorías de anuncios en ConectaGE. Vehículos, inmobiliaria, electrónica, empleo y mucho más en Guinea Ecuatorial.",
};

export default async function CategoriasPage() {
  const [tree, counts] = await Promise.all([getCategoryTree(), getCategoryListingCounts()]);
  const topLevel = tree.filter((c) => c.parentId === null);
  const totalListings = topLevel.reduce((sum, c) => sum + (counts.byCategory.get(c.slug) ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Todas las categorías
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          {formatNumber(totalListings)} anuncios en {topLevel.length} categorías
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {topLevel.map((cat) => {
          const subs = tree.filter((c) => c.parentId === cat.id);
          const { chip, hover } = toneStyles[toneBySlug[cat.slug] ?? DEFAULT_TONE];
          const icon = (cat.icon && iconByName[cat.icon]) || iconByName.faBoxOpen;

          return (
            <div
              key={cat.id}
              className={`group rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${hover}`}
            >
              <Link href={`/categoria/${cat.slug}`} className="flex items-start gap-3 mb-3">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${chip}`}
                >
                  <FontAwesomeIcon icon={icon} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {cat.name}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatNumber(counts.byCategory.get(cat.slug) ?? 0)} anuncios
                  </p>
                </div>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
              </Link>

              {subs.length > 0 && (
                <ul className="space-y-1 border-t pl-1 pt-2.5">
                  {subs.slice(0, 5).map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/categoria/${cat.slug}/${sub.slug}`}
                        className="flex items-center justify-between py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span className="truncate">{sub.name}</span>
                        <span className="ml-2 shrink-0 text-xs">
                          {formatNumber(counts.bySubcategory.get(`${cat.slug}:${sub.slug}`) ?? 0)}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {subs.length > 5 && (
                    <li>
                      <Link
                        href={`/categoria/${cat.slug}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        +{subs.length - 5} más →
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
