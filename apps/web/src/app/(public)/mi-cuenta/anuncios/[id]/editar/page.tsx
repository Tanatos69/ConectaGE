import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { demoMyListings } from "@/lib/demo-user";
import { formatPrice } from "@/lib/format";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = demoMyListings.find((l) => l.slug === id);
  return { title: listing ? `Editar: ${listing.title}` : "Editar anuncio" };
}

export default async function EditarAnuncioPage({ params }: Props) {
  const { id } = await params;
  const listing = demoMyListings.find((l) => l.slug === id);

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

      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <Info className="size-4 mt-0.5 shrink-0" />
        <p>
          Al guardar los cambios, tu anuncio volverá a revisión antes de publicarse de nuevo.
          El proceso suele tardar menos de 2 horas.
        </p>
      </div>

      {listing ? (
        <form className="space-y-5">
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Información básica</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Título</label>
              <input
                type="text"
                defaultValue={listing.title}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Precio (FCFA)</label>
                <input
                  type="number"
                  defaultValue={listing.price ?? ""}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Tipo de precio</label>
                <select
                  defaultValue={listing.priceType}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  <option value="fixed">Precio fijo</option>
                  <option value="negotiable">Negociable</option>
                  <option value="free">Gratis</option>
                  <option value="on_request">A consultar</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Descripción</label>
              <textarea
                rows={5}
                defaultValue={listing.description ?? ""}
                placeholder="Describe tu artículo con detalle..."
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="h-11 flex-1 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/90"
            >
              Guardar cambios
            </button>
            <Link
              href="/mi-cuenta/anuncios"
              className="flex h-11 items-center justify-center rounded-xl border border-input bg-background px-5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Cancelar
            </Link>
          </div>
        </form>
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
