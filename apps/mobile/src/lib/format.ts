import type { ListingRow } from "@gemarket/shared";

const currencyLabel: Record<ListingRow["currency"], string> = {
  XAF: "FCFA",
  USD: "$",
  EUR: "€",
};

/** Spanish-grouped number, e.g. 14500000 -> "14.500.000". */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-ES").format(value);
}

/** Relative "hace X" label in Spanish, mirroring web's time.ts postedLabel. */
export function postedLabel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `hace ${weeks} sem`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months > 1 ? "es" : ""}`;
  return new Date(iso).toLocaleDateString("es-ES");
}

/** Mirrors apps/web/src/lib/format.ts's formatPrice. */
export function formatPrice(listing: Pick<ListingRow, "price" | "price_type" | "currency">): string {
  if (listing.price_type === "free") return "Gratis";
  if (listing.price_type === "on_request" || listing.price == null) return "A consultar";

  const amount = formatNumber(listing.price);
  return listing.currency === "XAF" ? `${amount} FCFA` : `${currencyLabel[listing.currency]}${amount}`;
}
