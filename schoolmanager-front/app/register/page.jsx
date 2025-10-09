"use client";

import { useState } from "react";

// export const metadata = {
//   title: "SchoolManager | Register",
//   description: "Create your staff account",
// };

export default function RegisterPage() {
  const [form, setForm] = useState({
    staff_id: "",
    name: "",
    lastname: "",
    dni: "",
    email: "",
    password: "",
    role: "admin",
    state: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const update = (key) => (e) =>
    setForm((s) => ({
      ...s,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      if (!token)
        throw new Error("Admin token required. Please login as admin first.");

      const payload = { ...form, dni: Number(form.dni) };

      const res = await fetch(`${API_URL}/staff/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Register failed");

      setSuccess("Staff created successfully");
      // Nota: no reemplazamos el token vigente (admin) con el del usuario creado.
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-emerald-600/10 grid place-items-center">
            <span className="text-2xl font-semibold text-emerald-600">SM</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-neutral-500">
            Register staff to access the dashboard
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/60 bg-white/70 dark:bg-neutral-900/60 dark:border-neutral-800 shadow-sm backdrop-blur">
          <form className="p-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="staff_id" className="block text-sm font-medium">
                Staff ID
              </label>
              <input
                id="staff_id"
                type="text"
                value={form.staff_id}
                onChange={update("staff_id")}
                placeholder="staff-001"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={update("name")}
                placeholder="Lucia"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastname" className="block text-sm font-medium">
                Lastname
              </label>
              <input
                id="lastname"
                type="text"
                value={form.lastname}
                onChange={update("lastname")}
                placeholder="Ramirez"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dni" className="block text-sm font-medium">
                DNI
              </label>
              <input
                id="dni"
                type="number"
                value={form.dni}
                onChange={update("dni")}
                placeholder="70234561"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@school.edu"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={update("password")}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium">
                Role
              </label>
              <select
                id="role"
                value={form.role}
                onChange={update("role")}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="admin">Admin</option>
                <option value="secretary">Secretary</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.state}
                  onChange={update("state")}
                  className="size-4 rounded border-neutral-300 dark:border-neutral-700"
                />
                Active state
              </label>
              <a className="text-emerald-600 hover:underline" href="/login">
                Already have an account?
              </a>
            </div>

            {error && (
              <div className="sm:col-span-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            {success && (
              <div className="sm:col-span-2 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-md px-3 py-2">
                {success}
              </div>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-emerald-600 text-white py-2.5 font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
