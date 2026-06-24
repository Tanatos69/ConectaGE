"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, Crown, MapPin, MessageCircle } from "lucide-react";
import { ListingCard } from "@/components/listing/listing-card";
import { featuredListings, allListings } from "@/lib/listings";
import { useAppState } from "@/lib/store/app-state";
import { useTranslation } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

function HeroCard({ listing }: { listing: (typeof allListings)[0] }) {
  const { t } = useTranslation();

  return (
    <Link
      href={`/anuncios/${listing.slug}`}
      className="group relative flex w-full overflow-hidden rounded-2xl border bg-card shadow-card-md transition-shadow hover:shadow-card-lg"
    >
      <div className="relative h-52 w-2/5 shrink-0 sm:h-64 sm:w-1/3">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 40vw, 33vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
      </div>

      <div className="flex flex-1 flex-col justify-between p-4 sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-featured/15 px-2.5 py-0.5 text-xs font-bold text-featured-foreground">
              <Crown className="size-3 fill-featured text-featured" />
              {t("featuredListings.badge")}
            </span>
            {listing.condition && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {listing.condition === "new" ? t("card.new") : listing.condition === "used" ? t("card.used") : t("card.refurbished")}
              </span>
            )}
          </div>
          <h3 className="mt-2 line-clamp-2 text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {listing.title}
          </h3>
          {listing.price && (
            <p className="mt-1 text-2xl font-extrabold text-primary">
              {formatPrice(listing)}
            </p>
          )}
          {listing.city && (
            <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {listing.city}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-opacity group-hover:opacity-90">
            <MessageCircle className="size-4" />
            {t("whatsappCta.contact")}
          </span>
          <span className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium text-foreground transition-colors group-hover:bg-secondary">
            Ver anuncio →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedListings() {
  const { t } = useTranslation();
  const { credits, isPromoted } = useAppState();

  const promotedListings = allListings.filter((l) => isPromoted(l.slug));
  const staticFeatured = featuredListings.filter((l) => !isPromoted(l.slug));
  const combined = [...promotedListings, ...staticFeatured];

  if (combined.length === 0) return null;

  const [hero, ...rest] = combined;
  const gridItems = rest.slice(0, 7);

  return (
    <section className="border-y bg-gradient-to-b from-amber-50/50 via-secondary/20 to-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-featured/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-featured-foreground">
              <Star className="size-3.5 fill-featured text-featured" />
              {t("featuredListings.badge")}
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {t("featuredListings.title")}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
              {t("featuredListings.subtitle")}
            </p>
          </div>
          <Link
            href="/planes"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            {t("featuredListings.highlightCta")}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Hero card — largest slot */}
        <div className="mt-7">
          <HeroCard listing={hero} />
        </div>

        {/* Grid of remaining featured listings */}
        {gridItems.length > 0 && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {gridItems.map((listing, i) => (
              <ListingCard
                key={listing.slug}
                listing={listing}
                priority={i === 0}
              />
            ))}
          </div>
        )}

        {/* CTA to /destacados */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/destacados"
            className="inline-flex items-center gap-2 rounded-xl border border-featured/30 bg-featured/5 px-6 py-3 text-sm font-semibold text-featured-foreground transition-colors hover:bg-featured/10"
          >
            <Star className="size-4 fill-featured text-featured" />
            Ver todos los anuncios destacados
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
