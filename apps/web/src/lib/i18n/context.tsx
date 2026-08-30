"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { brandStorageKey, legacyStorageKey } from "@gemarket/shared";
import { languages, defaultLanguage, type Language } from "@/lib/languages";
import { es } from "./translations/es";
import { en } from "./translations/en";
import { fr } from "./translations/fr";
import { pt } from "./translations/pt";
import { ar } from "./translations/ar";
import { zh } from "./translations/zh";
import type { Translations } from "./types";

const allTranslations: Record<string, Translations> = { es, en, fr, pt, ar, zh };

const LANG_KEY = brandStorageKey("lang");
const LEGACY_LANG_KEY = legacyStorageKey("lang");

/** Read the saved language code, migrating the pre-rename key once. */
function readSavedLang(): string | null {
  const current = localStorage.getItem(LANG_KEY);
  if (current) return current;
  const legacy = localStorage.getItem(LEGACY_LANG_KEY);
  if (legacy) {
    localStorage.setItem(LANG_KEY, legacy);
    localStorage.removeItem(LEGACY_LANG_KEY);
    return legacy;
  }
  return null;
}

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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const saved = readSavedLang();
    if (saved) {
      const lang = languages.find((l) => l.code === saved);
      if (lang) {
        setLanguageState(lang);
        document.documentElement.dir = lang.dir;
        document.documentElement.lang = lang.code;
      }
    }
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    localStorage.setItem(LANG_KEY, lang.code);
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = lang.code;
  }

  function t(key: string): string {
    const translation = allTranslations[language.code] ?? es;
    const value = getNestedValue(translation as unknown as Record<string, unknown>, key);
    if (value !== key) return value;
    // fallback to Spanish
    return getNestedValue(es as unknown as Record<string, unknown>, key);
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used inside LanguageProvider");
  return ctx;
}
