"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [roleLabel, setRoleLabel] = useState("");

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
          const map = {
            admin: "Admin",
            secretary: "Secretary",
            teacher: "Teacher",
            student: "Student",
          };
          setRoleLabel(map[role] || "");
        } else {
          setRoleLabel("");
        }
      } catch (_) {
        setRoleLabel("");
      }
    }
  }, [pathname]);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("staffProfile");
    }
    setIsAuthed(false);
    router.push("/login");
  };

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
    <aside
      className={`h-dvh sticky top-0 duration-300 ${
        collapsed ? "w-20" : "w-60"
      } border-r border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur p-4 hidden md:flex md:flex-col`}
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
              {roleLabel || (isAuthed ? "User" : "Guest")}
            </div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={toggleCollapsed}
            className="h-8 w-8 rounded-md grid place-items-center hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Collapse"
          >
            <i className="fa-solid fa-angles-left"></i>
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="mb-4 h-8 w-8 rounded-md grid place-items-center hover:bg-neutral-100 dark:hover:bg-neutral-800 self-center"
          title="Expand"
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
        OVERVIEW
      </div>
      <nav className="flex flex-col gap-1">
        <NavItem href="/" icon="fa-solid fa-house" label="Home" />
        {isAuthed && (
          <NavItem
            href="/controlPanel"
            icon="fa-solid fa-table-columns"
            label="Control Panel"
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
        SETTINGS
      </div>
      <nav className="flex flex-col text-[1rem]">
        <NavItem href="#" icon="fa-solid fa-gear" label="Settings" />
        {!isAuthed ? (
          <NavItem
            href="/login"
            icon="fa-solid fa-right-to-bracket"
            label="Login"
            className="text-blue-600"
          />
        ) : (
          <NavItem
            onClick={logout}
            icon="fa-solid fa-right-from-bracket"
            label="Logout"
            className="text-red-500 cursor-pointer "
          />
        )}
      </nav>
    </aside>
  );
}
