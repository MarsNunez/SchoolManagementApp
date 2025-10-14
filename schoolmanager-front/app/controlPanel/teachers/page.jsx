"use client";

import { useEffect, useState } from "react";
import { fetchJSON, authHeaders } from "@/lib/api";

export default function TeachersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    dni: "",
    specialties: "",
    email: "",
    phone: "",
    photo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON("/teachers", {
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
    setForm({
      name: "",
      lastname: "",
      dni: "",
      specialties: "",
      email: "",
      phone: "",
      photo: "",
    });
  };

  const submitItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        lastname: form.lastname,
        dni: Number(form.dni),
        specialties: form.specialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        email: form.email,
        phone: form.phone,
        photo: form.photo,
      };
      if (editingId) {
        await fetchJSON(`/teachers/${editingId}`, {
          method: "PUT",
          headers: { ...authHeaders() },
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJSON("/teachers", {
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

  const remove = async (teacher_id) => {
    if (!confirm(`Delete ${teacher_id}?`)) return;
    try {
      await fetchJSON(`/teachers/${teacher_id}`, {
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
          <h1 className="text-2xl font-semibold">Teachers</h1>
          <p className="text-sm text-neutral-500">
            List, create and manage teachers
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
          <form onSubmit={submitItem} className="p-4 grid gap-3 sm:grid-cols-3">
            <input
              className="input"
              placeholder="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input"
              placeholder="lastname"
              value={form.lastname}
              onChange={(e) => setForm({ ...form, lastname: e.target.value })}
            />
            <input
              className="input"
              placeholder="dni"
              type="number"
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value })}
            />
            <input
              className="input"
              placeholder="specialties (comma separated)"
              value={form.specialties}
              onChange={(e) =>
                setForm({ ...form, specialties: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="input"
              placeholder="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="input sm:col-span-2"
              placeholder="photo url"
              value={form.photo}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
            />
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
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">DNI</th>
                  <th className="p-3">Specialties</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr
                    key={t.teacher_id}
                    className="border-b last:border-none border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="p-3 whitespace-nowrap">{t.teacher_id}</td>
                    <td className="p-3 whitespace-nowrap">
                      {t.name} {t.lastname}
                    </td>
                    <td className="p-3 whitespace-nowrap">{t.email}</td>
                    <td className="p-3 whitespace-nowrap">{t.dni}</td>
                    <td className="p-3">{(t.specialties || []).join(", ")}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(t.teacher_id);
                          setForm({
                            name: t.name || "",
                            lastname: t.lastname || "",
                            dni: String(t.dni || ""),
                            specialties: (t.specialties || []).join(", "),
                            email: t.email || "",
                            phone: t.phone || "",
                            photo: t.photo || "",
                          });
                        }}
                        className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(t.teacher_id)}
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

// Small utility styles
// Using tailwind classes via globals
const inputBase =
  "rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500";
const btnBase =
  "rounded-lg px-3 py-2 text-white text-sm font-medium transition-colors";

// Inject classes into global scope (JSX inline className references above)
