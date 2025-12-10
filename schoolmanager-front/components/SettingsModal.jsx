"use client";

import { useEffect, useState } from "react";
import {
  getStoredTheme,
  getStoredLanguage,
  applyThemePreference,
  applyLanguagePreference,
  saveThemePreference,
  saveLanguagePreference,
} from "@/lib/preferences";

export default function SettingsModal({ onClose }) {
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("es");
  const [saving, setSaving] = useState(false);

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

  const otherSections = [
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
  ];

  const onSave = () => {
    setSaving(true);
    try {
      saveThemePreference(theme);
      saveLanguagePreference(language);
      applyThemePreference(theme);
      applyLanguagePreference(language);
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
            Cuenta
          </div>
          <button className="w-full text-left px-3 py-2 rounded-lg bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-white">
            Preferencias
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60">
            Notificaciones
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60">
            Conexiones
          </button>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">Preferencias</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Personaliza tu experiencia
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              aria-label="Cerrar configuración"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          {/* Preferences section with real controls */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 uppercase tracking-wide">
                Preferencias
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-6">
                <div>
                  <div className="text-sm font-medium">Apariencia</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm">
                    Elige entre tema claro u oscuro, o sigue el tema del sistema.
                  </div>
                </div>
                <div className="text-xs text-neutral-700 dark:text-neutral-300">
                  <select
                    className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-neutral-50"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="system">Usar tema del sistema</option>
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Language & Time with language selector */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 uppercase tracking-wide">
                Idioma y tiempo
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-6">
                <div>
                  <div className="text-sm font-medium">Idioma</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm">
                    Cambia el idioma que se usa en la interfaz.
                  </div>
                </div>
                <div className="text-xs text-neutral-700 dark:text-neutral-300">
                  <select
                    className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-neutral-50"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="es">Español (predeterminado)</option>
                    <option value="en">English</option>
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
                              <span>Desactivado</span>
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
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
