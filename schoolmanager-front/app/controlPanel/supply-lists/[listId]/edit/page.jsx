"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authHeaders, fetchJSON } from "@/lib/api";

export default function EditSupplyListPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params?.listId;

  const [form, setForm] = useState({
    title: "",
    section_id: "",
    items: [],
  });
  const [sections, setSections] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [listData, sectionData] = await Promise.all([
          fetchJSON(`/supply-lists/${listId}`, { headers: { ...authHeaders() } }),
          fetchJSON("/sections", { headers: { ...authHeaders() } }),
        ]);
        setForm({
          title: listData?.title || "",
          section_id: listData?.section_id || "",
          items: Array.isArray(listData?.items)
            ? listData.items.map((it) => ({
                name: it.name || "",
                quantity: it.quantity || 1,
                note: it.note || "",
              }))
            : [],
        });
        setSections(Array.isArray(sectionData) ? sectionData : []);
      } catch (e) {
        setError(e.message || "Failed to load supply list");
      } finally {
        setLoading(false);
      }
    };
    if (listId) load();
  }, [listId]);

  const updateItem = (idx, key, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [key]: value };
      return { ...prev, items };
    });
  };

  const addItem = () =>
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, note: "" }],
    }));

  const removeItem = (idx) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (!form.title.trim()) throw new Error("title is required");
      if (!form.section_id.trim()) throw new Error("section_id is required");
      const items = form.items
        .filter((it) => it.name.trim())
        .map((it) => ({
          name: it.name.trim(),
          quantity: Number(it.quantity) || 1,
          note: it.note?.trim(),
        }));
      if (items.length === 0) throw new Error("At least one item is required");

      const payload = {
        title: form.title.trim(),
        section_id: form.section_id.trim(),
        items,
      };

      await fetchJSON(`/supply-lists/${listId}`, {
        method: "PUT",
        headers: { ...authHeaders() },
        body: JSON.stringify(payload),
      });

      router.push("/controlPanel/supply-lists");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/controlPanel/supply-lists");
    }
  };

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </button>
          {listId && (
            <div className="text-xs text-neutral-500">
              ID: <span className="font-mono">{listId}</span>
            </div>
          )}
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Edit Supply List</h1>
          <p className="text-sm text-neutral-500">
            Update items and assignment for this list
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
          {loading ? (
            <div className="p-4 text-sm text-neutral-500">Loading...</div>
          ) : (
            <form onSubmit={onSubmit} className="p-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm mb-1">Title</label>
                  <input
                    className="input w-full"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Section</label>
                  <select
                    className="input w-full"
                    value={form.section_id}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, section_id: e.target.value }))
                    }
                  >
                    <option value="">Select section</option>
                    {sections.map((s) => (
                      <option key={s.section_id} value={s.section_id}>
                        {s.section_id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">Items</h2>
                  <button
                    type="button"
                    onClick={addItem}
                    className="rounded-lg px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Add item
                  </button>
                </div>
                {form.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid gap-2 sm:grid-cols-3 items-center"
                  >
                    <input
                      className="input"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateItem(idx, "name", e.target.value)}
                    />
                    <input
                      className="input"
                      type="number"
                      min={1}
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(idx, "quantity", e.target.value)
                      }
                    />
                    <div className="flex gap-2 sm:col-span-1">
                      <input
                        className="input flex-1"
                        placeholder="Note (optional)"
                        value={item.note}
                        onChange={(e) => updateItem(idx, "note", e.target.value)}
                      />
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="rounded-lg px-2 py-1 text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}

              <div className="flex gap-2">
                <button disabled={saving} className="btn-primary">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
