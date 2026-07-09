"use client";

import { useRouter, usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/store/favorites-context";

/**
 * Heart toggle on listing cards and detail pages. Persists to the real
 * `listing_favorites` table (via FavoritesProvider) so sellers can see a
 * real like count on their own listings. Stops the click from following the
 * surrounding card link.
 */
export function FavoriteButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(slug);

  return (
    <button
      type="button"
      aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
      aria-pressed={saved}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const ok = await toggleFavorite(slug);
        if (!ok) router.push(`/login?next=${encodeURIComponent(pathname)}`);
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
