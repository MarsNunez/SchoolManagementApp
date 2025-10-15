"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchJSON, authHeaders } from "@/lib/api";

export default function NewStudentPage() {
  const [form, setForm] = useState({
    student_id: "",
    parents_id: "",
    name: "",
    lastname: "",
    dni: "",
    birth_date: "",
    email: "",
    phone: "",
    address: "",
    current_courses: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (!form.student_id || !form.name || !form.lastname || !form.dni || !form.email) {
        throw new Error("student_id, name, lastname, dni and email are required");
      }
      const payload = {
        student_id: form.student_id,
        parents_id: form.parents_id
          ? form.parents_id.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        name: form.name,
        lastname: form.lastname,
        dni: Number(form.dni),
        birth_date: form.birth_date ? new Date(form.birth_date) : undefined,
        email: form.email,
        phone: form.phone,
        address: form.address,
        current_courses: form.current_courses
          ? form.current_courses.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };

      await fetchJSON("/students", {
        method: "POST",
        headers: { ...authHeaders() },
        body: JSON.stringify(payload),
      });

      setSuccess("Student created successfully");
      setForm({
        student_id: "",
        parents_id: "",
        name: "",
        lastname: "",
        dni: "",
        birth_date: "",
        email: "",
        phone: "",
        address: "",
        current_courses: "",
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="mb-2 flex items-center justify-between">
          <Link href="/controlPanel/students" className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </Link>
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Register Student</h1>
          <p className="text-sm text-neutral-500">Fill in all required details to create a new student</p>
        </header>

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
          <form onSubmit={onSubmit} className="p-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Student ID</label>
              <input className="input w-full" placeholder="student-001" value={form.student_id} onChange={update("student_id")} />
            </div>
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input className="input w-full" placeholder="Mateo" value={form.name} onChange={update("name")} />
            </div>
            <div>
              <label className="block text-sm mb-1">Lastname</label>
              <input className="input w-full" placeholder="Torres" value={form.lastname} onChange={update("lastname")} />
            </div>
            <div>
              <label className="block text-sm mb-1">DNI</label>
              <input className="input w-full" type="number" placeholder="30123451" value={form.dni} onChange={update("dni")} />
            </div>
            <div>
              <label className="block text-sm mb-1">Birth date</label>
              <input className="input w-full" type="date" value={form.birth_date} onChange={update("birth_date")} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Email</label>
              <input className="input w-full" type="email" placeholder="student@school.edu" value={form.email} onChange={update("email")} />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input className="input w-full" placeholder="+51911111111" value={form.phone} onChange={update("phone")} />
            </div>
            <div>
              <label className="block text-sm mb-1">Address</label>
              <input className="input w-full" placeholder="Av. Primavera 123" value={form.address} onChange={update("address")} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Parents IDs (comma separated)</label>
              <input className="input w-full" placeholder="parent-001, parent-002" value={form.parents_id} onChange={update("parents_id")} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Current courses (comma separated)</label>
              <input className="input w-full" placeholder="course-math-01, course-english-01" value={form.current_courses} onChange={update("current_courses")} />
            </div>

            {error && (
              <div className="sm:col-span-2 text-sm text-red-600">{error}</div>
            )}
            {success && (
              <div className="sm:col-span-2 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-md px-3 py-2">{success}</div>
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

