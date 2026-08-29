import type { Metadata } from "next";
import { Suspense } from "react";
import { DestacadosView } from "@/components/home/destacados-view";
import { getCategoryTree, getFeaturedListings } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Anuncios destacados — GEMarket",
  description: "Los anuncios con mayor visibilidad en Guinea Ecuatorial. Explora las mejores ofertas destacadas.",
};

export default async function DestacadosPage() {
  const [tree, listings] = await Promise.all([getCategoryTree(), getFeaturedListings(100)]);
  const categories = tree.filter((c) => c.parentId === null);

  return (
    <Suspense>
      <DestacadosView categories={categories} listings={listings} />
    </Suspense>
  );
}
