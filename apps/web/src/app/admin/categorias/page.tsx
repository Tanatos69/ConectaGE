import type { Metadata } from "next";
import { getAdminCategoryTree } from "../data";
import { getCategoryListingCounts } from "@/lib/supabase/queries";
import { AdminCategoriesTree } from "@/components/admin/admin-categories-tree";

export const metadata: Metadata = { title: "Categorías" };

export default async function AdminCategoriasPage() {
  const [tree, counts] = await Promise.all([getAdminCategoryTree(), getCategoryListingCounts()]);

  return <AdminCategoriesTree tree={tree} counts={counts} />;
}
