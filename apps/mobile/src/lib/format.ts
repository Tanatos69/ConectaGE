import type { ListingRow } from "@conectage/shared";

const currencyLabel: Record<ListingRow["currency"], string> = {
  XAF: "FCFA",
  USD: "$",
  EUR: "€",
};

/** Spanish-grouped number, e.g. 14500000 -> "14.500.000". */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-ES").format(value);
}

/** Mirrors apps/web/src/lib/format.ts's formatPrice. */
export function formatPrice(listing: Pick<ListingRow, "price" | "price_type" | "currency">): string {
  if (listing.price_type === "free") return "Gratis";
  if (listing.price_type === "on_request" || listing.price == null) return "A consultar";

  const amount = formatNumber(listing.price);
  return listing.currency === "XAF" ? `${amount} FCFA` : `${currencyLabel[listing.currency]}${amount}`;
}
