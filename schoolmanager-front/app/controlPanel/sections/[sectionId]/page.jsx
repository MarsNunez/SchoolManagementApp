"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchJSON, authHeaders } from "@/lib/api";

const GROUP_BADGE_STYLES = {
  A: "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  B: "border-blue-600 bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  C: "border-violet-600 bg-violet-50 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  D: "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  E: "border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

export default function SectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sectionId = params?.sectionId;

  const [section, setSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [confirmingStudent, setConfirmingStudent] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!sectionId) return;
      try {
        setLoading(true);
        setError("");
        const [sectionData, studentsData, teachersData] = await Promise.all([
          fetchJSON(`/sections/${sectionId}`, {
            headers: { ...authHeaders() },
          }),
          fetchJSON("/students", { headers: { ...authHeaders() } }),
          fetchJSON("/teachers", { headers: { ...authHeaders() } }),
        ]);

        setSection(sectionData || null);
        const all = Array.isArray(studentsData) ? studentsData : [];
        setAllStudents(all);
        setStudents(all.filter((s) => s.section_id === sectionData.section_id));
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      } catch (e) {
        setError(e.message || "Error al cargar los detalles de la sección");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sectionId]);

  const teacherById = useMemo(() => {
    const map = {};
    for (const t of teachers) {
      if (t?.teacher_id) {
        map[t.teacher_id] = t;
      }
    }
    return map;
  }, [teachers]);

  if (!sectionId) {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="text-sm text-red-600">
          Falta el ID de la sección en la URL.
        </div>
      </main>
    );
  }

  const handleEnroll = () => {
    if (!section) return;
    router.push(
      `/controlPanel/students/new?section_id=${encodeURIComponent(
        section.section_id
      )}`
    );
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const assignSelectedStudents = async () => {
    if (!section || selectedStudentIds.size === 0) return;
    if (atCapacity) {
      setError("No se pueden agregar estudiantes: capacidad completa");
      return;
    }
    if (slotsLeft > 0 && selectedStudentIds.size > slotsLeft) {
      setError(
        `Solo quedan ${slotsLeft} lugares disponibles en esta sección`
      );
      return;
    }
    setError("");
    try {
      const ids = Array.from(selectedStudentIds);
      await Promise.all(
        ids.map((studentId) =>
          fetchJSON(`/students/${studentId}`, {
            method: "PUT",
            headers: { ...authHeaders() },
            body: JSON.stringify({ section_id: section.section_id }),
          })
        )
      );

      const updatedStudents = allStudents.map((s) =>
        selectedStudentIds.has(s.student_id)
          ? { ...s, section_id: section.section_id }
          : s
      );
      setAllStudents(updatedStudents);
      setStudents(
        updatedStudents.filter((s) => s.section_id === section.section_id)
      );
      setSelectedStudentIds(new Set());
    } catch (e) {
      setError(e.message || "Error al asignar estudiantes a la sección");
    }
  };

  const availableStudents = useMemo(() => {
    if (!Array.isArray(allStudents) || !section) return [];
    const base = allStudents.filter(
      (s) => !s.section_id || s.section_id !== section.section_id
    );
    if (!studentSearch.trim()) return base;
    const query = studentSearch.toLowerCase();
    return base.filter((s) => {
      const name = `${s.name || ""} ${s.lastname || ""}`.toLowerCase();
      const email = String(s.email || "").toLowerCase();
      const id = String(s.student_id || "").toLowerCase();
      return (
        name.includes(query) || email.includes(query) || id.includes(query)
      );
    });
  }, [allStudents, section, studentSearch]);

  const unassignStudent = async (studentId) => {
    if (!section) return;
    setError("");
    try {
      await fetchJSON(`/students/${studentId}`, {
        method: "PUT",
        headers: { ...authHeaders() },
        body: JSON.stringify({ section_id: "" }),
      });

      const updatedAll = allStudents.map((s) =>
        s.student_id === studentId ? { ...s, section_id: "" } : s
      );
      setAllStudents(updatedAll);
      setStudents(
        updatedAll.filter((s) => s.section_id === section.section_id)
      );
    } catch (e) {
      setError(e.message || "Error al quitar al estudiante de la sección");
    }
  };

  const group = String(section?.group || "").toUpperCase();
  const groupClasses =
    GROUP_BADGE_STYLES[group] ||
    "border-neutral-400 bg-neutral-50 text-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-200";

  const teacher = section ? teacherById[section.teacher_id] : null;
  const enrolledCount = students.length;
  const rawCapacity =
    section?.max_capacity ??
    section?.maxCapacity ??
    section?.capacity ??
    section?.start_capacity;
  const parsedCapacity = Number(rawCapacity);
  const capacity = Number.isFinite(parsedCapacity) ? parsedCapacity : null;
  const slotsLeft =
    capacity == null ? Infinity : Math.max(0, capacity - enrolledCount);
  const atCapacity = capacity != null && enrolledCount >= capacity;

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/controlPanel/sections"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-neutral-500">Cargando sección…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : !section ? (
          <div className="text-sm text-red-600">Sección no encontrada.</div>
        ) : (
          <>
            <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm p-4 space-y-3">
              <header className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">
                    {section.title || section.section_id}
                  </h1>
                  <p className="text-sm text-neutral-500">
                    Información detallada sobre esta sección
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div
                    className={`border w-fit py-1 px-2 rounded-lg text-xs font-medium ${groupClasses}`}
                  >
                    Grupo {group}
                  </div>
                  <div className="text-xs text-neutral-500">
                    ID:{" "}
                    <span className="font-mono text-neutral-800 dark:text-neutral-200">
                      {section.section_id}
                    </span>
                  </div>
                </div>
              </header>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <div className="text-neutral-500">Plan de estudios</div>
                  <div className="font-medium">{section.studyPlan_id}</div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-neutral-500">Profesor</div>
                  <div className="font-medium">
                    {teacher
                      ? `${teacher.name} ${teacher.lastname}`
                      : section.teacher_id}
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-neutral-500">Año</div>
                  <div className="font-medium">{section.year}</div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-neutral-500">Capacidad</div>
                  <div className="font-medium">
                    {enrolledCount}/{capacity != null ? capacity : "—"}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm overflow-x-auto">
              <header className="flex items-center justify-between p-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Estudiantes matriculados
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Estudiantes actualmente asignados a esta sección
                  </p>
                </div>
                <div className="relative group inline-flex items-center">
                  {atCapacity && (
                    <div className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded bg-white text-neutral-900 text-xs px-3 py-2 opacity-0 group-hover:opacity-100 shadow-lg z-20 whitespace-nowrap border border-neutral-200">
                      <span className="absolute top-0 -translate-y-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white"></span>
                      La sección está en su capacidad máxima
                    </div>
                  )}
                  <button
                    onClick={handleEnroll}
                    disabled={atCapacity}
                    className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-user-plus"></i>
                    Matricular nuevo estudiante
                  </button>
                </div>
              </header>
              {students.length === 0 ? (
                <div className="p-4 text-sm text-neutral-500">
                  Aún no hay estudiantes matriculados en esta sección.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left border-b border-neutral-200/60 dark:border-neutral-800">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Correo</th>
                      <th className="p-3">DNI</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr
                        key={s.student_id}
                        className="border-b last:border-none border-neutral-100 dark:border-neutral-800"
                      >
                        <td className="p-3 whitespace-nowrap">
                          {s.student_id}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {s.name} {s.lastname}
                        </td>
                        <td className="p-3 whitespace-nowrap">{s.email}</td>
                        <td className="p-3 whitespace-nowrap">{s.dni}</td>
                        <td className="p-3 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => setConfirmingStudent(s)}
                            className="inline-flex h-5 w-5 text-[10px] text-center cursor-pointer items-center justify-center rounded-full border-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/40"
                            title="Quitar de la sección"
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="rounded-2xl border border-dashed border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm mt-4">
              <header className="flex items-center justify-between p-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Asignar estudiantes existentes
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Busca y selecciona estudiantes ya creados para
                    matricularlos en esta sección
                  </p>
                </div>
                <div className="relative group inline-flex items-center">
                  {(() => {
                    let tooltip = "";
                    if (atCapacity) {
                      tooltip = "Capacidad completa";
                    } else if (
                      slotsLeft > 0 &&
                      selectedStudentIds.size > slotsLeft
                    ) {
                      tooltip = `Solo quedan ${slotsLeft} lugares`;
                    }
                    return tooltip ? (
                      <div className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded bg-white text-neutral-900 text-xs px-3 py-2 opacity-0 group-hover:opacity-100 shadow-lg z-20 max-w-[16rem] text-center border border-neutral-200">
                        <span className="absolute top-0 -translate-y-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white"></span>
                        {tooltip}
                      </div>
                    ) : null;
                  })()}
                  <button
                    type="button"
                    onClick={assignSelectedStudents}
                    disabled={
                      selectedStudentIds.size === 0 ||
                      atCapacity ||
                      (slotsLeft > 0 && selectedStudentIds.size > slotsLeft)
                    }
                    className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-user-check"></i>
                    Agregar seleccionados
                  </button>
                </div>
              </header>
              <div className="p-4 space-y-3">
                <input
                  className="input w-full"
                  placeholder="Buscar estudiantes por nombre, correo o ID"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                <div className="max-h-64 overflow-y-auto rounded-lg border border-neutral-200/60 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/60 px-3 py-2 space-y-1 text-sm">
                  {availableStudents.length === 0 ? (
                    <div className="text-xs text-neutral-500">
                      No hay estudiantes disponibles para asignar.
                    </div>
                  ) : (
                    availableStudents.map((s) => (
                      <label
                        key={s.student_id}
                        className={`flex items-center gap-2 ${
                          atCapacity
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        }`}
                        title={
                          atCapacity
                            ? "No se puede seleccionar: la sección está llena"
                            : ""
                        }
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-neutral-300 dark:border-neutral-700"
                          checked={selectedStudentIds.has(s.student_id)}
                          disabled={atCapacity}
                          onChange={() => toggleStudentSelection(s.student_id)}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {s.name} {s.lastname}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {s.student_id} · {s.email}
                          </span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
      {confirmingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-5 space-y-3">
            <h2 className="text-lg font-semibold">Quitar estudiante</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              ¿Seguro que quieres quitar a{" "}
              <span className="font-semibold">
                {confirmingStudent.name} {confirmingStudent.lastname}
              </span>{" "}
              de esta sección?
            </p>
            {error && (
              <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingStudent(null)}
                className="rounded-lg px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await unassignStudent(confirmingStudent.student_id);
                  setConfirmingStudent(null);
                }}
                className="btn-danger text-sm"
              >
                Quitar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
