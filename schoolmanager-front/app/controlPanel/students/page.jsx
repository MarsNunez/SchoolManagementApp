"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJSON, authHeaders } from "@/lib/api";

export default function StudentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON("/students", { headers: { ...authHeaders() } });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
          <Link
            href="/controlPanel/students/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <i className="fa-solid fa-user-plus"></i>
            Registrar nuevo estudiante
          </Link>
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Estudiantes</h1>
          <p className="text-sm text-neutral-500">
            Listar y gestionar estudiantes
          </p>
        </header>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm overflow-x-auto">
          <div className="p-4 border-b border-neutral-200/60 dark:border-neutral-800">
            <input
              className="input w-full max-w-md"
              placeholder="Buscar por nombre, ID o DNI"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
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
                  <th className="p-3">Sección</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .filter((s) => {
                    if (!query.trim()) return true;
                    const q = query.toLowerCase();
                    const name = `${s.name || ""} ${s.lastname || ""}`.toLowerCase();
                    const id = String(s.student_id || "").toLowerCase();
                    const dni = String(s.dni || "");
                    return (
                      name.includes(q) ||
                      id.includes(q) ||
                      dni.includes(q)
                    );
                  })
                  .map((s) => (
                  <tr key={s.student_id} className="border-b last:border-none border-neutral-100 dark:border-neutral-800">
                    <td className="p-3 whitespace-nowrap">{s.student_id}</td>
                    <td className="p-3 whitespace-nowrap">{s.name} {s.lastname}</td>
                  <td className="p-3 whitespace-nowrap">{s.email}</td>
                  <td className="p-3 whitespace-nowrap">{s.dni}</td>
                  <td className="p-3 whitespace-nowrap">{s.section_id || "—"}</td>
                    <td className="p-3">
                      <Link
                        href={`/controlPanel/students/${s.student_id}`}
                        className="btn-primary inline-flex items-center justify-center px-3 py-2 text-sm"
                      >
                        Más
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
