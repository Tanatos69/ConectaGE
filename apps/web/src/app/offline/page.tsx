import { WifiOff } from "lucide-react";

// Precached by the service worker (src/app/sw.ts fallbacks.entries) and
// served instead of a failed document navigation when there's no network.
// Deliberately outside the (public) route group — that layout does live
// Supabase calls (site settings, categories, maintenance-mode redirect)
// that make no sense to depend on for an offline fallback.
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <WifiOff className="size-7 text-primary" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Estás sin conexión</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Revisa tu conexión a internet e inténtalo de nuevo.
      </p>
    </div>
  );
}
