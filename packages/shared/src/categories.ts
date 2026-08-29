/**
 * Categories + tones for the mobile app. Mirrors the slugs/names in
 * apps/web/src/lib/categories.ts, but stays framework-free: it carries an
 * Ionicons name (not a FontAwesome object) and tone *colors* (not Tailwind
 * class strings), so React Native can render tinted category tiles directly.
 * Web keeps its own copy untouched — slugs are the shared contract.
 */

export type CategoryTone =
  | "blue"
  | "emerald"
  | "violet"
  | "amber"
  | "rose"
  | "cyan"
  | "orange"
  | "pink"
  | "indigo"
  | "teal"
  | "red"
  | "sky"
  | "slate"
  | "fuchsia";

export interface Category {
  slug: string;
  /** Ionicons glyph name (from @expo/vector-icons). */
  icon: string;
  name: string;
  tone: CategoryTone;
}

export const categories: Category[] = [
  { slug: "vehiculos",    icon: "car-sport-outline", name: "Vehículos",           tone: "blue" },
  { slug: "inmobiliaria", icon: "home-outline",      name: "Inmobiliaria",        tone: "emerald" },
  { slug: "electronica",  icon: "laptop-outline",    name: "Electrónica",         tone: "indigo" },
  { slug: "empleo",       icon: "briefcase-outline", name: "Empleo",              tone: "slate" },
  { slug: "muebles",      icon: "bed-outline",       name: "Muebles y Hogar",     tone: "rose" },
  { slug: "moda",         icon: "shirt-outline",     name: "Moda",                tone: "amber" },
  { slug: "servicios",    icon: "construct-outline", name: "Servicios",           tone: "rose" },
  { slug: "salud",        icon: "medkit-outline",    name: "Salud y Belleza",     tone: "emerald" },
  { slug: "educacion",    icon: "school-outline",    name: "Educación",           tone: "indigo" },
  { slug: "deporte",      icon: "barbell-outline",   name: "Deporte y Ocio",      tone: "rose" },
  { slug: "restaurantes", icon: "restaurant-outline",name: "Restaurantes",        tone: "emerald" },
  { slug: "turismo",      icon: "airplane-outline",  name: "Turismo",             tone: "amber" },
  { slug: "finanzas",     icon: "cash-outline",      name: "Finanzas y Empresas", tone: "blue" },
  { slug: "varios",       icon: "cube-outline",      name: "Otros / Varios",      tone: "slate" },
];

/** Soft tinted background + strong foreground per tone (light theme values). */
export const toneColors: Record<CategoryTone, { bg: string; fg: string }> = {
  blue:    { bg: "#EFF6FF", fg: "#2563EB" },
  emerald: { bg: "#ECFDF5", fg: "#059669" },
  violet:  { bg: "#EEF2FF", fg: "#4F46E5" },
  amber:   { bg: "#FFFBEB", fg: "#D97706" },
  rose:    { bg: "#FFF1F2", fg: "#E11D48" },
  cyan:    { bg: "#ECFEFF", fg: "#0891B2" },
  orange:  { bg: "#FFF7ED", fg: "#EA580C" },
  pink:    { bg: "#FDF2F8", fg: "#DB2777" },
  indigo:  { bg: "#EEF2FF", fg: "#4F46E5" },
  teal:    { bg: "#F0FDFA", fg: "#0D9488" },
  red:     { bg: "#FEF2F2", fg: "#DC2626" },
  sky:     { bg: "#F0F9FF", fg: "#0284C7" },
  slate:   { bg: "#F1F5F9", fg: "#475569" },
  fuchsia: { bg: "#FDF4FF", fg: "#C026D3" },
};

/** Dark-theme tone tints (muted backgrounds, brighter foregrounds). */
export const toneColorsDark: Record<CategoryTone, { bg: string; fg: string }> = {
  blue:    { bg: "#1E293B", fg: "#60A5FA" },
  emerald: { bg: "#14261F", fg: "#34D399" },
  violet:  { bg: "#1E1B33", fg: "#A5B4FC" },
  amber:   { bg: "#2A2010", fg: "#FBBF24" },
  rose:    { bg: "#2A1620", fg: "#FB7185" },
  cyan:    { bg: "#0E2429", fg: "#22D3EE" },
  orange:  { bg: "#2A1A0E", fg: "#FB923C" },
  pink:    { bg: "#2A1522", fg: "#F472B6" },
  indigo:  { bg: "#1E1B33", fg: "#A5B4FC" },
  teal:    { bg: "#0E2523", fg: "#2DD4BF" },
  red:     { bg: "#2A1414", fg: "#F87171" },
  sky:     { bg: "#0E1F2E", fg: "#38BDF8" },
  slate:   { bg: "#1E293B", fg: "#94A3B8" },
  fuchsia: { bg: "#271429", fg: "#E879F9" },
};

export const DEFAULT_TONE: CategoryTone = "slate";

export const toneBySlug: Record<string, CategoryTone> = Object.fromEntries(
  categories.map((c) => [c.slug, c.tone]),
);

export const categoryBySlug: Record<string, Category> = Object.fromEntries(
  categories.map((c) => [c.slug, c]),
);

/** Categories where sellers stock multiples — publish form shows a quantity field. */
export const QUANTITY_CATEGORIES = new Set(["electronica", "moda", "muebles", "salud", "varios"]);
