"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJSON, authHeaders } from "@/lib/api";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default function StudyPlansPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON("/study-plans", {
        headers: { ...authHeaders() },
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load study plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (studyPlan_id) => {
    if (!confirm(`Delete ${studyPlan_id}?`)) return;
    try {
      await fetchJSON(`/study-plans/${studyPlan_id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete study plan");
    }
  };

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <Link
            href="/controlPanel"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </Link>
          <Link
            href="/controlPanel/study-plans/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            Register new study plan
          </Link>
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Study Plans</h1>
          <p className="text-sm text-neutral-500">
            List and manage study plans
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
                  <th className="p-3">Level</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Effective From</th>
                  <th className="p-3">Courses</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((plan) => (
                  <tr
                    key={plan.studyPlan_id}
                    className="border-b last:border-none border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="p-3 whitespace-nowrap">
                      {plan.studyPlan_id}
                    </td>
                    <td className="p-3 whitespace-nowrap capitalize">
                      {plan.level}
                    </td>
                    <td className="p-3 whitespace-nowrap">{plan.grade}</td>
                    <td className="p-3 whitespace-nowrap">{plan.version}</td>
                    <td className="p-3 whitespace-nowrap capitalize">
                      {plan.state}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {formatDate(plan.effectiveFrom)}
                    </td>
                    <td className="p-3 whitespace-nowrap text-center">
                      {Array.isArray(plan.courses) ? plan.courses.length : 0}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/controlPanel/study-plans/${plan.studyPlan_id}`}
                          className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => remove(plan.studyPlan_id)}
                          className="btn-danger"
                        >
                          Delete
                        </button>
                      </div>
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
