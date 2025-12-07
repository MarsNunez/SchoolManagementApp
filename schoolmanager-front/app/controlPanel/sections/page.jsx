"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { authHeaders, fetchJSON } from "@/lib/api";

const GROUP_OPTIONS = ["A", "B", "C", "D", "E"];

// Courses column/input no longer used

const emptyForm = {
  title: "",
  group: "A",
  studyPlan_id: "",
  teacher_id: "",
  year: new Date().getFullYear().toString(),
  start_capacity: "",
};

const GROUP_BADGE_STYLES = {
  A: "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  B: "border-blue-600 bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  C: "border-violet-600 bg-violet-50 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  D: "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  E: "border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

export default function SectionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [studyPlans, setStudyPlans] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState("");

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
    const fetchAuxiliary = async () => {
      try {
        const [planData, teacherData] = await Promise.all([
          fetchJSON("/study-plans", { headers: { ...authHeaders() } }),
          fetchJSON("/teachers", { headers: { ...authHeaders() } }),
        ]);
        setStudyPlans(Array.isArray(planData) ? planData : []);
        setTeachers(Array.isArray(teacherData) ? teacherData : []);
      } catch (e) {
        console.warn("Auxiliary fetch failed:", e.message);
      }
    };
    fetchAuxiliary();
  }, []);

  const resetForm = () => {
    setEditingId("");
    setForm(emptyForm);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (!form.title.trim()) {
        throw new Error("title is required");
      }
      if (!form.studyPlan_id.trim()) {
        throw new Error("studyPlan_id is required");
      }
      if (!form.teacher_id.trim()) {
        throw new Error("teacher_id is required");
      }
      const startCapNumber = Number(form.start_capacity);
      if (!Number.isFinite(startCapNumber) || startCapNumber < 0) {
        throw new Error("start_capacity must be a non-negative number");
      }

      const payload = {
        title: form.title.trim(),
        group: form.group,
        studyPlan_id: form.studyPlan_id.trim(),
        teacher_id: form.teacher_id.trim(),
        year: Number(form.year) || new Date().getFullYear(),
        start_capacity: startCapNumber,
      };

      if (editingId) {
        await fetchJSON(`/sections/${editingId}`, {
          method: "PUT",
          headers: { ...authHeaders() },
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJSON("/sections", {
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

  const remove = async (section_id) => {
    if (!confirm(`Delete ${section_id}?`)) return;
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

  const edit = (section) => {
    setEditingId(section.section_id);
    setForm({
      title: section.title || "",
      group: section.group || "A",
      studyPlan_id: section.studyPlan_id || "",
      teacher_id: section.teacher_id || "",
      year: String(section.year ?? ""),
      start_capacity: String(
        section.start_capacity ?? section.max_capacity ?? ""
      ),
    });
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
            Back
          </Link>
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Sections</h1>
          <p className="text-sm text-neutral-500">
            List, create and manage sections
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
          <form onSubmit={onSubmit} className="p-4 grid gap-3 sm:grid-cols-4">
            <input
              className="input"
              placeholder="title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <select
              className="input"
              value={form.group}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, group: e.target.value }))
              }
            >
              {GROUP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Group {option}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={form.studyPlan_id}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, studyPlan_id: e.target.value }))
              }
            >
              <option value="">Select study plan</option>
              {studyPlans.map((plan) => (
                <option key={plan.studyPlan_id} value={plan.studyPlan_id}>
                  {plan.studyPlan_id}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={form.teacher_id}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, teacher_id: e.target.value }))
              }
            >
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.teacher_id} value={teacher.teacher_id}>
                  {teacher.name} {teacher.lastname}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              placeholder="year"
              value={form.year}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, year: e.target.value }))
              }
            />
            <input
              className="input"
              type="number"
              placeholder="start capacity"
              value={form.start_capacity}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  start_capacity: e.target.value,
                }))
              }
            />
            {/* courses input removed */}

            {error && (
              <div className="sm:col-span-4 text-sm text-red-600">{error}</div>
            )}

            <div className="flex gap-2">
              <button disabled={submitting} className="btn-primary">
                {submitting
                  ? editingId
                    ? "Saving..."
                    : "Creating..."
                  : editingId
                  ? "Save"
                  : "Create"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-neutral-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left border-b border-neutral-200/60 dark:border-neutral-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Group</th>
                  <th className="p-3">Study Plan</th>
                  <th className="p-3">Teacher</th>
                  <th className="p-3">Year</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((section) => {
                  const group = String(section.group || "").toUpperCase();
                  const groupClasses =
                    GROUP_BADGE_STYLES[group] ||
                    "border-neutral-400 bg-neutral-50 text-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-200";

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
                          className={`border w-fit py-1 px-2 rounded-lg text-xs font-medium ${groupClasses}`}
                        >
                          {group}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {section.studyPlan_id}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {(() => {
                          const teacher = teacherById[section.teacher_id];
                          return teacher
                            ? `${teacher.name} ${teacher.lastname}`
                            : section.teacher_id;
                        })()}
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
                            Info
                          </Link>
                          <button
                            onClick={() => edit(section)}
                            className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => remove(section.section_id)}
                            className="btn-danger"
                          >
                            Delete
                          </button>
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
