import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getAdminModerationListings } from "../data";
import { getSiteSettings } from "@/lib/supabase/settings";
import { ModerationListingCard } from "@/components/admin/moderation-listing-card";
import { ModerationModeToggle } from "@/components/admin/moderation-mode-toggle";

export const metadata: Metadata = { title: "Moderación" };

export default async function ModeracionPage() {
  const [listings, settings] = await Promise.all([getAdminModerationListings(), getSiteSettings()]);
  const pending = listings.filter((l) => l.status === "pending");
  const flagged = listings.filter(
    (l) => l.status !== "pending" && (l.duplicateCount > 0 || l.pendingReportCount > 0),
  );
  const rest = listings.filter(
    (l) => l.status !== "pending" && l.duplicateCount === 0 && l.pendingReportCount === 0,
  );
  const sorted = [...pending, ...flagged, ...rest];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Moderación</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pending.length > 0
            ? `${pending.length} anuncio${pending.length !== 1 ? "s" : ""} esperando aprobación`
            : "Ningún anuncio pendiente de aprobación"}
          . Esto también incluye una revisión de los {listings.length - pending.length} publicados
          más recientes
          {flagged.length > 0
            ? ` — ${flagged.length} con alguna señal de alerta, mostrados primero`
            : ""}
          .
        </p>
      </div>

      <ModerationModeToggle moderationRequired={settings.moderation_required} />

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
