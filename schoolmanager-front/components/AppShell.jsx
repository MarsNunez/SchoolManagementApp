"use client";

import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import SettingsModal from "./SettingsModal.jsx";
import PreferencesBootstrap from "./PreferencesBootstrap.jsx";

export default function AppShell({ children }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <PreferencesBootstrap />
      <div className="min-h-dvh flex">
        <Sidebar onOpenSettings={() => setShowSettings(true)} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
