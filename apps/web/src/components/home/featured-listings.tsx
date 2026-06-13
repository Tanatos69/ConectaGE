"use client";

import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { ListingCard } from "@/components/listing/listing-card";
import { featuredListings } from "@/lib/listings";
import { useTranslation } from "@/lib/i18n/context";

export function FeaturedListings() {
  const { t } = useTranslation();

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

        <div className="relative">
          <div className="no-scrollbar -mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {featuredListings.map((listing, i) => (
              <ListingCard
                key={listing.slug}
                listing={listing}
                priority={i < 2}
                className="w-[260px] shrink-0 snap-start sm:w-[280px]"
              />
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
