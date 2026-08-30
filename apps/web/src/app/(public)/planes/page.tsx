import type { Metadata } from "next";
import { BRAND } from "@gemarket/shared";
import { PlanesView } from "@/components/promote/planes-view";
import { getSiteSettings } from "@/lib/supabase/settings";

export const metadata: Metadata = {
  title: "Planes y visibilidad",
  description: `Destaca tu anuncio en ${BRAND.name}. Planes de 7, 15 y 30 días con pago por dinero móvil o transferencia bancaria en Guinea Ecuatorial.`,
};

export default async function PlanesPage() {
  const settings = await getSiteSettings();

  return (
    <PlanesView
      prices={{
        7: settings.featured_price_7d,
        15: settings.featured_price_15d,
        30: settings.featured_price_30d,
      }}
      paymentInstructions={settings.payment_instructions}
      whatsapp={settings.site_whatsapp}
    />
  );
}
