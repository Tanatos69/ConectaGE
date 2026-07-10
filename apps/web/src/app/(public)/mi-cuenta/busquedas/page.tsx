import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getSavedSearches } from "@/lib/supabase/queries";
import { SavedSearchesView } from "@/components/account/saved-searches-view";

export const metadata: Metadata = { title: "Búsquedas guardadas" };

export default async function BusquedasPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/mi-cuenta/busquedas");

  const searches = await getSavedSearches(user.id);
  return <SavedSearchesView searches={searches} />;
}
