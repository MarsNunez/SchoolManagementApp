"use client";

import { useEffect, useState } from "react";
import {
  getStoredTheme,
  getStoredLanguage,
  applyThemePreference,
  saveThemePreference,
} from "@/lib/preferences";
import { useLanguage } from "@/lib/languageContext";

export default function SettingsModal({ onClose }) {
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("es");
  const [saving, setSaving] = useState(false);
  const { language: appLanguage, setLanguage: setGlobalLanguage } =
    useLanguage();

  const isEn = appLanguage === "en";

  const ui = isEn
    ? {
        sidebarAccount: "Account",
        sidebarPreferences: "Preferences",
        sidebarNotifications: "Notifications",
        sidebarConnections: "Connections",
        headerTitle: "Preferences",
        headerSubtitle: "Customize your experience",
        closeAria: "Close settings",
        prefSectionTitle: "Preferences",
        appearanceLabel: "Appearance",
        appearanceDesc:
          "Choose between light or dark mode, or follow your system theme.",
        themeSystem: "Use system theme",
        themeLight: "Light",
        themeDark: "Dark",
        langSectionTitle: "Language & time",
        languageLabel: "Language",
        languageDesc: "Change the language used in the interface.",
        languageEsOption: "Spanish",
        languageEnOption: "English",
        otherSections: [
          {
            title: "Language & time",
            items: [
              {
                label: "Start week on Monday",
                desc: "This will change how all calendars in your app look.",
                control: "Toggle",
              },
              {
                label: "Set timezone automatically",
                desc: "Reminders, notifications and emails are delivered based on your time zone.",
                control: "Toggle",
              },
              {
                label: "Timezone",
                desc: "Current timezone setting.",
                control: "(GMT-5:00) Lima",
              },
            ],
          },
          {
            title: "Notifications",
            items: [
              {
                label: "Email updates",
                desc: "Receive summaries of changes in courses, sections and study plans.",
                control: "Toggle",
              },
              {
                label: "Mentions & alerts",
                desc: "Notify me when I’m assigned or tagged in items.",
                control: "Toggle",
              },
            ],
          },
          {
            title: "Data & export",
            items: [
              {
                label: "Export CSV",
                desc: "Download tables for students, teachers, sections and study plans.",
                control: "Actions",
              },
            ],
          },
        ],
        toggleOff: "Off",
        savingLabel: "Saving...",
        saveChanges: "Save changes",
      }
    : {
        sidebarAccount: "Cuenta",
        sidebarPreferences: "Preferencias",
        sidebarNotifications: "Notificaciones",
        sidebarConnections: "Conexiones",
        headerTitle: "Preferencias",
        headerSubtitle: "Personaliza tu experiencia",
        closeAria: "Cerrar configuración",
        prefSectionTitle: "Preferencias",
        appearanceLabel: "Apariencia",
        appearanceDesc:
          "Elige entre tema claro u oscuro, o sigue el tema del sistema.",
        themeSystem: "Usar tema del sistema",
        themeLight: "Claro",
        themeDark: "Oscuro",
        langSectionTitle: "Idioma y tiempo",
        languageLabel: "Idioma",
        languageDesc: "Cambia el idioma que se usa en la interfaz.",
        languageEsOption: "Español",
        languageEnOption: "English",
        otherSections: [
          {
            title: "Idioma y tiempo",
            items: [
              {
                label: "Iniciar la semana en lunes",
                desc: "Esto cambiará cómo se ven todos los calendarios en la aplicación.",
                control: "Toggle",
              },
              {
                label: "Definir zona horaria automáticamente",
                desc: "Recordatorios, notificaciones y correos se envían según tu zona horaria.",
                control: "Toggle",
              },
              {
                label: "Zona horaria",
                desc: "Zona horaria actual.",
                control: "(GMT-5:00) Lima",
              },
            ],
          },
          {
            title: "Notificaciones",
            items: [
              {
                label: "Actualizaciones por correo",
                desc: "Recibe resúmenes de cambios en cursos, secciones y planes de estudio.",
                control: "Toggle",
              },
              {
                label: "Menciones y alertas",
                desc: "Avísame cuando me asignen o etiqueten en elementos.",
                control: "Toggle",
              },
            ],
          },
          {
            title: "Datos y exportación",
            items: [
              {
                label: "Exportar CSV",
                desc: "Descarga tablas de estudiantes, profesores, secciones y planes de estudio.",
                control: "Acciones",
              },
            ],
          },
        ],
        toggleOff: "Desactivado",
        savingLabel: "Guardando...",
        saveChanges: "Guardar cambios",
      };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    // Load current preferences when the modal opens
    const currentTheme = getStoredTheme();
    const currentLanguage = getStoredLanguage();
    setTheme(currentTheme);
    setLanguage(currentLanguage);
  }, []);

  const otherSections = ui.otherSections;

  const onSave = () => {
    setSaving(true);
    try {
      saveThemePreference(theme);
      applyThemePreference(theme);
      if (setGlobalLanguage) {
        setGlobalLanguage(language);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-[90vw] max-w-6xl h-[80vh] rounded-2xl bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-2xl border border-neutral-200/60 dark:border-neutral-800 overflow-hidden flex">
        {/* Sidebar */}
        <aside className="w-64 bg-neutral-100/80 dark:bg-neutral-950/80 border-r border-neutral-200/60 dark:border-neutral-800 p-4 flex flex-col gap-2">
          <div className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-2">
            {ui.sidebarAccount}
          </div>
          <button className="w-full text-left px-3 py-2 rounded-lg bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-white">
            {ui.sidebarPreferences}
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60">
            {ui.sidebarNotifications}
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60">
            {ui.sidebarConnections}
          </button>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{ui.headerTitle}</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {ui.headerSubtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              aria-label={ui.closeAria}
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          {/* Preferences section with real controls */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 uppercase tracking-wide">
                {ui.prefSectionTitle}
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-6">
                <div>
                  <div className="text-sm font-medium">
                    {ui.appearanceLabel}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm">
                    {ui.appearanceDesc}
                  </div>
                </div>
                <div className="text-xs text-neutral-700 dark:text-neutral-300">
                  <select
                    className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-neutral-50"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="system">{ui.themeSystem}</option>
                    <option value="light">{ui.themeLight}</option>
                    <option value="dark">{ui.themeDark}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Language & Time with language selector */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 uppercase tracking-wide">
                {ui.langSectionTitle}
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-6">
                <div>
                  <div className="text-sm font-medium">{ui.languageLabel}</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm">
                    {ui.languageDesc}
                  </div>
                </div>
                <div className="text-xs text-neutral-700 dark:text-neutral-300">
                  <select
                    className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-neutral-50"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="es">{ui.languageEsOption}</option>
                    <option value="en">{ui.languageEnOption}</option>
                  </select>
                </div>
              </div>

              {otherSections.map((section) => (
                <div key={section.title} className="space-y-4">
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-start"
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {item.label}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {item.desc}
                          </div>
                        </div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-300">
                          {item.control === "Toggle" ? (
                            <div className="inline-flex items-center gap-2">
                              <div className="w-10 h-5 rounded-full bg-neutral-300 dark:bg-neutral-700 relative">
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white dark:bg-neutral-400"></div>
                              </div>
                              <span>{ui.toggleOff}</span>
                            </div>
                          ) : (
                            item.control
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-4">
            <button
              type="button"
              onClick={onSave}
              className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? ui.savingLabel : ui.saveChanges}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
