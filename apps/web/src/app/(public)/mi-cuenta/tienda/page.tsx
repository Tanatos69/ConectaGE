import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, Store } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import {
  getProfile,
  getTiendaByOwner,
  getPendingSellerRequest,
} from "@/lib/supabase/queries";
import { StoreSettingsForm } from "@/components/account/store-settings-form";
import { RequestSellerForm } from "@/components/account/request-seller-form";

export const metadata: Metadata = { title: "Mi tienda" };

export default async function MiTiendaPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/mi-cuenta/tienda");

  const profile = await getProfile(user.id);

  // Sellers manage their real tienda.
  if (profile?.role === "seller" || profile?.role === "admin") {
    const tienda = await getTiendaByOwner(user.id);
    if (tienda) {
      return (
        <StoreSettingsForm
          store={{
            slug: tienda.slug,
            name: tienda.name,
            tagline: tienda.tagline,
            description: tienda.description,
            city: tienda.city,
            address: tienda.address,
            neighborhood: tienda.neighborhood,
            businessHours: tienda.business_hours,
            instagram: tienda.instagram,
            facebook: tienda.facebook,
            verified: tienda.verified,
          }}
        />
      );
    }
  }

  // Buyers: pending request → "en revisión" panel; otherwise → request form.
  const pendingRequest = await getPendingSellerRequest(user.id);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Store className="size-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Mi tienda</h1>
      </div>

      {pendingRequest ? (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4">
            <AlertTriangle className="size-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-700">Solicitud en revisión</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Hemos recibido tu solicitud para abrir la tienda{" "}
                <strong className="text-foreground">
                  {(pendingRequest as { store_name: string }).store_name}
                </strong>
                . El equipo de ConectaGE la revisará en breve; te avisaremos cuando esté aprobada.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <RequestSellerForm />
      )}
    </div>
  );
}
