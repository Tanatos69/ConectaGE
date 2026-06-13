"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Heart toggle on listing cards. In production this checks auth and persists
 * to the `favorites` table; for the demo it toggles local state and stops the
 * click from following the card link.
 */
export function FavoriteButton({ className }: { className?: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved((v) => !v);
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
