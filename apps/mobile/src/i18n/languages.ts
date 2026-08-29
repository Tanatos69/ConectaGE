export interface Language {
  code: string;
  label: string;
  dir: "ltr" | "rtl";
}

/** Same six languages as apps/web/src/lib/languages.ts (Spanish default, Arabic RTL). */
export const languages: Language[] = [
  { code: "es", label: "Español", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "zh", label: "中文", dir: "ltr" },
];

export const defaultLanguage = languages[0];
