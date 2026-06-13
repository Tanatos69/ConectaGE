export interface Language {
  code: string;
  label: string;
  flag: string;
  dir: "ltr" | "rtl";
}

/** Six supported languages (Spanish default, Arabic is RTL). */
export const languages: Language[] = [
  { code: "es", label: "Español", flag: "🇬🇶", dir: "ltr" },
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "pt", label: "Português", flag: "🇵🇹", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "zh", label: "中文", flag: "🇨🇳", dir: "ltr" },
];

export const defaultLanguage = languages[0];
