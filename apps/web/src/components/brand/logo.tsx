import Link from "next/link";
import { BRAND } from "@gemarket/shared";
import { cn } from "@/lib/utils";

/**
 * Brand wordmark + mark (name comes from BRAND, packages/shared/src/brand.ts).
 * The mark is a rounded "chat/connection" tile in brand blue — ties the
 * marketplace idea to the WhatsApp-first contact model.
 *
 * Admin-configurable via site settings: `logoUrl` replaces the whole mark
 * with an uploaded image; `siteName` replaces the wordmark text. The default
 * name keeps its two-tone treatment (BRAND.wordmark); a custom name renders plain.
 */
export function Logo({
  className,
  showText = true,
  siteName = BRAND.name,
  logoUrl = "",
}: {
  className?: string;
  showText?: boolean;
  siteName?: string;
  logoUrl?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={`${siteName} — Inicio`}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={siteName}
          className="h-9 max-w-36 object-contain transition-transform group-hover:scale-105"
        />
      ) : (
        <span className="relative inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-800 shadow-sm transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-5 text-primary-foreground"
            aria-hidden="true"
          >
            <path
              d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3.5V6a1 1 0 0 1 1-1Z"
              fill="currentColor"
            />
            <circle cx="9.5" cy="10.5" r="1.25" fill="rgba(255,255,255,0.30)" />
            <circle cx="14.5" cy="10.5" r="1.25" fill="rgba(255,255,255,0.30)" />
          </svg>
        </span>
      )}
      {showText && (
        <span className="text-lg font-extrabold tracking-tight text-foreground">
          {siteName === BRAND.name && BRAND.wordmark.accent ? (
            <>
              <span className="text-primary">{BRAND.wordmark.accent}</span>
              {BRAND.wordmark.rest}
            </>
          ) : (
            siteName
          )}
        </span>
      )}
    </Link>
  );
}
