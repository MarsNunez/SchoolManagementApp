"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function NewStudyPlanPage() {
  const [form, setForm] = useState({
    level: "primaria",
    grade: "1",
    effectiveFrom: "",
    state: "draft",
    minGrade: "12",
    courses: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const data = await fetchJSON("/courses", {
          headers: { ...authHeaders() },
        });
        setCourses(Array.isArray(data) ? data : []);
      } catch (e) {
        setCoursesError(e.message || "Failed to load courses");
      } finally {
        setCoursesLoading(false);
      }
    };

    loadCourses();
  }, []);

  const update = (key) => (e) =>
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

  const toggleCourse = (courseId) => {
    setForm((prev) => {
      const current = Array.isArray(prev.courses) ? prev.courses : [];
      const exists = current.includes(courseId);
      const nextCourses = exists
        ? current.filter((id) => id !== courseId)
        : [...current, courseId];
      return { ...prev, courses: nextCourses };
    });
  };

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

    setLoading(true);
    try {
      const payload = {
        level: form.level,
        effectiveFrom: form.effectiveFrom,
        state: form.state,
        grade: gradeNum,
        minGrade: minGradeNum,
        courses: Array.isArray(form.courses) ? form.courses : [],
      };

      await fetchJSON("/study-plans", {
        method: "POST",
        headers: { ...authHeaders() },
        body: JSON.stringify(payload),
      });

      setSuccess("Study plan created successfully");
      setForm({
        level: "primaria",
        grade: "1",
        effectiveFrom: "",
        state: "draft",
        minGrade: "12",
        courses: [],
      });
    } catch (e) {
      setError(e.message || "Failed to create study plan");
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-semibold">Register Study Plan</h1>
          <p className="text-sm text-neutral-500">
            Provide details to create a new study plan
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
          <form
            onSubmit={onSubmit}
            className="p-4 grid gap-3 sm:grid-cols-2"
          >
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
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-sm mb-1">Courses</label>
              <input
                className="input w-full"
                placeholder="Search courses by ID or title"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
              />
              <div className="max-h-64 overflow-y-auto rounded-lg border border-neutral-200/60 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/60 px-3 py-2 space-y-1">
                {coursesLoading ? (
                  <div className="text-xs text-neutral-500">
                    Loading courses...
                  </div>
                ) : coursesError ? (
                  <div className="text-xs text-red-600">{coursesError}</div>
                ) : courses.length === 0 ? (
                  <div className="text-xs text-neutral-500">
                    No courses available.
                  </div>
                ) : (
                  (courses || [])
                    .filter((course) => {
                      if (!courseSearch.trim()) return true;
                      const query = courseSearch.toLowerCase();
                      const id = String(course.course_id || "").toLowerCase();
                      const title = String(course.title || "").toLowerCase();
                      return (
                        id.includes(query) ||
                        title.includes(query)
                      );
                    })
                    .map((course) => {
                      const checked = Array.isArray(form.courses)
                        ? form.courses.includes(course.course_id)
                        : false;
                      return (
                        <label
                          key={course.course_id}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="size-4 rounded border-neutral-300 dark:border-neutral-700"
                            checked={checked}
                            onChange={() => toggleCourse(course.course_id)}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {course.title || course.course_id}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {course.course_id}
                            </span>
                          </div>
                        </label>
                      );
                    })
                )}
              </div>
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

            <div className="sm:col-span-2">
              <button disabled={loading} className="btn-primary">
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
