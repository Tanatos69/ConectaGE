import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { I18nManager } from "react-native";
import { languages, defaultLanguage, type Language } from "./languages";
import { es } from "./translations/es";
import { en } from "./translations/en";
import { fr } from "./translations/fr";
import { pt } from "./translations/pt";
import { ar } from "./translations/ar";
import { zh } from "./translations/zh";
import type { Translations } from "./types";

const allTranslations: Record<string, Translations> = { es, en, fr, pt, ar, zh };
const STORAGE_KEY = "conectage-lang";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
  return typeof value === "string" ? value : path;
}

/** First-launch-only: map the device locale to the nearest supported language. */
function detectDeviceLanguage(): Language {
  const deviceCode = Localization.getLocales()[0]?.languageCode ?? "es";
  return languages.find((l) => l.code === deviceCode) ?? defaultLanguage;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      const lang = saved ? languages.find((l) => l.code === saved) : detectDeviceLanguage();
      if (lang) {
        setLanguageState(lang);
        // RTL only fully applies after a reload — same constraint everywhere
        // in React Native, not specific to this app.
        if (lang.dir === "rtl" !== I18nManager.isRTL) I18nManager.forceRTL(lang.dir === "rtl");
      }
    });
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang.code);
    if (lang.dir === "rtl" !== I18nManager.isRTL) I18nManager.forceRTL(lang.dir === "rtl");
  }

  function t(key: string): string {
    const translation = allTranslations[language.code] ?? es;
    const value = getNestedValue(translation as unknown as Record<string, unknown>, key);
    if (value !== key) return value;
    return getNestedValue(es as unknown as Record<string, unknown>, key);
  }

  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used inside LanguageProvider");
  return ctx;
}
