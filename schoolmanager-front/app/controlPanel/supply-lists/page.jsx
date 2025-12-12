"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authHeaders, fetchJSON } from "@/lib/api";

export default function SupplyListsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON("/supply-lists", {
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

  const remove = async (list_id) => {
    if (!confirm(`Delete ${list_id}?`)) return;
    try {
      await fetchJSON(`/supply-lists/${list_id}`, {
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
            Back
          </Link>
          <Link
            href="/controlPanel/supply-lists/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            Create list
          </Link>
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Supply Lists</h1>
          <p className="text-sm text-neutral-500">
            Manage school supply lists by section
          </p>
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
                  <th className="p-3">Title</th>
                  <th className="p-3">Section</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((list) => (
                  <tr
                    key={list.list_id}
                    className="border-b last:border-none border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="p-3 whitespace-nowrap">{list.list_id}</td>
                    <td className="p-3 whitespace-nowrap">{list.title}</td>
                    <td className="p-3 whitespace-nowrap">{list.section_id}</td>
                    <td className="p-3 whitespace-nowrap">
                      {Array.isArray(list.items) ? list.items.length : 0}
                    </td>
                    <td className="p-3 flex gap-2">
                      <Link
                        href={`/controlPanel/supply-lists/${list.list_id}`}
                        className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                      >
                        Más
                      </Link>
                      <button
                        onClick={() => remove(list.list_id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
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
