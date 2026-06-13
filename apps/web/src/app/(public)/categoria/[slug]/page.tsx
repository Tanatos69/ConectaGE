import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { categories } from "@/lib/categories";
import { subcategories } from "@/lib/subcategories";
import { recentListings, featuredListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing/listing-card";
import { FilterSidebar } from "@/components/listing/filter-sidebar";
import { PageBreadcrumb } from "@/components/listing/page-breadcrumb";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return {};
  return {
    title: `${cat.name} en Guinea Ecuatorial`,
    description: `Anuncios de ${cat.name} en Guinea Ecuatorial. Compra y vende en Malabo, Bata y toda Guinea Ecuatorial.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const subs = subcategories[cat.slug] ?? [];
  const all = [...featuredListings, ...recentListings];
  const filtered = all.filter((l) => l.categorySlug === slug);
  const listings = filtered.length > 0 ? filtered : recentListings.slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageBreadcrumb
        items={[{ label: "Categorías", href: "/categorias" }, { label: cat.name }]}
      />

      <div className="mb-5 mt-6 flex items-center gap-3">
        <FontAwesomeIcon icon={cat.icon} className="size-8 text-muted-foreground" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{cat.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {cat.count.toLocaleString("es-ES")} anuncios publicados
          </p>
        </div>
      </div>

      {subs.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="flex items-center rounded-full border-2 border-primary bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-primary">
            Todos ({cat.count.toLocaleString("es-ES")})
          </span>
          {subs.map((sub) => (
            <Link
              key={sub.slug}
              href={`/categoria/${cat.slug}/${sub.slug}`}
              className="flex items-center rounded-full border border-input bg-background px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent hover:text-foreground"
            >
              {sub.name}
              <span className="ml-1.5 text-xs text-muted-foreground/70">
                ({sub.count.toLocaleString("es-ES")})
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        <FilterSidebar />

        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{listings.length}</span> anuncios
            encontrados
          </p>

          {listings.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {listings.map((listing, i) => (
                <ListingCard key={listing.slug} listing={listing} priority={i < 4} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FontAwesomeIcon icon={cat.icon} className="mb-4 size-12 text-muted-foreground/40" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-foreground">
                No hay anuncios en esta categoría aún
              </h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Sé el primero en publicar en {cat.name}.
              </p>
              <Link
                href="/publicar"
                className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Publicar anuncio
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
