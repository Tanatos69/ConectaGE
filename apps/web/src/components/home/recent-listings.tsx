import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ListingCard } from "@/components/listing/listing-card";
import { recentListings } from "@/lib/listings";
import { cn } from "@/lib/utils";

export function RecentListings() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Anuncios recientes
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            Lo último publicado en Guinea Ecuatorial.
          </p>
        </div>
        <Link
          href="/buscar"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:inline-flex"
        >
          Ver todos
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {recentListings.map((listing) => (
          <ListingCard key={listing.slug} listing={listing} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/buscar"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Ver más anuncios
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
