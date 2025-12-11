"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";

export default function Sidebar({ onOpenSettings }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [roleLabel, setRoleLabel] = useState("");
  const { language } = useLanguage();

  const labels =
    language === "en"
      ? {
          general: "OVERVIEW",
          settings: "SETTINGS",
          home: "Home",
          controlPanel: "Control Panel",
          config: "Settings",
          login: "Login",
          register: "Register",
          logout: "Logout",
          user: "User",
          guest: "Guest",
          collapseTitle: "Collapse",
          expandTitle: "Expand",
          logoutTitle: "Sign out",
          logoutBody:
            "Are you sure you want to sign out? You will need to log in again to continue.",
          cancel: "Cancel",
          confirmLogout: "Sign out",
        }
      : {
          general: "GENERAL",
          settings: "AJUSTES",
          home: "Inicio",
          controlPanel: "Panel de control",
          config: "Configuración",
          login: "Iniciar sesión",
          register: "Registrarse",
          logout: "Cerrar sesión",
          user: "Usuario",
          guest: "Invitado",
          collapseTitle: "Contraer",
          expandTitle: "Expandir",
          logoutTitle: "Cerrar sesión",
          logoutBody:
            "¿Seguro que quieres cerrar sesión? Tendrás que iniciar sesión de nuevo para continuar.",
          cancel: "Cancelar",
          confirmLogout: "Cerrar sesión",
        };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      setIsAuthed(!!token);
      setCollapsed(localStorage.getItem("sidebarCollapsed") === "1");
      try {
        const raw = localStorage.getItem("staffProfile");
        if (raw) {
          const prof = JSON.parse(raw);
          const role = String(prof?.role || "").toLowerCase();
          const map =
            language === "en"
              ? {
                  admin: "Admin",
                  secretary: "Secretary",
                  teacher: "Teacher",
                  student: "Student",
                }
              : {
                  admin: "Administrador",
                  secretary: "Secretaria",
                  teacher: "Profesor",
                  student: "Estudiante",
                };
          setRoleLabel(map[role] || "");
        } else {
          setRoleLabel("");
        }
      } catch (_) {
        setRoleLabel("");
      }
    }
  }, [pathname, language]);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("staffProfile");
    }
    setIsAuthed(false);
    router.push("/auth/login");
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
      }
      return next;
    });
  };

  const NavItem = ({ href, icon, label, onClick, className = "" }) => {
    const active = href ? pathname === href : false;
    const content = (
      <div
        className={`flex gap-3 ${
          collapsed && "flex-col items-center text-center"
        }`}
      >
        <i
          className={`${icon} ${collapsed && "text-[em]"} text-[1rem] w-5`}
        ></i>
        <span className={`${collapsed ? "text-[10px]" : "text-[1rem]"}`}>
          {label}
        </span>
      </div>
    );
    const base = `nav-link ${collapsed ? "flex-col items-center" : ""} ${
      active ? "nav-link-active" : ""
    } ${className}`;
    if (href) {
      return (
        <Link href={href} className={base}>
          {content}
        </Link>
      );
    }
    return (
      <button onClick={onClick} className={base + " text-left"}>
        {content}
      </button>
    );
  };

  return (
    <>
      <aside
        className={`h-dvh sticky top-0 duration-300 ${
          collapsed ? "w-20" : "w-60"
        } border-r border-neutral-200/40 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/60 backdrop-blur-md p-4 hidden md:flex md:flex-col`}
      >
      {/* Brand */}
      <div
        className={`mb-4 flex items-center ${
          collapsed ? "justify-center" : "gap-3 px-1"
        }`}
      >
        <div className="h-9 w-9 rounded-xl bg-indigo-600/10 grid place-items-center">
          <i className="fa-solid fa-plus text-indigo-600"></i>
        </div>
        {!collapsed && (
          <div className="mr-auto">
            <div className="text-sm font-semibold">SchoolManager</div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 border border-neutral-500 rounded px-2 py-0.5 inline-flex items-center gap-1">
              {roleLabel || (isAuthed ? labels.user : labels.guest)}
            </div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={toggleCollapsed}
            className="h-8 w-8 rounded-md grid place-items-center hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title={labels.collapseTitle}
          >
            <i className="fa-solid fa-angles-left"></i>
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="mb-4 h-8 w-8 rounded-md grid place-items-center hover:bg-neutral-100 dark:hover:bg-neutral-800 self-center"
          title={labels.expandTitle}
        >
          <i className="fa-solid fa-angles-right"></i>
        </button>
      )}

      {/* Overview section */}
      <div
        className={`text-xs font-medium text-neutral-400 px-1 mb-2 ${
          collapsed ? "hidden" : ""
        }`}
      >
        {labels.general}
      </div>
      <nav className="flex flex-col gap-1">
        <NavItem href="/" icon="fa-solid fa-house" label={labels.home} />
        {isAuthed && (
          <NavItem
            href="/controlPanel"
            icon="fa-solid fa-table-columns"
            label={labels.controlPanel}
          />
        )}
      </nav>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Settings */}
      <div
        className={`text-xs font-medium text-neutral-400 px-1 mb-2 ${
          collapsed ? "hidden" : ""
        }`}
      >
        {labels.settings}
      </div>
      <nav className="flex flex-col text-[1rem]">
        {isAuthed && (
          <NavItem
            icon="fa-solid fa-gear"
            label={labels.config}
            onClick={() => (onOpenSettings ? onOpenSettings() : null)}
            className="cursor-pointer"
          />
        )}
        {!isAuthed ? (
          <>
            <NavItem
              href="/auth/login"
              icon="fa-solid fa-right-to-bracket"
              label={labels.login}
              className="text-blue-600"
            />
            <NavItem
              href="/auth/register"
              icon="fa-solid fa-user-plus"
              label={labels.register}
              className="text-emerald-600"
            />
          </>
        ) : (
          <NavItem
            onClick={() => setShowLogoutConfirm(true)}
            icon="fa-solid fa-right-from-bracket"
            label={labels.logout}
            className="text-red-500 cursor-pointer "
          />
        )}
      </nav>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          ></div>
          <div className="relative w-full max-w-sm rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-5 space-y-4">
            <h2 className="text-lg font-semibold">{labels.logoutTitle}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {labels.logoutBody}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="btn-danger text-sm"
              >
                {labels.confirmLogout}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
