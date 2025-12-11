"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { authHeaders, fetchJSON } from "@/lib/api";
import { useLanguage } from "@/lib/languageContext";
import * as XLSX from "xlsx";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const { language } = useLanguage();

  const texts =
    language === "en"
      ? {
          title: "Sections",
          subtitle: "List and manage sections",
          exportExcel: "Export to Excel",
        }
      : {
          title: "Secciones",
          subtitle: "Listar y gestionar secciones",
          exportExcel: "Exportar a Excel",
        };

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

  const deleteSection = async () => {
    if (!sectionToDelete) return;
    setDeleteError("");
    try {
      await fetchJSON(`/sections/${sectionToDelete.section_id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      await load();
      setSectionToDelete(null);
    } catch (e) {
      setDeleteError(
        e.message ||
          (language === "en"
            ? "Failed to delete section"
            : "Error al eliminar la sección")
      );
    }
  };

  const exportToExcel = () => {
    try {
      const rows = items.map((section) => {
        const group = String(section.group || "").toUpperCase();
        const teacher = teacherById[section.teacher_id];
        const capacity =
          section.start_capacity ?? section.max_capacity ?? section.capacity;

        return {
          ID: section.section_id,
          Título: section.title || "",
          Grupo: group,
          "Plan de estudios": section.studyPlan_id || "",
          Profesor: teacher
            ? `${teacher.name || ""} ${teacher.lastname || ""}`.trim()
            : section.teacher_id || "",
          Año: section.year ?? "",
          Capacidad: capacity ?? "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sections");
      XLSX.writeFile(workbook, "sections.xlsx");
    } catch (e) {
      console.error("Error al exportar secciones a Excel:", e);
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
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{texts.title}</h1>
            <p className="text-sm text-neutral-500">{texts.subtitle}</p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="h-9 w-9 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 flex items-center justify-center shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="More actions"
            >
              <i className="fa-solid fa-ellipsis-vertical text-neutral-600 dark:text-neutral-200"></i>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg py-1 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    exportToExcel();
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {texts.exportExcel}
                </button>
              </div>
            )}
          </div>
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
                              onClick={() => {
                                setSectionToDelete(section);
                                setDeleteError("");
                              }}
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
      {sectionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-5 space-y-3">
            <h2 className="text-lg font-semibold">
              {language === "en" ? "Delete section" : "Eliminar sección"}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {language === "en"
                ? "Are you sure you want to delete section "
                : "¿Seguro que quieres eliminar la sección "}
              <span className="font-semibold">
                {sectionToDelete.section_id}
              </span>
              ?
            </p>
            {deleteError && (
              <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSectionToDelete(null)}
                className="rounded-lg px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700"
              >
                {language === "en" ? "Cancel" : "Cancelar"}
              </button>
              <button
                type="button"
                onClick={deleteSection}
                className="btn-danger text-sm"
              >
                {language === "en" ? "Delete" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
