import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Eye, MapPin, Clock, LayoutList, Star, Truck } from "lucide-react";
import { getListingBySlug as getDemoListingBySlug, type Listing } from "@/lib/listings";
import { getListingDetail, type SellerProfile } from "@/lib/demo-detail";
import {
  getListingWithDetail,
  getPublishedListings,
  getReviewsForListing,
  hasContacted,
  incrementListingViews,
  logEvent,
  monthYearLabel,
} from "@/lib/supabase/queries";
import { getUser } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { SITE_HOST } from "@/lib/site-url";
import { postedLabel } from "@/lib/time";
import { paymentMethods } from "@/lib/payments-logistics";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listing/listing-card";
import { ImageGallery } from "@/components/listing/image-gallery";
import { SellerCard } from "@/components/listing/seller-card";
import { ReviewsSection, type ReviewItem } from "@/components/listing/reviews-section";
import { WhatsAppCTA } from "@/components/listing/whatsapp-cta";
import { PageBreadcrumb } from "@/components/listing/page-breadcrumb";
import { FavoriteButton } from "@/components/listing/favorite-button";
import { ReportButton } from "@/components/listing/report-button";

interface Props {
  params: Promise<{ slug: string }>;
}

const conditionLabel: Record<string, string> = {
  new: "Nuevo",
  used: "Usado",
  refurbished: "Reacondicionado",
};

interface DetailData {
  listing: Listing;
  description: string;
  images: string[];
  extraFields: Record<string, string>;
  quantity?: number | null;
  whatsappNumber: string;
  phoneNumber?: string;
  viewsCount?: number;
  seller?: SellerProfile;
  reviews: ReviewItem[];
  /** Present only for real (Supabase) listings — powers the write-review form. */
  listingId?: string;
  sellerId?: string;
}

/** Real listing from Supabase first; demo content as fallback. */
async function loadDetail(slug: string): Promise<DetailData | null> {
  const db = await getListingWithDetail(slug);
  if (db) {
    const reviews = await getReviewsForListing(db.row.id);
    return {
      listing: db.listing,
      description: db.row.description,
      images: db.row.images.length > 0 ? db.row.images : [db.listing.image],
      extraFields: db.row.extra_fields ?? {},
      quantity: db.row.quantity,
      whatsappNumber: db.row.whatsapp,
      phoneNumber: db.row.show_phone && db.row.phone ? db.row.phone : undefined,
      viewsCount: db.row.views_count,
      seller: db.seller
        ? {
            username: "",
            name: db.seller.full_name || "Vendedor",
            memberSince: monthYearLabel(db.seller.created_at),
            rating: 0,
            reviewsCount: 0,
            activeListings: 0,
            verified: db.seller.verified,
            whatsapp: db.row.whatsapp,
            city: db.seller.city ?? db.listing.city,
            bio: "",
          }
        : undefined,
      reviews: reviews.map((r) => ({
        id: r.id,
        reviewerId: r.reviewer_id,
        reviewerName: r.reviewerName,
        rating: r.rating,
        comment: r.comment,
        createdLabel: postedLabel(r.created_at),
        sellerReply: r.seller_reply,
      })),
      listingId: db.row.id,
      sellerId: db.row.seller_id,
    };
  }

  const listing = getDemoListingBySlug(slug);
  if (!listing) return null;
  const detail = getListingDetail(slug);
  return {
    listing,
    description: detail?.description ?? "",
    images: detail?.images ?? [listing.image],
    extraFields: detail?.extraFields ?? {},
    whatsappNumber: detail?.whatsappNumber ?? "+240222000000",
    phoneNumber: detail?.phoneNumber,
    viewsCount: detail?.viewsCount,
    seller: detail?.seller,
    reviews: (detail?.reviews ?? []).map((r) => ({
      id: r.id,
      reviewerName: r.reviewerName,
      rating: r.rating,
      comment: r.comment,
      createdLabel: r.date,
      sellerReply: r.sellerReply,
    })),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadDetail(slug);
  if (!data) return {};
  const description = `${data.listing.title} — ${formatPrice(data.listing)} — ${data.listing.city}, Guinea Ecuatorial. Contacta directamente por WhatsApp.`;
  return {
    title: data.listing.title,
    description,
    // og:image makes the product photo render as a rich preview when the
    // listing link is shared on WhatsApp — no screenshots needed.
    openGraph: {
      title: data.listing.title,
      description,
      images: [{ url: data.images[0] }],
      type: "website",
    },
  };
}

/** Absolute public URL of the current deployment, from the request headers. */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? SITE_HOST;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await loadDetail(slug);
  if (!data) notFound();

  const { listing, reviews } = data;
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : (listing.rating ?? 0);

  const currentUser = await getUser();
  const isSeller = Boolean(currentUser && data.sellerId && currentUser.id === data.sellerId);
  const alreadyReviewed = Boolean(
    currentUser && reviews.some((r) => r.reviewerId === currentUser.id),
  );
  const contacted = currentUser
    ? await hasContacted(currentUser.id, { listingSlug: slug })
    : false;

  const all = await getPublishedListings();
  const related = all
    .filter((l) => l.categorySlug === listing.categorySlug && l.slug !== listing.slug)
    .slice(0, 4);

  // The plain view counter is anonymous and always on; the analytics EVENT
  // row is consent-gated inside logEvent.
  await incrementListingViews(slug);
  await logEvent("view_listing", {
    listingSlug: slug,
    categorySlug: listing.categorySlug,
    city: listing.city,
  });

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
          <ImageGallery images={data.images} title={listing.title} />

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
                {listing.city}{listing.region ? `, ${listing.region}` : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 shrink-0" />
                {listing.postedLabel}
              </span>
              {data.viewsCount != null && data.viewsCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="size-4 shrink-0" />
                  {data.viewsCount.toLocaleString("es-ES")} vistas
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2.5">
              <FavoriteButton slug={slug} />
              <ReportButton listingSlug={slug} />
            </div>
          </div>

          {/* Description */}
          {data.description && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                <LayoutList className="size-4 text-primary" />
                Descripción
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {data.description}
              </p>
            </div>
          )}

          {/* Extra fields */}
          {(Object.keys(data.extraFields).length > 0 || data.quantity != null) && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-foreground">
                Detalles del artículo
              </h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {data.quantity != null && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Cantidad disponible
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-foreground">{data.quantity}</dd>
                  </div>
                )}
                {Object.entries(data.extraFields).map(([key, value]) => (
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
          <ReviewsSection
            reviews={reviews}
            avgRating={avgRating}
            totalCount={reviews.length}
            listingId={data.listingId}
            listingSlug={listing.slug}
            isLoggedIn={Boolean(currentUser)}
            isSeller={isSeller}
            alreadyReviewed={alreadyReviewed}
            hasContacted={contacted}
          />
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">
          {/* WhatsApp CTA */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <WhatsAppCTA
              phoneNumber={data.whatsappNumber}
              listingTitle={listing.title}
              listingUrl={`${await siteOrigin()}/anuncios/${listing.slug}`}
              listingSlug={listing.slug}
              categorySlug={listing.categorySlug}
              size="lg"
              className="w-full"
            />
            {data.phoneNumber && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Teléfono:{" "}
                <a
                  href={`tel:${data.phoneNumber}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {data.phoneNumber}
                </a>
              </p>
            )}
          </div>

          {/* Seller card */}
          {data.seller && <SellerCard seller={data.seller} profileId={data.sellerId} />}

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
