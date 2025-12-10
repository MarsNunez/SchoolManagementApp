"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchJSON, authHeaders } from "@/lib/api";

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.studentId;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchJSON(`/students/${studentId}`, {
          headers: { ...authHeaders() },
        });
        setStudent(data || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (studentId) load();
  }, [studentId]);

  const handleDelete = async () => {
    if (!studentId) return;
    setDeleteError("");
    try {
      await fetchJSON(`/students/${studentId}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      router.push("/controlPanel/students");
    } catch (e) {
      setDeleteError(e.message || "Error al eliminar al estudiante");
    }
  };

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="mb-2 flex items-center">
          <Link
            href="/controlPanel/students"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver
          </Link>
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Perfil del estudiante</h1>
          <p className="text-sm text-neutral-500">
            Información detallada de este estudiante
          </p>
        </header>

        {loading ? (
          <div className="text-sm text-neutral-500">Cargando...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : !student ? (
          <div className="text-sm text-red-600">Estudiante no encontrado.</div>
        ) : (
          <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {student.name} {student.lastname}
                </h2>
                <p className="text-sm text-neutral-500">
                  DNI {student.dni} · {student.email}
                </p>
              </div>
              <div className="text-xs text-neutral-500 text-right">
                <div className="font-mono text-neutral-800 dark:text-neutral-200">
                  ID: {student.student_id}
                </div>
                <div>
                  Section:{" "}
                  <span className="font-medium">
                    {student.section_id || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="space-y-1">
                <div className="text-neutral-500">Nombre</div>
                <div className="font-medium">
                  {student.name} {student.lastname}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-neutral-500">DNI</div>
                <div className="font-medium">{student.dni}</div>
              </div>
              <div className="space-y-1">
                <div className="text-neutral-500">Correo electrónico</div>
                <div className="font-medium break-all">{student.email}</div>
              </div>
              <div className="space-y-1">
                <div className="text-neutral-500">Teléfono</div>
                <div className="font-medium">{student.phone || "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-neutral-500">Dirección</div>
                <div className="font-medium">{student.address || "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-neutral-500">Fecha de nacimiento</div>
                <div className="font-medium">
                  {student.birth_date
                    ? new Date(student.birth_date).toLocaleDateString()
                    : "—"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Apoderados</h3>
              </div>
              {Array.isArray(student.guardians) && student.guardians.length > 0 ? (
                <div className="space-y-2">
                  {student.guardians.map((g, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-neutral-200/60 dark:border-neutral-800 px-3 py-2 text-sm"
                    >
                      <div className="font-medium">{g.full_name}</div>
                      <div className="text-xs text-neutral-500">
                        {g.email}
                        {g.phone ? ` · ${g.phone}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-neutral-500">
                  No hay apoderados registrados.
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  router.push(`/controlPanel/students/${studentId}/edit`)
                }
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="btn-danger"
              >
                Eliminar
              </button>
            </div>
          </section>
        )}
      </div>
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-5 space-y-3">
            <h2 className="text-lg font-semibold">Eliminar estudiante</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              ¿Seguro que quieres eliminar a este estudiante? Esta acción no se
              puede deshacer.
            </p>
            {deleteError && (
              <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn-danger text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
