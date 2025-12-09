"use client";

const THEME_KEY = "sm:theme";
const LANGUAGE_KEY = "sm:language";

export const THEME_OPTIONS = ["system", "light", "dark"];
export const LANGUAGE_OPTIONS = ["es", "en"];

export const getStoredTheme = () => {
  if (typeof window === "undefined") return "system";
  const value = window.localStorage.getItem(THEME_KEY);
  return THEME_OPTIONS.includes(value) ? value : "system";
};

export const getStoredLanguage = () => {
  if (typeof window === "undefined") return "es";
  const value = window.localStorage.getItem(LANGUAGE_KEY);
  return LANGUAGE_OPTIONS.includes(value) ? value : "es";
};

export const saveThemePreference = (theme) => {
  if (typeof window === "undefined") return;
  if (!THEME_OPTIONS.includes(theme)) return;
  window.localStorage.setItem(THEME_KEY, theme);
};

export const saveLanguagePreference = (language) => {
  if (typeof window === "undefined") return;
  if (!LANGUAGE_OPTIONS.includes(language)) return;
  window.localStorage.setItem(LANGUAGE_KEY, language);
};

export const applyThemePreference = (theme) => {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)"
  )?.matches;

  const effective =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  if (effective === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  try {
    root.dataset.theme = effective;
  } catch {
    // ignore
  }
};

export const applyLanguagePreference = (language) => {
  if (typeof window === "undefined") return;
  const lang = LANGUAGE_OPTIONS.includes(language) ? language : "es";
  try {
    document.documentElement.lang = lang;
  } catch {
    // ignore
  }
};
