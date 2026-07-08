import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getListingsByOwner, mapListingRow } from "@/lib/supabase/queries";
import { MyListingsList, type MyListingItem } from "@/components/account/my-listings-list";

export const metadata: Metadata = { title: "Mis anuncios" };

export default async function MisAnunciosPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/mi-cuenta/anuncios");

  const rows = await getListingsByOwner(user.id);

  const items: MyListingItem[] = rows.map((row) => {
    const listing = mapListingRow(row);
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
      postedLabel: listing.postedLabel,
    };
  });

  return <MyListingsList items={items} />;
}
