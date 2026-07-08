/** Pure date-formatting helpers — safe to import from client components. */

/** Spanish relative label for a timestamp, e.g. "Hace 2 horas". */
export function postedLabel(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.max(1, Math.floor(diffMs / 60_000));
  if (min < 60) return `Hace ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Hace ${days} día${days !== 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  return `Hace ${months} mes${months !== 1 ? "es" : ""}`;
}

/** "Enero 2025"-style label used by memberSince fields. */
export function monthYearLabel(iso: string): string {
  const label = new Date(iso).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
