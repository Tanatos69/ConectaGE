import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getAdminModerationListings } from "../data";
import { ModerationListingCard } from "@/components/admin/moderation-listing-card";

export const metadata: Metadata = { title: "Moderación" };

export default async function ModeracionPage() {
  const listings = await getAdminModerationListings();
  const flagged = listings.filter((l) => l.duplicateCount > 0 || l.pendingReportCount > 0);
  const rest = listings.filter((l) => l.duplicateCount === 0 && l.pendingReportCount === 0);
  const sorted = [...flagged, ...rest];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Moderación</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los anuncios se publican automáticamente al crearse. Esto es una revisión de los{" "}
          {listings.length} más recientes
          {flagged.length > 0
            ? ` — ${flagged.length} con alguna señal de alerta, mostrados primero`
            : ""}
          .
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-20 text-center shadow-sm">
          <ShieldCheck className="mb-3 size-12 text-green-500" />
          <p className="text-base font-semibold text-foreground">Todavía no hay anuncios</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((l) => (
            <ModerationListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
