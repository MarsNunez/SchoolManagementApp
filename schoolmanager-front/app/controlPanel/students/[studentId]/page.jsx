"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchJSON, authHeaders } from "@/lib/api";

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.studentId;

  const [form, setForm] = useState({
    guardians: [{ full_name: "", phone: "", email: "" }],
    name: "",
    lastname: "",
    dni: "",
    birth_date: "",
    email: "",
    phone: "",
    address: "",
    current_courses: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));
  const updateGuardian = (idx, key) => (e) => setForm((s) => {
    const next = [...s.guardians];
    next[idx] = { ...next[idx], [key]: e.target.value };
    return { ...s, guardians: next };
  });
  const addGuardian = () => setForm((s) => ({ ...s, guardians: [...s.guardians, { full_name: "", phone: "", email: "" }] }));
  const removeGuardian = (idx) => setForm((s) => ({ ...s, guardians: s.guardians.filter((_, i) => i !== idx) }));

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchJSON(`/students/${studentId}`, { headers: { ...authHeaders() } });
        const birthStr = data?.birth_date ? new Date(data.birth_date).toISOString().slice(0, 10) : "";
        setForm({
          guardians: Array.isArray(data.guardians) && data.guardians.length > 0 ? data.guardians.map(g => ({ full_name: g.full_name || "", phone: g.phone || "", email: g.email || "" })) : [{ full_name: "", phone: "", email: "" }],
          name: data?.name || "",
          lastname: data?.lastname || "",
          dni: String(data?.dni ?? ""),
          birth_date: birthStr,
          email: data?.email || "",
          phone: data?.phone || "",
          address: data?.address || "",
          current_courses: Array.isArray(data?.current_courses) ? data.current_courses.join(", ") : "",
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (studentId) load();
  }, [studentId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      if (!form.name || !form.lastname || !form.dni || !form.email) {
        throw new Error("name, lastname, dni and email are required");
      }
      const payload = {
        guardians: form.guardians.filter(g => g.full_name && g.email).map(g => ({ full_name: g.full_name, phone: g.phone, email: g.email })),
        name: form.name,
        lastname: form.lastname,
        dni: Number(form.dni),
        birth_date: form.birth_date ? new Date(form.birth_date) : undefined,
        email: form.email,
        phone: form.phone,
        address: form.address,
        current_courses: form.current_courses ? form.current_courses.split(",").map(s => s.trim()).filter(Boolean) : [],
      };

      await fetchJSON(`/students/${studentId}`, {
        method: "PUT",
        headers: { ...authHeaders() },
        body: JSON.stringify(payload),
      });
      setSuccess("Student updated successfully");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
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
          <h1 className="text-2xl font-semibold">Edit Student</h1>
          <p className="text-sm text-neutral-500">Update student information</p>
        </header>

        {loading ? (
          <div className="text-sm text-neutral-500">Loading...</div>
        ) : (
          <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
            <form onSubmit={onSubmit} className="p-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input className="input w-full" value={form.name} onChange={update("name")} />
              </div>
              <div>
                <label className="block text-sm mb-1">Lastname</label>
                <input className="input w-full" value={form.lastname} onChange={update("lastname")} />
              </div>
              <div>
                <label className="block text-sm mb-1">DNI</label>
                <input className="input w-full" type="number" value={form.dni} onChange={update("dni")} />
              </div>
              <div>
                <label className="block text-sm mb-1">Birth date</label>
                <input className="input w-full" type="date" value={form.birth_date} onChange={update("birth_date")} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Email</label>
                <input className="input w-full" type="email" value={form.email} onChange={update("email")} />
              </div>
              <div>
                <label className="block text-sm mb-1">Phone</label>
                <input className="input w-full" value={form.phone} onChange={update("phone")} />
              </div>
              <div>
                <label className="block text-sm mb-1">Address</label>
                <input className="input w-full" value={form.address} onChange={update("address")} />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm">Guardians</label>
                  <button type="button" onClick={addGuardian} className="rounded-lg px-2 py-1 text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">Add</button>
                </div>
                {form.guardians.map((g, idx) => (
                  <div key={idx} className="grid gap-2 sm:grid-cols-3">
                    <input className="input" placeholder="Full name" value={g.full_name} onChange={updateGuardian(idx, "full_name")} />
                    <input className="input" placeholder="Phone" value={g.phone} onChange={updateGuardian(idx, "phone")} />
                    <div className="flex gap-2">
                      <input className="input flex-1" placeholder="Email" type="email" value={g.email} onChange={updateGuardian(idx, "email")} />
                      {form.guardians.length > 1 && (
                        <button type="button" onClick={() => removeGuardian(idx)} className="rounded-lg px-2 py-1 text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">Remove</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Current courses (comma separated)</label>
                <input className="input w-full" value={form.current_courses} onChange={update("current_courses")} />
              </div>

              {error && (
                <div className="sm:col-span-2 text-sm text-red-600">{error}</div>
              )}
              {success && (
                <div className="sm:col-span-2 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-md px-3 py-2">{success}</div>
              )}

              <div className="sm:col-span-2 flex gap-2">
                <button disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save"}</button>
                <button type="button" onClick={() => router.push("/controlPanel/students")} className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700">Cancel</button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}

