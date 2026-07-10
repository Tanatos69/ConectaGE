import Link from "next/link";
import { Megaphone } from "lucide-react";

/**
 * Admin-configured site-wide announcement bar (site settings:
 * announcement_enabled/text/href). Rendered by the public layout only when
 * enabled and non-empty.
 */
export function AnnouncementBanner({ text, href }: { text: string; href?: string }) {
  const content = (
    <div className="flex items-center justify-center gap-2 bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground sm:text-sm">
      <Megaphone className="size-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }
  return content;
}
