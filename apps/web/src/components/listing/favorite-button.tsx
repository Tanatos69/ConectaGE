"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/store/app-state";

/**
 * Heart toggle on listing cards and detail pages. Persists the listing slug to
 * the shared app state (localStorage in the demo, a `favorites` table in
 * production). Stops the click from following the surrounding card link.
 */
export function FavoriteButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const { isFavorite, toggleFavorite } = useAppState();
  const saved = isFavorite(slug);

  return (
    <button
      type="button"
      aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(slug);
      }}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-all hover:scale-110 hover:bg-background",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-5 transition-colors",
          saved ? "fill-rose-500 text-rose-500" : "text-foreground",
        )}
      />
    </button>
  );
}
