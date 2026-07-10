import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getOwnListingById } from "@/lib/supabase/queries";
import { EditListingForm } from "@/components/account/edit-listing-form";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Editar anuncio" };

export default async function EditarAnuncioPage({ params }: Props) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect("/login?next=/mi-cuenta/anuncios");

  // RLS only returns the row if it's published or owned; the ownership check
  // below keeps other people's published listings out of this form.
  const listing = await getOwnListingById(id);
  const own = listing && listing.seller_id === user.id ? listing : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/mi-cuenta/anuncios"
          className="flex size-9 items-center justify-center rounded-xl border border-input bg-background text-muted-foreground hover:bg-secondary"
          aria-label="Volver"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">Editar anuncio</h1>
      </div>

      {own ? (
        <EditListingForm
          listing={{
            id: own.id,
            title: own.title,
            description: own.description,
            price: own.price != null ? Number(own.price) : null,
            priceType: own.price_type,
            city: own.city,
            condition: own.condition,
            whatsapp: own.whatsapp,
          }}
        />
      ) : (
        <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">Anuncio no encontrado.</p>
          <Link href="/mi-cuenta/anuncios" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            Volver a mis anuncios
          </Link>
        </div>
      )}
    </div>
  );
}
