'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { authHeaders, fetchJSON } from "@/lib/api";

const GROUP_OPTIONS = ["A", "B", "C", "D", "E"];

// Courses column/input no longer used

const emptyForm = {
  section_id: "",
  title: "",
  group: "A",
  studyPlan_id: "",
  teacher_id: "",
  year: new Date().getFullYear().toString(),
  max_capacity: "",
  current_capacity: "",
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

  const maxCapNumber = Number(form.max_capacity);
  const currentCapNumber = Number(form.current_capacity);

  const capacityError = useMemo(() => {
    if (
      !Number.isFinite(maxCapNumber) ||
      !Number.isFinite(currentCapNumber) ||
      maxCapNumber < 0 ||
      currentCapNumber < 0
    ) {
      return "Capacities must be non-negative numbers";
    }
    if (currentCapNumber > maxCapNumber) {
      return "Current capacity cannot exceed max capacity";
    }
    return "";
  }, [maxCapNumber, currentCapNumber]);

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
    if (capacityError) return;
    setSubmitting(true);
    setError("");
    try {
      if (!form.section_id.trim()) {
        throw new Error("section_id is required");
      }
      if (!form.title.trim()) {
        throw new Error("title is required");
      }
      if (!form.studyPlan_id.trim()) {
        throw new Error("studyPlan_id is required");
      }
      if (!form.teacher_id.trim()) {
        throw new Error("teacher_id is required");
      }

      const payload = {
        section_id: form.section_id.trim(),
        title: form.title.trim(),
        group: form.group,
        studyPlan_id: form.studyPlan_id.trim(),
        teacher_id: form.teacher_id.trim(),
        year: Number(form.year) || new Date().getFullYear(),
        max_capacity: maxCapNumber,
        current_capacity: currentCapNumber,
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
      section_id: section.section_id,
      title: section.title,
      group: section.group,
      studyPlan_id: section.studyPlan_id,
      teacher_id: section.teacher_id,
      year: String(section.year ?? ""),
      max_capacity: String(section.max_capacity ?? ""),
      current_capacity: String(section.current_capacity ?? ""),
      courses: toCourseString(section.courses),
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
          <form
            onSubmit={onSubmit}
            className="p-4 grid gap-3 sm:grid-cols-4"
          >
            <input
              className="input"
              placeholder="section_id"
              value={form.section_id}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, section_id: e.target.value }))
              }
              disabled={!!editingId}
            />
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
                  {teacher.teacher_id}
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
              placeholder="max capacity"
              value={form.max_capacity}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  max_capacity: e.target.value,
                }))
              }
            />
            <input
              className="input"
              type="number"
              placeholder="current capacity"
              value={form.current_capacity}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  current_capacity: e.target.value,
                }))
              }
            />
            {/* courses input removed */}

            {(error || capacityError) && (
              <div className="sm:col-span-4 text-sm text-red-600">
                {error || capacityError}
              </div>
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
                  {/* Courses column removed */}
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((section) => (
                  <tr
                    key={section.section_id}
                    className="border-b last:border-none border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="p-3 whitespace-nowrap">
                      {section.section_id}
                    </td>
                    <td className="p-3 whitespace-nowrap">{section.title}</td>
                    <td className="p-3 whitespace-nowrap">{section.group}</td>
                    <td className="p-3 whitespace-nowrap">
                      {section.studyPlan_id}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {section.teacher_id}
                    </td>
                    <td className="p-3 whitespace-nowrap">{section.year}</td>
                    <td className="p-3 whitespace-nowrap">
                      {section.current_capacity}/{section.max_capacity}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
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
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
