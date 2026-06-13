import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { categories, toneStyles } from "@/lib/categories";
import { formatNumber } from "@/lib/format";

export function CategoryGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Explora por categoría
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            Encuentra justo lo que necesitas entre miles de anuncios.
          </p>
        </div>
        <Link
          href="/categorias"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:inline-flex"
        >
          Ver todas
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7 lg:gap-4">
        {categories.map((cat) => {
          const tone = toneStyles[cat.tone];
          return (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className={`group flex flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 ${tone.hover}`}
            >
              <span
                className={`flex size-14 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${tone.chip}`}
                aria-hidden="true"
              >
                <FontAwesomeIcon icon={cat.icon} className="size-7" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold leading-tight text-foreground">
                  {cat.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(cat.count)} anuncios
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <Link
        href="/categorias"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:hidden"
      >
        Ver todas las categorías
        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
