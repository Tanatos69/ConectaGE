import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { allListings } from "@/lib/listings";
import { categories } from "@/lib/categories";
import { filterListings } from "@/lib/search";
import type { SearchCriteria } from "@/lib/store/app-state";
import { ListingCard } from "@/components/listing/listing-card";
import { FilterSidebar } from "@/components/listing/filter-sidebar";
import { SearchToolbar } from "@/components/search/search-toolbar";

interface Props {
  searchParams: Promise<{ q?: string; ciudad?: string; cat?: string; tipo?: string }>;
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
  const { q: rawQ, ciudad, cat, tipo } = await searchParams;

  const criteria: SearchCriteria = {
    q: rawQ?.trim() || undefined,
    city: ciudad || undefined,
    category: cat || undefined,
    listingType: tipo === "wanted" ? "wanted" : tipo === "offer" ? "offer" : undefined,
  };

  const results = filterListings(allListings, criteria);

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

      <div className="lg:flex lg:gap-6">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <FilterSidebar />
        </div>

        <div className="min-w-0 flex-1">
          {/* Mobile filter trigger sits inline with chips via the leading slot */}
          <SearchToolbar
            criteria={criteria}
            leading={
              <div className="lg:hidden">
                <FilterSidebar />
              </div>
            }
          />

          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                No encontramos anuncios{rawQ ? ` para “${rawQ}”` : ""}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Intenta con otras palabras o explora nuestras categorías.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categoria/${category.slug}`}
                    className="flex items-center gap-1.5 rounded-full border border-input bg-background px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    <FontAwesomeIcon icon={category.icon} className="size-4 shrink-0" aria-hidden="true" />
                    {category.name}
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
