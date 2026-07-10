import type { Metadata } from "next";
import { getCategoryTree, getCategoryListingCounts } from "@/lib/supabase/queries";
import { getSiteSettings } from "@/lib/supabase/settings";
import { PublicarWizard } from "./publicar-wizard";
import type { CategoryNode } from "@/lib/supabase/queries";

export const metadata: Metadata = { title: "Publicar anuncio" };

export default async function PublicarPage() {
  const [tree, counts, settings] = await Promise.all([
    getCategoryTree(),
    getCategoryListingCounts(),
    getSiteSettings(),
  ]);
  const categories = tree.filter((c) => c.parentId === null);
  const subcategoriesByParent: Record<string, CategoryNode[]> = {};
  for (const cat of categories) {
    subcategoriesByParent[cat.slug] = tree.filter((c) => c.parentId === cat.id);
  }

  return (
    <PublicarWizard
      categories={categories}
      subcategoriesByParent={subcategoriesByParent}
      subcategoryCounts={counts.bySubcategory}
      maxImages={settings.max_images_per_listing}
    />
  );
}
