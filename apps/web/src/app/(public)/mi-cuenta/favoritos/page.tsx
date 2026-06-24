import type { Metadata } from "next";
import { FavoritesList } from "@/components/account/favorites-list";

export const metadata: Metadata = { title: "Mis favoritos" };

export default function FavoritosPage() {
  return <FavoritesList />;
}
