"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchJSON, authHeaders } from "@/lib/api";

const LEVELS = [
  { value: "primaria", label: "Primaria" },
  { value: "secundaria", label: "Secundaria" },
];

const STATES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

const toFormState = (data) => ({
  level: data?.level || "primaria",
  grade: data?.grade != null ? String(data.grade) : "",
  effectiveFrom: data?.effectiveFrom
    ? new Date(data.effectiveFrom).toISOString().slice(0, 10)
    : "",
  state: data?.state || "draft",
  minGrade: data?.minGrade != null ? String(data.minGrade) : "12",
  courses: Array.isArray(data?.courses) ? data.courses.join(", ") : "",
});

const toBaseline = (data) => ({
  level: data?.level || "primaria",
  grade:
    typeof data?.grade === "number"
      ? data.grade
      : Number.isFinite(Number(data?.grade))
      ? Number(data?.grade)
      : 1,
  effectiveFrom: data?.effectiveFrom
    ? new Date(data.effectiveFrom).toISOString().slice(0, 10)
    : "",
  state: data?.state || "draft",
  minGrade:
    typeof data?.minGrade === "number"
      ? data.minGrade
      : Number.isFinite(Number(data?.minGrade))
      ? Number(data?.minGrade)
      : 12,
  courses: Array.isArray(data?.courses) ? [...data.courses] : [],
});

const arraysEqual = (a = [], b = []) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export default function EditStudyPlanPage() {
  const params = useParams();
  const router = useRouter();
  const studyPlanId = params?.studyPlanId;

  const [form, setForm] = useState({
    level: "primaria",
    grade: "",
    effectiveFrom: "",
    state: "draft",
    minGrade: "12",
    courses: "",
  });
  const [version, setVersion] = useState(1);
  const [baseline, setBaseline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchJSON(`/study-plans/${studyPlanId}`, {
          headers: { ...authHeaders() },
        });
        setForm(toFormState(data));
        setVersion(data?.version ?? 1);
        setBaseline(toBaseline(data));
      } catch (e) {
        setError(e.message || "Failed to load study plan");
      } finally {
        setLoading(false);
      }
    };

    if (studyPlanId) {
      load();
    }
  }, [studyPlanId]);

  const update = (key) => (e) =>
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const gradeNum = Number(form.grade);
    const minGradeNum = form.minGrade ? Number(form.minGrade) : 12;

    if (!form.effectiveFrom) {
      setError("effectiveFrom date is required");
      return;
    }
    if (!Number.isFinite(gradeNum) || gradeNum < 1 || gradeNum > 6) {
      setError("grade must be a number between 1 and 6");
      return;
    }
    if (!Number.isFinite(minGradeNum)) {
      setError("minGrade must be a number");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        level: form.level,
        effectiveFrom: form.effectiveFrom,
        state: form.state,
        grade: gradeNum,
        minGrade: minGradeNum,
        courses: form.courses
          ? form.courses
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };

      const changes = Object.entries(payload).reduce((acc, [key, value]) => {
        const original = baseline ? baseline[key] : undefined;
        const equal =
          Array.isArray(value) && Array.isArray(original)
            ? arraysEqual(value, original)
            : value === original;
        if (!equal) {
          acc[key] = value;
        }
        return acc;
      }, {});

      if (Object.keys(changes).length === 0) {
        setSuccess("");
        setError("No changes detected");
        setSaving(false);
        return;
      }

      const updated = await fetchJSON(`/study-plans/${studyPlanId}`, {
        method: "PUT",
        headers: { ...authHeaders() },
        body: JSON.stringify(changes),
      });

      if (updated) {
        setForm(toFormState(updated));
        setVersion((prev) =>
          updated?.version != null ? updated.version : prev
        );
        setBaseline(toBaseline(updated));
      }

      setSuccess("Study plan updated successfully");
      setError("");
    } catch (e) {
      setError(e.message || "Failed to update study plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/controlPanel/study-plans"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </Link>
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Edit Study Plan</h1>
          <p className="text-sm text-neutral-500">
            Update study plan information
          </p>
        </header>

        {loading ? (
          <div className="text-sm text-neutral-500">Loading...</div>
        ) : (
          <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
            <form
              onSubmit={onSubmit}
              className="p-4 grid gap-3 sm:grid-cols-2"
            >
              <div>
                <label className="block text-sm mb-1">Study Plan ID</label>
                <input
                  className="input w-full bg-neutral-100 dark:bg-neutral-800"
                  value={studyPlanId || ""}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Version</label>
                <input
                  className="input w-full bg-neutral-100 dark:bg-neutral-800"
                  value={version}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Level</label>
                <select
                  className="input w-full"
                  value={form.level}
                  onChange={update("level")}
                >
                  {LEVELS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Grade</label>
                <input
                  className="input w-full"
                  type="number"
                  min={1}
                  max={6}
                  value={form.grade}
                  onChange={update("grade")}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Effective From</label>
                <input
                  className="input w-full"
                  type="date"
                  value={form.effectiveFrom}
                  onChange={update("effectiveFrom")}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">State</label>
                <select
                  className="input w-full"
                  value={form.state}
                  onChange={update("state")}
                >
                  {STATES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Minimum Grade</label>
                <input
                  className="input w-full"
                  type="number"
                  min={0}
                  value={form.minGrade}
                  onChange={update("minGrade")}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">
                  Courses (comma separated)
                </label>
                <textarea
                  className="input w-full min-h-24"
                  value={form.courses}
                  onChange={update("courses")}
                />
              </div>

              {error && (
                <div className="sm:col-span-2 text-sm text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="sm:col-span-2 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-md px-3 py-2">
                  {success}
                </div>
              )}

              <div className="sm:col-span-2 flex gap-2">
                <button disabled={saving} className="btn-primary">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push("/controlPanel/study-plans")
                  }
                  className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
