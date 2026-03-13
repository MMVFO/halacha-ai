"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { translations, type Language, type TranslationStrings } from "./translations";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationStrings) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "halacha-ai-lang";

function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const nav = navigator.language || "";
  if (nav.startsWith("he")) return "he";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && (stored === "en" || stored === "he")) {
      setLanguageState(stored);
    } else {
      setLanguageState(detectBrowserLanguage());
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    if (language === "he") {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  }, [language, mounted]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: keyof TranslationStrings): string => {
      return translations[language][key] || translations.en[key] || key;
    },
    [language]
  );

  const dir = language === "he" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Return a fallback for components outside the provider
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: (key: keyof TranslationStrings) => translations.en[key] || key,
      dir: "ltr" as const,
    };
  }
  return ctx;
}
