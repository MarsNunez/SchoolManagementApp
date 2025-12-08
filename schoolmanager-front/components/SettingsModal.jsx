"use client";

import { useEffect } from "react";

export default function SettingsModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const sections = [
    {
      title: "Preferences",
      items: [
        {
          label: "Appearance",
          desc: "Customize how the app looks on your device.",
          control: "Use system setting",
        },
      ],
    },
    {
      title: "Language & Time",
      items: [
        {
          label: "Language",
          desc: "Change the language used in the interface.",
          control: "English (US)",
        },
        {
          label: "Start week on Monday",
          desc: "This will change how all calendars in your app look.",
          control: "Toggle",
        },
        {
          label: "Set timezone automatically using your location",
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
      title: "Data & Export",
      items: [
        {
          label: "Export CSV",
          desc: "Download tables for students, teachers, sections and study plans.",
          control: "Actions",
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-[90vw] max-w-6xl h-[80vh] rounded-2xl bg-neutral-900 text-white shadow-2xl border border-neutral-800 overflow-hidden flex">
        {/* Sidebar */}
        <aside className="w-64 bg-neutral-950/80 border-r border-neutral-800 p-4 flex flex-col gap-2">
          <div className="text-sm font-semibold text-neutral-300 mb-2">
            Account
          </div>
          <button className="w-full text-left px-3 py-2 rounded-lg bg-neutral-800 text-white">
            Preferences
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800/60">
            Notifications
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800/60">
            Connections
          </button>

          <div className="text-sm font-semibold text-neutral-300 mt-4 mb-2">
            Workspace
          </div>
          <button className="w-full text-left px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800/60">
            General
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800/60">
            People
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800/60">
            Teams
          </button>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">Preferences</h2>
              <p className="text-sm text-neutral-400">
                Customize your experience
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white"
              aria-label="Close settings"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wide">
                  {section.title}
                </h3>
              </div>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-neutral-400">
                        {item.desc}
                      </div>
                    </div>
                    <div className="text-xs text-neutral-300">
                      {item.control === "Toggle" ? (
                        <div className="inline-flex items-center gap-2">
                          <div className="w-10 h-5 rounded-full bg-neutral-700 relative">
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-neutral-400"></div>
                          </div>
                          <span>Off</span>
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
    </div>
  );
}
