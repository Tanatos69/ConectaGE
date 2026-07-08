"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateListingAction } from "@/lib/actions/listings";

interface EditableListing {
  id: string;
  title: string;
  description: string;
  price: number | null;
  priceType: "fixed" | "negotiable" | "free" | "on_request";
}

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

export function EditListingForm({ listing }: { listing: EditableListing }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description,
    price: listing.price != null ? String(listing.price) : "",
    priceType: listing.priceType,
  });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await updateListingAction(listing.id, {
        title: form.title,
        description: form.description,
        price: form.price ? Number(form.price) : null,
        priceType: form.priceType,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/mi-cuenta/anuncios");
        router.refresh();
      }
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Información básica</h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Título</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            minLength={5}
            maxLength={100}
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Precio (FCFA)</label>
            <input
              type="number"
              value={form.price}
              min={0}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Tipo de precio</label>
            <select
              value={form.priceType}
              onChange={(e) =>
                setForm({ ...form, priceType: e.target.value as EditableListing["priceType"] })
              }
              className={inputClass}
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
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            minLength={10}
            maxLength={2000}
            placeholder="Describe tu artículo con detalle..."
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-11 flex-1 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        <Link
          href="/mi-cuenta/anuncios"
          className="flex h-11 items-center justify-center rounded-xl border border-input bg-background px-5 text-sm font-medium text-foreground hover:bg-secondary"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
