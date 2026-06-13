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
