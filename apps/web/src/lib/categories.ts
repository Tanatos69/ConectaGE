import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faCar,
  faHouse,
  faLaptop,
  faBriefcase,
  faCouch,
  faShirt,
  faWrench,
  faHeartPulse,
  faGraduationCap,
  faDumbbell,
  faUtensils,
  faHotel,
  faLandmark,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

/**
 * The 14 top-level categories (mirrors the DB seed in DATABASE-SCHEMA.md).
 * `tone` drives the soft tinted tile background on the home category grid.
 * `count` is demo data for the presentation phase only.
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
  icon: IconDefinition;
  iconName: string;
  name: string;
  count: number;
  tone: CategoryTone;
}

export const categories: Category[] = [
  { slug: "vehiculos",    icon: faCar,           iconName: "faCar",           name: "Vehículos",          count: 1284, tone: "blue" },
  { slug: "inmobiliaria", icon: faHouse,          iconName: "faHouse",         name: "Inmobiliaria",        count: 962,  tone: "emerald" },
  { slug: "electronica",  icon: faLaptop,         iconName: "faLaptop",        name: "Electrónica",         count: 1547, tone: "indigo" },
  { slug: "empleo",       icon: faBriefcase,      iconName: "faBriefcase",     name: "Empleo",              count: 438,  tone: "slate" },
  { slug: "muebles",      icon: faCouch,          iconName: "faCouch",         name: "Muebles y Hogar",     count: 671,  tone: "rose" },
  { slug: "moda",         icon: faShirt,          iconName: "faShirt",         name: "Moda",                count: 845,  tone: "amber" },
  { slug: "servicios",    icon: faWrench,         iconName: "faWrench",        name: "Servicios",           count: 529,  tone: "rose" },
  { slug: "salud",        icon: faHeartPulse,     iconName: "faHeartPulse",    name: "Salud y Belleza",     count: 312,  tone: "emerald" },
  { slug: "educacion",    icon: faGraduationCap,  iconName: "faGraduationCap", name: "Educación",           count: 274,  tone: "indigo" },
  { slug: "deporte",      icon: faDumbbell,       iconName: "faDumbbell",      name: "Deporte y Ocio",      count: 398,  tone: "rose" },
  { slug: "restaurantes", icon: faUtensils,       iconName: "faUtensils",      name: "Restaurantes",        count: 221,  tone: "emerald" },
  { slug: "turismo",      icon: faHotel,          iconName: "faHotel",         name: "Turismo",             count: 186,  tone: "amber" },
  { slug: "finanzas",     icon: faLandmark,       iconName: "faLandmark",      name: "Finanzas y Empresas", count: 143,  tone: "blue" },
  { slug: "varios",       icon: faBoxOpen,        iconName: "faBoxOpen",       name: "Otros / Varios",      count: 507,  tone: "slate" },
];

/** Tailwind classes per tone for the category tiles (icon chip + hover ring). */
export const toneStyles: Record<CategoryTone, { chip: string; hover: string }> = {
  blue:    { chip: "bg-blue-50 text-blue-600",     hover: "hover:border-blue-200 hover:bg-blue-50/50" },
  emerald: { chip: "bg-emerald-50 text-emerald-600", hover: "hover:border-emerald-200 hover:bg-emerald-50/50" },
  indigo:  { chip: "bg-indigo-50 text-indigo-600", hover: "hover:border-indigo-200 hover:bg-indigo-50/50" },
  slate:   { chip: "bg-slate-100 text-slate-600",  hover: "hover:border-slate-200 hover:bg-slate-50" },
  rose:    { chip: "bg-rose-50 text-rose-600",     hover: "hover:border-rose-200 hover:bg-rose-50/50" },
  amber:   { chip: "bg-amber-50 text-amber-600",   hover: "hover:border-amber-200 hover:bg-amber-50/50" },
  violet:  { chip: "bg-indigo-50 text-indigo-600", hover: "hover:border-indigo-200 hover:bg-indigo-50/50" },
  cyan:    { chip: "bg-blue-50 text-blue-600",     hover: "hover:border-blue-200 hover:bg-blue-50/50" },
  orange:  { chip: "bg-amber-50 text-amber-600",   hover: "hover:border-amber-200 hover:bg-amber-50/50" },
  pink:    { chip: "bg-rose-50 text-rose-600",     hover: "hover:border-rose-200 hover:bg-rose-50/50" },
  teal:    { chip: "bg-emerald-50 text-emerald-600", hover: "hover:border-emerald-200 hover:bg-emerald-50/50" },
  red:     { chip: "bg-rose-50 text-rose-600",     hover: "hover:border-rose-200 hover:bg-rose-50/50" },
  sky:     { chip: "bg-blue-50 text-blue-600",     hover: "hover:border-blue-200 hover:bg-blue-50/50" },
  fuchsia: { chip: "bg-slate-100 text-slate-600",  hover: "hover:border-slate-200 hover:bg-slate-50" },
};

/** Categories where sellers typically stock multiples of the same item —
 * these show a "quantity available" field on the listing form. */
export const QUANTITY_CATEGORIES = new Set(["electronica", "moda", "muebles", "salud", "varios"]);

/**
 * Categories now live in a real `categories` table (migration 0011) so
 * admin edits are genuinely live site-wide — but `tone` (tile color) is
 * pure presentation with no DB column, and the DB only stores the FontAwesome
 * icon *name* string, not the renderable icon object. Both stay resolved
 * from this static file, keyed by slug — slugs are stable regardless of
 * which system (DB row vs. this array) is the source of truth for a given
 * category's existence/name.
 */
export const toneBySlug: Record<string, CategoryTone> = Object.fromEntries(
  categories.map((c) => [c.slug, c.tone]),
);
export const DEFAULT_TONE: CategoryTone = "slate";

export const iconByName: Record<string, IconDefinition> = Object.fromEntries(
  categories.map((c) => [c.iconName, c.icon]),
);
export const AVAILABLE_ICONS = categories.map((c) => c.iconName);
export const DEFAULT_ICON_NAME = "faBoxOpen";

/**
 * The multi-language surfaces (header, footer, homepage) show category
 * names via i18n `t("categories.<slug>")` keys, not the DB `name` column —
 * that column is effectively the Spanish/admin-facing name, while a real
 * translation into 6 languages is a separate, human task. Prefer the
 * translation; fall back to the DB name only when no translation key
 * exists yet (t() echoes the raw key back unresolved in that case — e.g.
 * for a category an admin just added through the CRUD).
 */
export function translatedCategoryName(
  t: (key: string) => string,
  slug: string,
  dbName: string,
): string {
  const key = `categories.${slug}`;
  const translated = t(key);
  return translated === key ? dbName : translated;
}
