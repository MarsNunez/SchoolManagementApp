"use client";

import { useEffect } from "react";
import {
  getStoredTheme,
  getStoredLanguage,
  applyThemePreference,
  applyLanguagePreference,
} from "@/lib/preferences";

export default function PreferencesBootstrap() {
  useEffect(() => {
    const theme = getStoredTheme();
    const language = getStoredLanguage();
    applyThemePreference(theme);
    applyLanguagePreference(language);
  }, []);

  return null;
}

