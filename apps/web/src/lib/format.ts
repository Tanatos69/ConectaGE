import type { Listing } from "./listings";

const currencyLabel: Record<Listing["currency"], string> = {
  XAF: "FCFA",
  USD: "$",
  EUR: "€",
};

/** Spanish-grouped number, e.g. 14500000 -> "14.500.000". */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-ES").format(value);
}

/**
 * Human price for a listing, handling free / on-request / fixed.
 * Returns the display string only; the "Negociable" hint is rendered
 * separately on the card.
 */
export function formatPrice(listing: Pick<Listing, "price" | "priceType" | "currency">): string {
  if (listing.priceType === "free") return "Gratis";
  if (listing.priceType === "on_request" || listing.price == null) return "A consultar";

  const amount = formatNumber(listing.price);
  return listing.currency === "XAF"
    ? `${amount} FCFA`
    : `${currencyLabel[listing.currency]}${amount}`;
}

export { currencyLabel };
