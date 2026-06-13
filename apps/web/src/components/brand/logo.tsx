import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * ConectaGE wordmark + mark.
 * The mark is a rounded "chat/connection" tile in brand blue — ties the
 * "Conecta" (connect) idea to the WhatsApp-first contact model.
 */
export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="ConectaGE — Inicio"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
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
      {showText && (
        <span className="text-lg font-extrabold tracking-tight text-foreground">
          Conecta<span className="text-primary">GE</span>
        </span>
      )}
    </Link>
  );
}
