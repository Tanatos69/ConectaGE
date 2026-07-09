import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStoreBySlug, getStoreListings, getReviewsForStore } from "@/lib/supabase/queries";
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
    description: `${store.tagline}. Tienda en ${store.city}, Guinea Ecuatorial — ${store.listingSlugs.length} anuncios en ConectaGE.`,
  };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const [listings, reviews] = await Promise.all([
    getStoreListings(store),
    getReviewsForStore(store.listingSlugs),
  ]);

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
    />
  );
}
