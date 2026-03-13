"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "../i18n/context";
import type { Language } from "../i18n/translations";

export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { value: Language; label: string; flag: string }[] = [
    { value: "en", label: t("english"), flag: "EN" },
    { value: "he", label: t("hebrew"), flag: "\u05E2\u05D1" },
  ];

  return (
    <div className="lang-selector" ref={ref}>
      <button
        className="lang-selector-btn"
        onClick={() => setOpen(!open)}
        aria-label={t("switchLanguage")}
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="lang-selector-current">{language === "en" ? "EN" : "\u05E2\u05D1"}</span>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5 }}>
          <path d="M8 11L3 6h10z" />
        </svg>
      </button>
      {open && (
        <div className="lang-selector-dropdown">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`lang-selector-option ${language === opt.value ? "active" : ""}`}
              onClick={() => {
                setLanguage(opt.value);
                setOpen(false);
              }}
            >
              <span className="lang-selector-flag">{opt.flag}</span>
              <span>{opt.label}</span>
              {language === opt.value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto" }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
