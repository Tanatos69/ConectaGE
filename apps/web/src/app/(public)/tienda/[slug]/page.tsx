import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStoreBySlug, getStoreListings } from "@/lib/stores";
import { demoReviews } from "@/lib/demo-detail";
import { StoreView } from "@/components/store/store-view";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = getStoreBySlug(slug);
  if (!store) return {};
  return {
    title: store.name,
    description: `${store.tagline}. Tienda en ${store.city}, Guinea Ecuatorial — ${store.listingSlugs.length} anuncios en ConectaGE.`,
  };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const store = getStoreBySlug(slug);
  if (!store) notFound();

  const listings = getStoreListings(store);

  return <StoreView store={store} listings={listings} reviews={demoReviews} />;
}
