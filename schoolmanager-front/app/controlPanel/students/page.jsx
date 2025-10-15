"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJSON, authHeaders } from "@/lib/api";

export default function StudentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const remove = async (student_id) => {
    if (!confirm(`Delete ${student_id}?`)) return;
    try {
      await fetchJSON(`/students/${student_id}`, { method: "DELETE", headers: { ...authHeaders() } });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="mb-2 flex items-center justify-between">
          <Link href="/controlPanel" className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </Link>
          <Link href="/controlPanel/students/new" className="btn-primary inline-flex items-center gap-2">
            <i className="fa-solid fa-user-plus"></i>
            Register new student
          </Link>
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-sm text-neutral-500">List and manage students</p>
        </header>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-neutral-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left border-b border-neutral-200/60 dark:border-neutral-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">DNI</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.student_id} className="border-b last:border-none border-neutral-100 dark:border-neutral-800">
                    <td className="p-3 whitespace-nowrap">{s.student_id}</td>
                    <td className="p-3 whitespace-nowrap">{s.name} {s.lastname}</td>
                    <td className="p-3 whitespace-nowrap">{s.email}</td>
                    <td className="p-3 whitespace-nowrap">{s.dni}</td>
                    <td className="p-3 flex gap-2">
                      <Link href={`/controlPanel/students/${s.student_id}`} className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700">Edit</Link>
                      <button onClick={() => remove(s.student_id)} className="btn-danger">Delete</button>
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

