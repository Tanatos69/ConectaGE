import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getStoreBySlug,
  getStoreListings,
  getReviewsForStore,
  getTiendaByOwner,
  hasContacted,
} from "@/lib/supabase/queries";
import { getUser } from "@/lib/supabase/server";
import { postedLabel } from "@/lib/time";
import { StoreView } from "@/components/store/store-view";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return {};
  return {
    title: store.name,
    description: `${store.tagline}. Tienda en ${store.city}, Guinea Ecuatorial — ${store.listingSlugs.length} anuncios en GEMarket.`,
  };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const user = await getUser();
  const [listings, reviews, ownTienda, contacted] = await Promise.all([
    getStoreListings(store),
    getReviewsForStore(slug, store.listingSlugs),
    user ? getTiendaByOwner(user.id) : Promise.resolve(null),
    user ? hasContacted(user.id, { tiendaSlug: slug }) : Promise.resolve(false),
  ]);

  const isOwner = ownTienda?.slug === slug;
  const alreadyReviewed = Boolean(
    user && reviews.some((r) => r.tienda_slug === slug && r.reviewer_id === user.id),
  );

  return (
    <StoreView
      store={store}
      listings={listings}
      reviews={reviews.map((r) => ({
        id: r.id,
        reviewerName: r.reviewerName,
        rating: r.rating,
        comment: r.comment,
        createdLabel: postedLabel(r.created_at),
        sellerReply: r.seller_reply,
      }))}
      reviewContext={{
        isLoggedIn: Boolean(user),
        isOwner,
        alreadyReviewed,
        hasContacted: contacted,
      }}
    />
  );
}
