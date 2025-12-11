"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/languageContext";

export default function ControlPanel() {
  const [role, setRole] = useState("");
  const { language } = useLanguage();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("staffProfile");
        if (raw) {
          const prof = JSON.parse(raw);
          setRole(String(prof?.role || "").toLowerCase());
        }
      } catch {
        setRole("");
      }
    }
  }, []);

  const cards =
    language === "en"
      ? [
          {
            href: "/controlPanel/teachers",
            title: "Teachers",
            desc: "Manage teacher records",
            color: "bg-indigo-600",
            tint: "bg-indigo-600/10",
          },
          {
            href: "/controlPanel/courses",
            title: "Courses",
            desc: "Create and edit courses",
            color: "bg-blue-600",
            tint: "bg-blue-600/10",
            roles: ["admin"],
          },
          {
            href: "/controlPanel/staff",
            title: "Staff",
            desc: "Admins and secretaries",
            color: "bg-emerald-600",
            tint: "bg-emerald-600/10",
          },
          {
            href: "/controlPanel/students",
            title: "Students",
            desc: "Manage student records",
            color: "bg-rose-600",
            tint: "bg-rose-600/10",
          },
          {
            href: "/controlPanel/study-plans",
            title: "Study plans",
            desc: "Manage curriculum plans",
            color: "bg-violet-600",
            tint: "bg-violet-600/10",
            roles: ["admin"],
          },
          {
            href: "/controlPanel/sections",
            title: "Sections",
            desc: "Manage class sections",
            color: "bg-amber-600",
            tint: "bg-amber-600/10",
          },
        ]
      : [
          {
            href: "/controlPanel/teachers",
            title: "Profesores",
            desc: "Gestionar registros de profesores",
            color: "bg-indigo-600",
            tint: "bg-indigo-600/10",
          },
          {
            href: "/controlPanel/courses",
            title: "Cursos",
            desc: "Crear y editar cursos",
            color: "bg-blue-600",
            tint: "bg-blue-600/10",
            roles: ["admin"],
          },
          {
            href: "/controlPanel/staff",
            title: "Personal",
            desc: "Administradores y secretarias",
            color: "bg-emerald-600",
            tint: "bg-emerald-600/10",
          },
          {
            href: "/controlPanel/students",
            title: "Estudiantes",
            desc: "Gestionar registros de estudiantes",
            color: "bg-rose-600",
            tint: "bg-rose-600/10",
          },
          {
            href: "/controlPanel/study-plans",
            title: "Planes de estudio",
            desc: "Gestionar planes curriculares",
            color: "bg-violet-600",
            tint: "bg-violet-600/10",
            roles: ["admin"],
          },
          {
            href: "/controlPanel/sections",
            title: "Secciones",
            desc: "Gestionar secciones de clase",
            color: "bg-amber-600",
            tint: "bg-amber-600/10",
          },
        ];

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-neutral-900/5 grid place-items-center dark:bg-neutral-50/10">
            <span className="text-2xl font-semibold">SM</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {language === "en" ? "Control Panel" : "Panel de control"}
          </h1>
          <p className="text-sm text-neutral-500">
            {language === "en"
              ? "Quick access to school resources"
              : "Acceso rápido a los recursos del colegio"}
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards
            .filter((c) => !c.roles || c.roles.includes(role))
            .map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div
                className={`h-10 w-10 ${c.tint} rounded-lg grid place-items-center mb-4`}
              >
                <div className={`h-2.5 w-2.5 rounded ${c.color}`}></div>
              </div>
              <h2 className="text-lg font-medium mb-1 group-hover:underline">
                {c.title}
              </h2>
              <p className="text-sm text-neutral-500">{c.desc}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
