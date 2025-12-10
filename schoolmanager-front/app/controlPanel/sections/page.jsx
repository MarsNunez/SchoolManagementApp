"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { authHeaders, fetchJSON } from "@/lib/api";

const GROUP_BADGE_STYLES = {
  A: "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  B: "border-blue-600 bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  C: "border-violet-600 bg-violet-50 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  D: "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  E: "border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

export default function SectionsPage() {
  const [items, setItems] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");

  const teacherById = useMemo(() => {
    const map = {};
    for (const t of teachers) {
      if (t?.teacher_id) {
        map[t.teacher_id] = t;
      }
    }
    return map;
  }, [teachers]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON("/sections", {
        headers: { ...authHeaders() },
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teacherData = await fetchJSON("/teachers", {
          headers: { ...authHeaders() },
        });
        setTeachers(Array.isArray(teacherData) ? teacherData : []);
      } catch (e) {
        console.warn("No se pudieron cargar los profesores:", e.message);
      }
    };
    fetchTeachers();
  }, []);

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

  const isAdmin = role === "admin";

  const remove = async (section_id) => {
    if (!confirm(`¿Eliminar ${section_id}?`)) return;
    try {
      await fetchJSON(`/sections/${section_id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/controlPanel"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver
          </Link>
          {isAdmin && (
            <Link
              href="/controlPanel/sections/new"
              className="btn-primary inline-flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              Crear sección
            </Link>
          )}
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Secciones</h1>
          <p className="text-sm text-neutral-500">
            Listar y gestionar secciones
          </p>
        </header>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-neutral-500">Cargando...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left border-b border-neutral-200/60 dark:border-neutral-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Título</th>
                  <th className="p-3">Grupo</th>
                  <th className="p-3">Plan de estudios</th>
                  <th className="p-3">Profesor</th>
                  <th className="p-3">Año</th>
                  <th className="p-3">Capacidad</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((section) => {
                  const group = String(section.group || "").toUpperCase();
                  const teacher = teacherById[section.teacher_id];
                  return (
                    <tr
                      key={section.section_id}
                      className="border-b last:border-none border-neutral-100 dark:border-neutral-800"
                    >
                      <td className="p-3 whitespace-nowrap">
                        {section.section_id}
                      </td>
                      <td className="p-3 whitespace-nowrap">{section.title}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div
                          className={`border px-2 py-1 rounded ${GROUP_BADGE_STYLES[group] || ""} inline-flex items-center gap-1 text-xs`}
                        >
                          {group}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {section.studyPlan_id}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {teacher
                          ? `${teacher.name} ${teacher.lastname}`
                          : section.teacher_id}
                      </td>
                      <td className="p-3 whitespace-nowrap">{section.year}</td>
                      <td className="p-3 whitespace-nowrap">
                        {(section.enrolledCount ?? 0)}/
                        {section.start_capacity ?? section.max_capacity ?? 0}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/controlPanel/sections/${section.section_id}`}
                            className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                          >
                            Más
                          </Link>
                          <Link
                            href={`/controlPanel/sections/${section.section_id}/edit`}
                            className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                          >
                            Editar
                          </Link>
                          {isAdmin && (
                            <button
                              onClick={() => remove(section.section_id)}
                              className="btn-danger"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
