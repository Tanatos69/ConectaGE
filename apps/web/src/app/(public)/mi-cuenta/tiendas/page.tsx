import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Store } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getFollowedStores } from "@/lib/supabase/queries";
import { StoreCard } from "@/components/store/store-card";

export const metadata: Metadata = { title: "Tiendas que sigo" };

export default async function TiendasSeguidasPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/mi-cuenta/tiendas");

  const stores = await getFollowedStores(user.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tiendas que sigo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {stores.length} tienda{stores.length !== 1 ? "s" : ""} seguida{stores.length !== 1 ? "s" : ""}
          {" · "}te avisamos cuando publiquen un anuncio nuevo
        </p>
      </div>

      {stores.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={store.slug} store={store} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-20 text-center shadow-sm">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Store className="size-7 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Aún no sigues ninguna tienda
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Sigue tiendas para recibir una notificación cuando publiquen anuncios nuevos.
          </p>
          <Link
            href="/tiendas"
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Explorar tiendas
          </Link>
        </div>
      )}
    </div>
  );
}
