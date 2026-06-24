import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Flag, Heart, MapPin, Clock, LayoutList, Star, Truck } from "lucide-react";
import { recentListings, featuredListings } from "@/lib/listings";
import { getListingDetail } from "@/lib/demo-detail";
import { paymentMethods } from "@/lib/payments-logistics";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listing/listing-card";
import { ImageGallery } from "@/components/listing/image-gallery";
import { SellerCard } from "@/components/listing/seller-card";
import { ReviewsSection } from "@/components/listing/reviews-section";
import { WhatsAppCTA } from "@/components/listing/whatsapp-cta";
import { PageBreadcrumb } from "@/components/listing/page-breadcrumb";

interface Props {
  params: Promise<{ slug: string }>;
}

const conditionLabel: Record<string, string> = {
  new: "Nuevo",
  used: "Usado",
  refurbished: "Reacondicionado",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const all = [...featuredListings, ...recentListings];
  const listing = all.find((l) => l.slug === slug);
  if (!listing) return {};
  return {
    title: listing.title,
    description: `${listing.title} — ${formatPrice(listing)} — ${listing.city}, Guinea Ecuatorial. Contacta directamente por WhatsApp.`,
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const all = [...featuredListings, ...recentListings];
  const listing = all.find((l) => l.slug === slug);
  if (!listing) notFound();

  const detail = getListingDetail(slug);
  const images = detail?.images ?? [listing.image];
  const reviews = detail?.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : (listing.rating ?? 0);

  const related = all
    .filter((l) => l.categorySlug === listing.categorySlug && l.slug !== listing.slug)
    .slice(0, 4);

  const whatsappNumber = detail?.whatsappNumber ?? "+240222000000";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageBreadcrumb
        items={[
          { label: listing.categoryName, href: `/categoria/${listing.categorySlug}` },
          { label: listing.title },
        ]}
      />

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* ── Left column ── */}
        <div className="space-y-5">
          <ImageGallery images={images} title={listing.title} />

          {/* Listing header */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="muted">{listing.categoryName}</Badge>
              {listing.condition && (
                <Badge variant={listing.condition === "new" ? "new" : "muted"}>
                  {conditionLabel[listing.condition]}
                </Badge>
              )}
              {listing.featured && (
                <Badge variant="featured">
                  <Star className="size-3 fill-current" />
                  Destacado
                </Badge>
              )}
            </div>

            <h1 className="text-xl font-bold leading-snug text-foreground sm:text-2xl">
              {listing.title}
            </h1>

            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">
                {formatPrice(listing)}
              </span>
              {listing.priceType === "negotiable" && (
                <span className="text-sm font-medium text-muted-foreground">Negociable</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                {listing.city}, {listing.region}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 shrink-0" />
                {listing.postedLabel}
              </span>
              {detail?.viewsCount && (
                <span className="flex items-center gap-1.5">
                  <Eye className="size-4 shrink-0" />
                  {detail.viewsCount.toLocaleString("es-ES")} vistas
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2.5">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl border border-input px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Heart className="size-4" />
                Guardar
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl border border-input px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Flag className="size-4" />
                Reportar
              </button>
            </div>
          </div>

          {/* Description */}
          {detail?.description && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                <LayoutList className="size-4 text-primary" />
                Descripción
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {detail.description}
              </p>
            </div>
          )}

          {/* Extra fields */}
          {detail?.extraFields && Object.keys(detail.extraFields).length > 0 && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-foreground">
                Detalles del artículo
              </h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {Object.entries(detail.extraFields).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {key}
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <ReviewsSection
              reviews={reviews}
              avgRating={avgRating}
              totalCount={listing.reviews ?? reviews.length}
            />
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">
          {/* WhatsApp CTA */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <WhatsAppCTA
              phoneNumber={whatsappNumber}
              listingTitle={listing.title}
              size="lg"
              className="w-full"
            />
            {detail?.phoneNumber && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Teléfono:{" "}
                <a
                  href={`tel:${detail.phoneNumber}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {detail.phoneNumber}
                </a>
              </p>
            )}
          </div>

          {/* Seller card */}
          {detail?.seller && <SellerCard seller={detail.seller} />}

          {/* Payments & delivery */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pagos y entrega
            </p>
            <div className="flex flex-wrap gap-1.5">
              {paymentMethods
                .filter((m) => m.available)
                .map((m) => (
                  <span
                    key={m.id}
                    className="rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {m.name}
                  </span>
                ))}
            </div>
            <div className="mt-3 flex items-center gap-2 border-t pt-3 text-sm text-muted-foreground">
              <Truck className="size-4 shrink-0 text-primary" />
              Entrega disponible en Malabo, Bata y todo el país
            </div>
            <Link
              href="/pagos-y-envios"
              className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
            >
              Más sobre pagos y envíos →
            </Link>
          </div>

          {/* Safety tips */}
          <div className="rounded-2xl border bg-secondary/60 p-4">
            <p className="mb-1.5 text-xs font-semibold text-foreground">
              Consejos de seguridad
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Verifica el artículo antes de pagar</li>
              <li>• Queda en un lugar público y seguro</li>
              <li>• No envíes dinero por adelantado</li>
              <li>• Desconfía de precios muy bajos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related listings */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-foreground">
            Más anuncios en {listing.categoryName}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              href={`/categoria/${listing.categorySlug}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todos los anuncios de {listing.categoryName} →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
