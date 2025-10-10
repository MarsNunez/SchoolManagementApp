"use client";

import { useEffect, useState } from "react";
import { fetchJSON, authHeaders } from "@/lib/api";

export default function StaffPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    staff_id: "",
    name: "",
    lastname: "",
    dni: "",
    email: "",
    password: "",
    role: "secretary",
    state: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON("/staff", { headers: { ...authHeaders() } });
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setEditingId(""); setForm({ staff_id:"", name:"", lastname:"", dni:"", email:"", password:"", role:"secretary", state:true }); };

  const submitItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = { ...form, dni: Number(form.dni) };
      if (editingId) {
        // Do not send empty password on update
        if (!payload.password) delete payload.password;
        await fetchJSON(`/staff/${editingId}`, { method: "PUT", headers: { ...authHeaders() }, body: JSON.stringify(payload) });
      } else {
        await fetchJSON("/staff/register", { method: "POST", headers: { ...authHeaders() }, body: JSON.stringify(payload) });
      }
      resetForm();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (staff_id) => {
    if (!confirm(`Delete ${staff_id}?`)) return;
    try {
      await fetchJSON(`/staff/${staff_id}`, { method: "DELETE", headers: { ...authHeaders() } });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Staff</h1>
          <p className="text-sm text-neutral-500">Admins and secretaries management</p>
        </header>

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
          <form onSubmit={submitItem} className="p-4 grid gap-3 sm:grid-cols-3">
            <input className="input" placeholder="staff_id" value={form.staff_id} onChange={(e)=>setForm({...form, staff_id:e.target.value})} />
            <input className="input" placeholder="name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
            <input className="input" placeholder="lastname" value={form.lastname} onChange={(e)=>setForm({...form, lastname:e.target.value})} />
            <input className="input" placeholder="dni" type="number" value={form.dni} onChange={(e)=>setForm({...form, dni:e.target.value})} />
            <input className="input" placeholder="email" type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />
            <input className="input" placeholder="password" type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} />
            <select className="input" value={form.role} onChange={(e)=>setForm({...form, role:e.target.value})}>
              <option value="admin">Admin</option>
              <option value="secretary">Secretary</option>
              <option value="teacher">Teacher</option>
            </select>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4" checked={form.state} onChange={(e)=>setForm({...form, state:e.target.checked})} />
              Active
            </label>
            {error && <div className="sm:col-span-3 text-sm text-red-600">{error}</div>}
            <div className="flex gap-2">
              <button disabled={submitting} className="btn-primary">{submitting ? (editingId?"Saving...":"Creating...") : (editingId?"Save":"Create")}</button>
              {editingId && (
                <button type="button" onClick={resetForm} className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700">Cancel</button>
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
                  <th className="p-3">Role</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.staff_id} className="border-b last:border-none border-neutral-100 dark:border-neutral-800">
                    <td className="p-3 whitespace-nowrap">{s.staff_id}</td>
                    <td className="p-3 whitespace-nowrap">{s.name} {s.lastname}</td>
                    <td className="p-3 whitespace-nowrap">{s.email}</td>
                    <td className="p-3 whitespace-nowrap">{s.role}</td>
                    <td className="p-3 whitespace-nowrap">{String(s.state)}</td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => { setEditingId(s.staff_id); setForm({ staff_id:s.staff_id, name:s.name||"", lastname:s.lastname||"", dni:String(s.dni||""), email:s.email||"", password:"", role:s.role||"secretary", state:!!s.state }); }} className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700">Edit</button>
                      <button onClick={() => remove(s.staff_id)} className="btn-danger">Delete</button>
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
