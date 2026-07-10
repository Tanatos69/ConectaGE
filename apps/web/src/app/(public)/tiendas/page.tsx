import type { Metadata } from "next";
import { StoresDirectory } from "@/components/store/stores-directory";
import { getStores } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Tiendas",
  description:
    "Descubre las tiendas verificadas de ConectaGE en Guinea Ecuatorial: electrónica, vehículos, inmobiliaria, hogar y moda. Compra directamente por WhatsApp.",
};

export default async function TiendasPage() {
  const stores = await getStores();
  return <StoresDirectory stores={stores} />;
}
