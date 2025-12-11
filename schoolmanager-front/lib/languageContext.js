"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  getStoredLanguage,
  saveLanguagePreference,
  applyLanguagePreference,
  LANGUAGE_OPTIONS,
} from "./preferences";

const LanguageContext = createContext({
  language: "es",
  setLanguage: () => {},
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("es");

  useEffect(() => {
    const initial = getStoredLanguage();
    setLanguageState(initial);
  }, []);

  const setLanguage = (next) => {
    const normalized = LANGUAGE_OPTIONS.includes(next) ? next : "es";
    setLanguageState(normalized);
    saveLanguagePreference(normalized);
    applyLanguagePreference(normalized);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

