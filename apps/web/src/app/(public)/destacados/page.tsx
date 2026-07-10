import type { Metadata } from "next";
import { Suspense } from "react";
import { DestacadosView } from "@/components/home/destacados-view";
import { getCategoryTree } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Anuncios destacados — ConectaGE",
  description: "Los anuncios con mayor visibilidad en Guinea Ecuatorial. Explora las mejores ofertas destacadas.",
};

export default async function DestacadosPage() {
  const tree = await getCategoryTree();
  const categories = tree.filter((c) => c.parentId === null);

  return (
    <Suspense>
      <DestacadosView categories={categories} />
    </Suspense>
  );
}
