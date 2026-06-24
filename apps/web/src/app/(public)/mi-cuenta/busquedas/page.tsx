import type { Metadata } from "next";
import { SavedSearchesView } from "@/components/account/saved-searches-view";

export const metadata: Metadata = { title: "Búsquedas guardadas" };

export default function BusquedasPage() {
  return <SavedSearchesView />;
}
