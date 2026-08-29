"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { BRAND } from "@gemarket/shared";
import { requestSellerStatusAction } from "@/lib/actions/seller";

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

export function RequestSellerForm() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await requestSellerStatusAction({ storeName, message });
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
        <Store className="size-6 text-primary" />
      </div>
      <h2 className="text-lg font-bold text-foreground">Abre tu tienda en {BRAND.name}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Las tiendas tienen página propia, sello de vendedor y aparecen en el directorio.
        Envía tu solicitud y el equipo de {BRAND.name} la revisará.
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="storeName" className="mb-1.5 block text-sm font-medium text-foreground">
            Nombre de la tienda <span className="text-destructive">*</span>
          </label>
          <input
            id="storeName"
            type="text"
            required
            minLength={3}
            maxLength={60}
            placeholder="Ej: Tech Malabo"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
            Cuéntanos qué vendes{" "}
            <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
          </label>
          <textarea
            id="message"
            rows={3}
            maxLength={500}
            placeholder="Tipo de productos, experiencia vendiendo, redes sociales…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          <Store className="size-4" />
          {pending ? "Enviando…" : "Solicitar tienda"}
        </button>
      </form>
    </div>
  );
}
