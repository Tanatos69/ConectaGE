import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { iconByName } from "@/lib/categories";
import { getCategoryTree, getCategoryListingCounts } from "@/lib/supabase/queries";
import { recentListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing/listing-card";
import { FilterSidebar } from "@/components/listing/filter-sidebar";
import { PageBreadcrumb } from "@/components/listing/page-breadcrumb";

interface Props {
  params: Promise<{ slug: string; subslug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, subslug } = await params;
  const tree = await getCategoryTree();
  const cat = tree.find((c) => c.parentId === null && c.slug === slug);
  const sub = cat && tree.find((c) => c.parentId === cat.id && c.slug === subslug);
  if (!cat || !sub) return {};
  return {
    title: `${sub.name} — ${cat.name}`,
    description: `Anuncios de ${sub.name} en Guinea Ecuatorial. Compra y vende en Malabo, Bata y toda Guinea Ecuatorial.`,
  };
}

export default async function SubcategoryPage({ params }: Props) {
  const { slug, subslug } = await params;
  const [tree, counts] = await Promise.all([getCategoryTree(), getCategoryListingCounts()]);
  const cat = tree.find((c) => c.parentId === null && c.slug === slug);
  const subs = cat ? tree.filter((c) => c.parentId === cat.id) : [];
  const sub = subs.find((s) => s.slug === subslug);
  if (!cat || !sub) notFound();

  const icon = (cat.icon && iconByName[cat.icon]) || iconByName.faBoxOpen;
  const subCount = counts.bySubcategory.get(`${cat.slug}:${sub.slug}`) ?? 0;
  const listings = recentListings.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageBreadcrumb
        items={[
          { label: "Categorías", href: "/categorias" },
          { label: cat.name, href: `/categoria/${cat.slug}` },
          { label: sub.name },
        ]}
      />

      <div className="mb-5 mt-6 flex items-center gap-3">
        <FontAwesomeIcon icon={icon} className="size-8 text-muted-foreground" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{sub.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {subCount.toLocaleString("es-ES")} anuncios en {cat.name}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {/* Mobile filter trigger — inline with subcategory chips */}
        <div className="lg:hidden">
          <FilterSidebar />
        </div>
        <Link
          href={`/categoria/${cat.slug}`}
          className="flex items-center rounded-full border border-input bg-background px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          Ver todos
        </Link>
        {subs.map((s) => (
          <Link
            key={s.id}
            href={`/categoria/${cat.slug}/${s.slug}`}
            className={`flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              s.slug === sub.slug
                ? "border-2 border-primary bg-primary/10 text-primary"
                : "border border-input bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {s.name}
          </Link>
        ))}
      </div>

      <div className="lg:flex lg:gap-6">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <FilterSidebar />
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{listings.length}</span> anuncios
            encontrados
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {listings.map((listing, i) => (
              <ListingCard key={listing.slug} listing={listing} priority={i < 4} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
