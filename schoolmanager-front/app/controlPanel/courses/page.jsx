"use client";

import { useEffect, useState } from "react";
import { fetchJSON, authHeaders } from "@/lib/api";

export default function CoursesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        errs.title = "Title is required";
      const parsedDuration = Number(form.duration);
      if (!Number.isFinite(parsedDuration) || parsedDuration < 0)
        errs.duration = "Duration must be a non-negative number";
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

  const remove = async (course_id) => {
    if (!confirm(`Delete ${course_id}?`)) return;
    try {
      await fetchJSON(`/courses/${course_id}`, {
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
        <header>
          <h1 className="text-2xl font-semibold">Courses</h1>
          <p className="text-sm text-neutral-500">
            List, create and manage courses
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
          <form onSubmit={submitItem} className="p-4 grid gap-3 sm:grid-cols-3">
            <div>
              <input
                className={`input w-full ${
                  fieldErrors.title ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="title"
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
            <input
              className="input"
              placeholder="teacher_id"
              value={form.teacher_id}
              onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
            />
            <input
              className="input sm:col-span-2"
              placeholder="description"
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
                placeholder="duration (hours)"
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
                  <th className="p-3">Teacher</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Actions</th>
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
                    <td className="p-3 whitespace-nowrap">{c.teacher_id}</td>
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
                        Edit
                      </button>
                      <button
                        onClick={() => remove(c.course_id)}
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
