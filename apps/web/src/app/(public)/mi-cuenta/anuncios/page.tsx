import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser, createClient } from "@/lib/supabase/server";
import { getListingsByOwner, mapListingRow, getCategoryTree } from "@/lib/supabase/queries";
import { getSiteSettings } from "@/lib/supabase/settings";
import { MyListingsList, type MyListingItem } from "@/components/account/my-listings-list";

export const metadata: Metadata = { title: "Mis anuncios" };

/** Listing ids with a featured request awaiting admin payment confirmation. */
async function getPendingFeaturedListingIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("featured_requests")
    .select("listing_id")
    .eq("user_id", userId)
    .eq("status", "pending");
  return new Set(((data ?? []) as { listing_id: string }[]).map((r) => r.listing_id));
}

export default async function MisAnunciosPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/mi-cuenta/anuncios");

  const [rows, categoryTree, settings, pendingFeatured] = await Promise.all([
    getListingsByOwner(user.id),
    getCategoryTree(),
    getSiteSettings(),
    getPendingFeaturedListingIds(user.id),
  ]);

  const items: MyListingItem[] = rows.map((row) => {
    const listing = mapListingRow(row, categoryTree);
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      price: listing.price,
      priceType: listing.priceType,
      currency: listing.currency,
      city: row.city,
      categoryName: listing.categoryName,
      image: listing.image,
      status: row.status,
      views: row.views_count,
      favorites: row.favorites_count,
      postedLabel: listing.postedLabel,
      featured: Boolean(listing.featured),
      pendingFeatured: pendingFeatured.has(row.id),
    };
  });

  return (
    <MyListingsList
      items={items}
      featuredPrices={{
        7: settings.featured_price_7d,
        15: settings.featured_price_15d,
        30: settings.featured_price_30d,
      }}
      paymentInstructions={settings.payment_instructions}
    />
  );
}
