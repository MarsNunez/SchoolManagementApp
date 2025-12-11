"use client";

import { useEffect, useState } from "react";
import { fetchJSON, authHeaders } from "@/lib/api";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import * as XLSX from "xlsx";

export default function CoursesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const { language } = useLanguage();

  const texts =
    language === "en"
      ? {
          back: "Back",
          title: "Courses",
          subtitle: "List, create and manage courses",
          titlePlaceholder: "title",
          descriptionPlaceholder: "description",
          durationPlaceholder: "duration (hours)",
          teacherSelect: "Select teacher (optional)",
          savingExisting: "Saving...",
          creatingNew: "Creating...",
          save: "Save",
          create: "Create",
          cancel: "Cancel",
          loading: "Loading...",
          thTitle: "Title",
          thTeacher: "Teacher",
          thDuration: "Duration",
          thActions: "Actions",
          edit: "Edit",
          remove: "Delete",
          exportExcel: "Export to Excel",
          deleteConfirm: (id) => `Delete ${id}?`,
        }
      : {
          back: "Volver",
          title: "Cursos",
          subtitle: "Listar, crear y gestionar cursos",
          titlePlaceholder: "título",
          descriptionPlaceholder: "descripción",
          durationPlaceholder: "duración (horas)",
          teacherSelect: "Seleccionar profesor (opcional)",
          savingExisting: "Guardando...",
          creatingNew: "Creando...",
          save: "Guardar",
          create: "Crear",
          cancel: "Cancelar",
          loading: "Cargando...",
          thTitle: "Título",
          thTeacher: "Profesor",
          thDuration: "Duración",
          thActions: "Acciones",
          edit: "Editar",
          remove: "Eliminar",
          exportExcel: "Exportar a Excel",
          deleteConfirm: (id) => `¿Eliminar ${id}?`,
        };

  const [form, setForm] = useState({
    title: "",
    description: "",
    teacher_id: "",
    duration: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ title: "", duration: "" });

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON("/courses", {
        headers: { ...authHeaders() },
      });
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Load teachers to populate the select options
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJSON("/teachers", {
          headers: { ...authHeaders() },
        });
        setTeachers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn("No se pudieron cargar los profesores:", e.message);
      }
    })();
  }, []);

  const resetForm = () => {
    setEditingId("");
    setForm({ title: "", description: "", teacher_id: "", duration: "" });
    setFieldErrors({ title: "", duration: "" });
  };

  const submitItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      // Client-side validation for required fields
      const errs = { title: "", duration: "" };
      if (!form.title || form.title.trim() === "")
        errs.title = "El título es obligatorio";
      const parsedDuration = Number(form.duration);
      if (!Number.isFinite(parsedDuration) || parsedDuration < 0)
        errs.duration = "La duración debe ser un número no negativo";
      setFieldErrors(errs);
      if (errs.title || errs.duration) {
        setSubmitting(false);
        return; // Stop submission if invalid
      }
      const { title, description, teacher_id } = form;
      const payload = {
        title,
        description,
        teacher_id,
        duration: parsedDuration,
      };
      if (editingId) {
        await fetchJSON(`/courses/${editingId}`, {
          method: "PUT",
          headers: { ...authHeaders() },
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJSON("/courses", {
          method: "POST",
          headers: { ...authHeaders() },
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    setDeleteError("");
    try {
      await fetchJSON(`/courses/${courseToDelete.course_id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      await load();
      setCourseToDelete(null);
    } catch (e) {
      setDeleteError(
        e.message ||
          (language === "en"
            ? "Failed to delete course"
            : "Error al eliminar el curso")
      );
    }
  };

  const exportToExcel = () => {
    try {
      const rows = items.map((c) => {
        const teacher = teachers.find((t) => t.teacher_id === c.teacher_id);
        return {
          ID: c.course_id,
          [texts.thTitle]: c.title || "",
          [texts.thTeacher]: teacher
            ? `${teacher.name || ""} ${teacher.lastname || ""}`.trim()
            : c.teacher_id || "",
          [texts.thDuration]: c.duration ?? "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");
      XLSX.writeFile(workbook, "courses.xlsx");
    } catch (e) {
      console.error("Error al exportar a Excel:", e);
    }
  };

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="mb-2">
          <Link
            href="/controlPanel"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <i className="fa-solid fa-arrow-left"></i>
            {texts.back}
          </Link>
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

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
          <form onSubmit={submitItem} className="p-4 grid gap-3 sm:grid-cols-3">
            <div>
              <input
                className={`input w-full ${
                  fieldErrors.title ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder={texts.titlePlaceholder}
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  if (fieldErrors.title)
                    setFieldErrors((prev) => ({ ...prev, title: "" }));
                }}
                required
                aria-invalid={!!fieldErrors.title}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
              )}
            </div>
            <select
              className="input"
              value={form.teacher_id}
              onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
            >
              <option value="">{texts.teacherSelect}</option>
              {teachers.map((t) => (
                <option key={t.teacher_id} value={t.teacher_id}>
                  {t.name} {t.lastname} ({t.teacher_id})
                </option>
              ))}
            </select>
            <input
              className="input sm:col-span-2"
              placeholder={texts.descriptionPlaceholder}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <div>
              <input
                className={`input ${
                  fieldErrors.duration
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder={texts.durationPlaceholder}
                type="number"
                min={0}
                value={form.duration}
                onChange={(e) => {
                  setForm({ ...form, duration: e.target.value });
                  if (fieldErrors.duration)
                    setFieldErrors((prev) => ({ ...prev, duration: "" }));
                }}
                required
                aria-invalid={!!fieldErrors.duration}
              />
              {fieldErrors.duration && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.duration}
                </p>
              )}
            </div>
            {error && (
              <div className="sm:col-span-3 text-sm text-red-600">{error}</div>
            )}
            <div className="flex gap-2">
              <button disabled={submitting} className="btn-primary">
                {submitting
                  ? editingId
                    ? texts.savingExisting
                    : texts.creatingNew
                  : editingId
                  ? texts.save
                  : texts.create}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                >
                  {texts.cancel}
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-neutral-500">{texts.loading}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left border-b border-neutral-200/60 dark:border-neutral-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">{texts.thTitle}</th>
                  <th className="p-3">{texts.thTeacher}</th>
                  <th className="p-3">{texts.thDuration}</th>
                  <th className="p-3">{texts.thActions}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr
                    key={c.course_id}
                    className="border-b last:border-none border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="p-3 whitespace-nowrap">{c.course_id}</td>
                    <td className="p-3 whitespace-nowrap">{c.title}</td>
                    <td className="p-3 whitespace-nowrap">
                      {(() => {
                        const t = teachers.find(
                          (teacher) => teacher.teacher_id === c.teacher_id
                        );
                        if (t) return `${t.name} ${t.lastname}`;
                        return c.teacher_id || "—";
                      })()}
                    </td>
                    <td className="p-3 whitespace-nowrap">{c.duration}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(c.course_id);
                          setForm({
                            title: c.title || "",
                            description: c.description || "",
                            teacher_id: c.teacher_id || "",
                            duration: String(c.duration || ""),
                          });
                        }}
                        className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                      >
                        {texts.edit}
                      </button>
                      <button
                        onClick={() => {
                          setDeleteError("");
                          setCourseToDelete(c);
                        }}
                        className="btn-danger"
                      >
                        {texts.remove}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-5 space-y-3">
            <h2 className="text-lg font-semibold">
              {language === "en" ? "Delete course" : "Eliminar curso"}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {language === "en"
                ? "Are you sure you want to delete the course "
                : "¿Seguro que quieres eliminar el curso "}
              <span className="font-semibold">
                {courseToDelete.title || courseToDelete.course_id}
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
                onClick={() => setCourseToDelete(null)}
                className="rounded-lg px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700"
              >
                {language === "en" ? "Cancel" : "Cancelar"}
              </button>
              <button
                type="button"
                onClick={confirmDeleteCourse}
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
