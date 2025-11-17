import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const setLang = async (lng) => {
    await i18n.changeLanguage(lng); // immediate change
    try {
      localStorage.setItem("i18nextLng", lng);
    } catch (e) {}
  };

  const current =
    i18n.language || window.localStorage.getItem("i18nextLng") || "en";

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span>{t("change_language")}</span>
      <button
        onClick={() => setLang("en")}
        // aria-pressed={current.startsWith("en")}
      >
        English
      </button>
      <button
        onClick={() => setLang("es")}
        // aria-pressed={current.startsWith("es")}
      >
        Español
      </button>
    </div>
  );
}
