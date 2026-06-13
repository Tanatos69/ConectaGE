"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle, XCircle, Flag, AlertTriangle, Star, Clock } from "lucide-react";
import { pendingListings, type PendingListing } from "@/lib/demo-admin";
import { cn } from "@/lib/utils";

type Action = "approve" | "reject" | "spam";

const rejectReasons = [
  "Artículo prohibido",
  "Contenido engañoso o fraudulento",
  "Título o descripción inapropiados",
  "Imágenes inapropiadas",
  "Precio irreal o engañoso",
  "Duplicado de otro anuncio",
  "Categoría incorrecta",
  "Información de contacto incorrecta",
  "Otro motivo",
];

function ListingCard({
  listing,
  onAction,
}: {
  listing: PendingListing;
  onAction: (id: string, action: Action, reason?: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(rejectReasons[0]);

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="flex gap-4 p-5">
        {/* Thumbnail */}
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            className="object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/demo/placeholder.jpg"; }}
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="text-base font-semibold text-foreground">{listing.title}</h3>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              {listing.category}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{listing.price}</span>
            <span>·</span>
            <span>{listing.city}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {listing.submittedAt}
            </span>
          </div>

          {/* Auto-flags */}
          {listing.autoFlags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {listing.autoFlags.map((f) => (
                <span
                  key={f}
                  className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700"
                >
                  <AlertTriangle className="size-3" />
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seller info */}
      <div className="border-t bg-muted/30 px-5 py-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">@{listing.seller.username}</span>
        <span className="flex items-center gap-1">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {listing.seller.rating}
        </span>
        <span>{listing.seller.approvedListings} aprobados</span>
        <span>Desde {listing.seller.memberSince}</span>
        {listing.seller.spamFlags > 0 && (
          <span className="flex items-center gap-1 text-orange-600 font-medium">
            <Flag className="size-3" />
            {listing.seller.spamFlags} flag{listing.seller.spamFlags > 1 ? "s" : ""} de spam
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="border-t px-5 py-3">
        {!rejecting ? (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onAction(listing.id, "approve")}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="size-4" />
              Aprobar
            </button>
            <button
              onClick={() => setRejecting(true)}
              className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90 transition-colors"
            >
              <XCircle className="size-4" />
              Rechazar
            </button>
            <button
              onClick={() => onAction(listing.id, "spam")}
              className="flex items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition-colors"
            >
              <Flag className="size-4" />
              Marcar como spam
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Motivo del rechazo:</p>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-10 w-full max-w-sm rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              {rejectReasons.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => onAction(listing.id, "reject", reason)}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90"
              >
                Confirmar rechazo
              </button>
              <button
                onClick={() => setRejecting(false)}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModeracionPage() {
  const [listings, setListings] = useState(pendingListings);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [log, setLog] = useState<{ id: string; action: string }[]>([]);

  function handleAction(id: string, action: Action, reason?: string) {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
    const labels: Record<Action, string> = { approve: "Aprobado", reject: `Rechazado (${reason})`, spam: "Marcado como spam" };
    setLog((prev) => [{ id, action: labels[action] }, ...prev]);
  }

  function bulkAction(action: "approve" | "reject") {
    const ids = Array.from(selected);
    ids.forEach((id) => handleAction(id, action, action === "reject" ? "Rechazo masivo" : undefined));
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cola de moderación</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {listings.length} anuncio{listings.length !== 1 ? "s" : ""} pendiente
            {listings.length !== 1 ? "s" : ""} · ordenados de más antiguo a más reciente
          </p>
        </div>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => bulkAction("approve")}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Aprobar seleccionados ({selected.size})
            </button>
            <button
              onClick={() => bulkAction("reject")}
              className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90"
            >
              Rechazar seleccionados
            </button>
          </div>
        )}
      </div>

      {/* Select all */}
      {listings.length > 0 && (
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={selected.size === listings.length && listings.length > 0}
            onChange={(e) => setSelected(e.target.checked ? new Set(listings.map((l) => l.id)) : new Set())}
            className="size-4 accent-primary rounded"
          />
          Seleccionar todos
        </label>
      )}

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-20 text-center shadow-sm">
          <CheckCircle className="mb-3 size-12 text-green-500" />
          <p className="text-base font-semibold text-foreground">Cola vacía</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Todos los anuncios han sido revisados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((l) => (
            <div key={l.id} className="flex gap-3">
              <div className="pt-6">
                <input
                  type="checkbox"
                  checked={selected.has(l.id)}
                  onChange={() => toggleSelect(l.id)}
                  className="size-4 accent-primary rounded"
                />
              </div>
              <div className="flex-1">
                <ListingCard listing={l} onAction={handleAction} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity log */}
      {log.length > 0 && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">Acciones realizadas esta sesión</p>
          <ul className="space-y-1.5">
            {log.map((entry, i) => (
              <li key={i} className={cn(
                "flex items-center gap-2 text-xs",
                entry.action.startsWith("Aprobado") ? "text-green-700" : "text-destructive"
              )}>
                {entry.action.startsWith("Aprobado") ? <CheckCircle className="size-3.5" /> : <XCircle className="size-3.5" />}
                <span>Anuncio #{entry.id}: {entry.action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
