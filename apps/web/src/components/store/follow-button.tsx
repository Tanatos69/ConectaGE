"use client";

import { useRouter, usePathname } from "next/navigation";
import { Heart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFollows } from "@/lib/store/follows-context";
import { useTranslation } from "@/lib/i18n/context";

/**
 * Follow/unfollow a vendor store. Persists to the real `store_follows` table
 * (via FollowsProvider) so followers can be notified when the store posts.
 * Used on the store directory cards and the store header. Stops propagation
 * so it can sit inside a linked card.
 */
export function FollowButton({
  slug,
  className,
  size = "default",
}: {
  slug: string;
  className?: string;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isFollowing, toggleFollow } = useFollows();
  const { t } = useTranslation();
  const following = isFollowing(slug);

  return (
    <button
      type="button"
      aria-pressed={following}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const ok = await toggleFollow(slug);
        if (!ok) router.push(`/login?next=${encodeURIComponent(pathname)}`);
      }}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all active:scale-[0.98]",
        size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-5 text-sm",
        following
          ? "border border-input bg-secondary text-foreground hover:bg-secondary/70"
          : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        className,
      )}
    >
      {following ? (
        <>
          <Check className={size === "sm" ? "size-3.5" : "size-4"} />
          {t("stores.following")}
        </>
      ) : (
        <>
          <Heart className={size === "sm" ? "size-3.5" : "size-4"} />
          {t("stores.follow")}
        </>
      )}
    </button>
  );
}
