// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations (small apps can keep JSON in src; large apps lazy-load)
import en from "./locales/en.json";
import es from "./locales/es.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
};

i18n
  .use(LanguageDetector) // reads from localStorage, navigator, etc.
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,
    detection: {
      // prefer localStorage, then navigator
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],           // stores selected language in localStorage
      lookupLocalStorage: "i18nextLng",
    },
    interpolation: { escapeValue: false }, // React already escapes
  });

export default i18n;
