"use client";

import Image from "next/image";
import { Star, CheckCircle, MapPin, Calendar, Users, Store as StoreIcon, Clock, ExternalLink, AtSign, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { FollowButton } from "@/components/store/follow-button";
import { WhatsAppCTA } from "@/components/listing/whatsapp-cta";
import { ListingCard } from "@/components/listing/listing-card";
import { ReviewsSection } from "@/components/listing/reviews-section";
import { useTranslation } from "@/lib/i18n/context";
import type { Store } from "@/lib/stores";
import type { Listing } from "@/lib/listings";
import type { Review } from "@/lib/demo-detail";

export function StoreView({
  store,
  listings,
  reviews,
}: {
  store: Store;
  listings: Listing[];
  reviews: Review[];
}) {
  const { t } = useTranslation();
  const isVerified = store.verificationStatus === "verified";
  const isPending = store.verificationStatus === "pending";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Banner */}
      <div className="relative h-40 overflow-hidden rounded-2xl bg-secondary sm:h-56">
        <Image
          src={store.banner}
          alt={store.name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
      </div>

      {/* Header card */}
      <div className="relative -mt-12 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="-mt-14 shrink-0 rounded-2xl ring-4 ring-card sm:-mt-16">
            <UserAvatar name={store.name} src={store.logo} size="lg" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">{store.name}</h1>
              {isVerified && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <CheckCircle className="size-3.5" />
                  {t("stores.verified")}
                </span>
              )}
              {isPending && (
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  Verificación pendiente
                </span>
              )}
              <Badge variant={store.professional ? "pro" : "muted"}>
                {store.professional ? t("stores.pro") : t("stores.private")}
              </Badge>
            </div>

            <p className="mt-1.5 text-sm text-muted-foreground">{store.tagline}</p>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                {store.address
                  ? `${store.address}${store.neighborhood ? `, ${store.neighborhood}` : ""}, ${store.city}`
                  : `${store.city}, Guinea Ecuatorial`}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 shrink-0" />
                {t("stores.memberSince")} {store.memberSince}
              </span>
              {store.businessHours && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 shrink-0" />
                  {store.businessHours}
                </span>
              )}
            </div>

            {/* Social links */}
            {(store.instagram || store.facebook) && (
              <div className="mt-2.5 flex flex-wrap items-center gap-3">
                {store.instagram && (
                  <a
                    href={`https://instagram.com/${store.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <AtSign className="size-3.5" />
                    @{store.instagram}
                    <ExternalLink className="size-3" />
                  </a>
                )}
                {store.facebook && (
                  <a
                    href={`https://facebook.com/${store.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Share2 className="size-3.5" />
                    {store.facebook}
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:w-44">
            <FollowButton slug={store.slug} />
            <WhatsAppCTA
              phoneNumber={store.whatsapp}
              listingTitle={store.name}
              message={`Hola, me interesa tu tienda ${store.name} en ConectaGE.`}
              label={t("stores.contact")}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-5">
          <div className="text-center">
            <p className="flex items-center justify-center gap-1.5 text-xl font-bold text-foreground">
              <Users className="size-4 text-muted-foreground" />
              {store.followers.toLocaleString("es")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("stores.followers")}</p>
          </div>
          <div className="border-x text-center">
            <p className="flex items-center justify-center gap-1 text-xl font-bold text-foreground">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {store.rating}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("stores.rating")}</p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1.5 text-xl font-bold text-foreground">
              <StoreIcon className="size-4 text-muted-foreground" />
              {listings.length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("stores.listings")}</p>
          </div>
        </div>
      </div>

      {/* About */}
      <section className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-foreground">{t("stores.about")}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{store.description}</p>
      </section>

      {/* Products */}
      <section className="mt-6">
        <h2 className="mb-4 text-lg font-bold text-foreground">
          {t("stores.productsOf")} {store.name}
        </h2>
        {listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border bg-card py-12 text-center text-sm text-muted-foreground shadow-sm">
            {t("stores.noProducts")}
          </p>
        )}
      </section>

      {/* Reviews */}
      <section className="mt-6">
        <ReviewsSection
          reviews={reviews}
          avgRating={store.rating}
          totalCount={store.reviewsCount}
        />
      </section>
    </div>
  );
}
