import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { recentListings, featuredListings } from "@/lib/listings";
import { categories } from "@/lib/categories";
import { ListingCard } from "@/components/listing/listing-card";
import { FilterSidebar } from "@/components/listing/filter-sidebar";

interface Props {
  searchParams: Promise<{ q?: string; ciudad?: string; cat?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Resultados para "${q}"` : "Buscar anuncios",
    description: q
      ? `${q} — anuncios en ConectaGE, Guinea Ecuatorial.`
      : "Busca anuncios de vehículos, inmobiliaria, electrónica y más en Guinea Ecuatorial.",
  };
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q: rawQ } = await searchParams;
  const q = (rawQ ?? "").toLowerCase().trim();

  const all = [...featuredListings, ...recentListings];
  const results = q
    ? all.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.categoryName.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q),
      )
    : all;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        {rawQ ? (
          <>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              Resultados para:{" "}
              <span className="text-primary">&ldquo;{rawQ}&rdquo;</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {results.length} anuncio{results.length !== 1 ? "s" : ""} encontrado
              {results.length !== 1 ? "s" : ""}
            </p>
          </>
        ) : (
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Últimos anuncios publicados
          </h1>
        )}
      </div>

      <div className="flex gap-6">
        <FilterSidebar />

        <div className="min-w-0 flex-1">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {results.map((listing, i) => (
                <ListingCard key={listing.slug} listing={listing} priority={i < 4} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-secondary">
                <Search className="size-7 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                No encontramos anuncios para &ldquo;{rawQ}&rdquo;
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Intenta con otras palabras o explora nuestras categorías.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {categories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categoria/${cat.slug}`}
                    className="flex items-center gap-1.5 rounded-full border border-input bg-background px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    <FontAwesomeIcon icon={cat.icon} className="size-4 shrink-0" aria-hidden="true" />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
