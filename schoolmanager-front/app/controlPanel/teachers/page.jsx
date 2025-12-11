"use client";

import { useEffect, useState } from "react";
import { fetchJSON, authHeaders } from "@/lib/api";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import * as XLSX from "xlsx";

export default function TeachersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const { language } = useLanguage();

  const texts =
    language === "en"
      ? {
          title: "Teachers",
          subtitle: "List, create and manage teachers",
          exportExcel: "Export to Excel",
        }
      : {
          title: "Profesores",
          subtitle: "Listar, crear y gestionar profesores",
          exportExcel: "Exportar a Excel",
        };

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    dni: "",
    specialties: "",
    email: "",
    phone: "",
    photo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON("/teachers", {
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

  const resetForm = () => {
    setEditingId("");
    setForm({
      name: "",
      lastname: "",
      dni: "",
      specialties: "",
      email: "",
      phone: "",
      photo: "",
    });
  };

  const submitItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        lastname: form.lastname,
        dni: Number(form.dni),
        specialties: form.specialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        email: form.email,
        phone: form.phone,
        photo: form.photo,
      };
      if (editingId) {
        await fetchJSON(`/teachers/${editingId}`, {
          method: "PUT",
          headers: { ...authHeaders() },
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJSON("/teachers", {
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

  const deleteTeacher = async () => {
    if (!teacherToDelete) return;
    setDeleteError("");
    try {
      await fetchJSON(`/teachers/${teacherToDelete.teacher_id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      await load();
      setTeacherToDelete(null);
    } catch (e) {
      setDeleteError(
        e.message ||
          (language === "en"
            ? "Failed to delete teacher"
            : "Error al eliminar al profesor")
      );
    }
  };

  const exportToExcel = () => {
    try {
      const rows = items.map((t) => ({
        ID: t.teacher_id,
        Nombre: `${t.name || ""} ${t.lastname || ""}`.trim(),
        DNI: t.dni ?? "",
        Correo: t.email || "",
        Teléfono: t.phone || "",
        Especialidades: Array.isArray(t.specialties)
          ? t.specialties.join(", ")
          : "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");
      XLSX.writeFile(workbook, "teachers.xlsx");
    } catch (e) {
      console.error("Error al exportar profesores a Excel:", e);
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
            Volver
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
            <input
              className="input"
              placeholder="nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input"
              placeholder="apellidos"
              value={form.lastname}
              onChange={(e) =>
                setForm({ ...form, lastname: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="DNI"
              type="number"
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value })}
            />
            <input
              className="input"
              placeholder="especialidades (separadas por coma)"
              value={form.specialties}
              onChange={(e) =>
                setForm({ ...form, specialties: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="correo electrónico"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="input"
              placeholder="teléfono"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="input sm:col-span-2"
              placeholder="URL de foto"
              value={form.photo}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
            />
            {error && (
              <div className="sm:col-span-3 text-sm text-red-600">{error}</div>
            )}
            <div className="flex gap-2">
              <button disabled={submitting} className="btn-primary">
                {submitting
                  ? editingId
                    ? "Guardando..."
                    : "Creando..."
                  : editingId
                  ? "Guardar"
                  : "Crear"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-neutral-500">Cargando...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left border-b border-neutral-200/60 dark:border-neutral-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">DNI</th>
                  <th className="p-3">Especialidades</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr
                    key={t.teacher_id}
                    className="border-b last:border-none border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="p-3 whitespace-nowrap">{t.teacher_id}</td>
                    <td className="p-3 whitespace-nowrap">
                      {t.name} {t.lastname}
                    </td>
                    <td className="p-3 whitespace-nowrap">{t.email}</td>
                    <td className="p-3 whitespace-nowrap">{t.dni}</td>
                    <td className="p-3">{(t.specialties || []).join(", ")}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(t.teacher_id);
                          setForm({
                            name: t.name || "",
                            lastname: t.lastname || "",
                            dni: String(t.dni || ""),
                            specialties: (t.specialties || []).join(", "),
                            email: t.email || "",
                            phone: t.phone || "",
                            photo: t.photo || "",
                          });
                        }}
                        className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setTeacherToDelete(t);
                          setDeleteError("");
                        }}
                        className="btn-danger"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-5 space-y-3">
            <h2 className="text-lg font-semibold">
              {language === "en" ? "Delete teacher" : "Eliminar profesor"}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {language === "en"
                ? "Are you sure you want to delete "
                : "¿Seguro que quieres eliminar al profesor "}
              <span className="font-semibold">
                {teacherToDelete.name} {teacherToDelete.lastname}
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
                onClick={() => setTeacherToDelete(null)}
                className="rounded-lg px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700"
              >
                {language === "en" ? "Cancel" : "Cancelar"}
              </button>
              <button
                type="button"
                onClick={deleteTeacher}
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

// Small utility styles
// Using tailwind classes via globals
const inputBase =
  "rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500";
const btnBase =
  "rounded-lg px-3 py-2 text-white text-sm font-medium transition-colors";

// Inject classes into global scope (JSX inline className references above)
