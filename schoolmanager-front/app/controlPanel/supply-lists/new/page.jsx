"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authHeaders, fetchJSON } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";

export default function NewSupplyListPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [form, setForm] = useState({
    title: "",
    section_id: "",
    items: [{ name: "", quantity: 1, note: "" }],
  });
  const [sections, setSections] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJSON("/sections", {
          headers: { ...authHeaders() },
        });
        setSections(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn("Failed to load sections:", e.message);
      }
    })();
  }, []);

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
    setLoading(true);
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

      await fetchJSON("/supply-lists", {
        method: "POST",
        headers: { ...authHeaders() },
        body: JSON.stringify(payload),
      });

      router.push("/controlPanel/supply-lists");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/controlPanel/supply-lists");
    }
  };

  const t =
    language === "en"
      ? {
          back: "Back",
          title: "Create Supply List",
          subtitle: "Assign a list of items to a section",
          fieldTitle: "Title",
          fieldSection: "Section",
          selectSection: "Select section",
          items: "Items",
          addItem: "Add item",
          itemName: "Item name",
          quantity: "Quantity",
          note: "Note (optional)",
          save: "Create",
          cancel: "Cancel",
        }
      : {
          back: "Volver",
          title: "Crear lista de útiles",
          subtitle: "Asigna una lista de ítems a una sección",
          fieldTitle: "Título",
          fieldSection: "Sección",
          selectSection: "Selecciona sección",
          items: "Ítems",
          addItem: "Agregar ítem",
          itemName: "Nombre del ítem",
          quantity: "Cantidad",
          note: "Nota (opcional)",
          save: "Crear",
          cancel: "Cancelar",
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
            {t.back}
          </button>
        </div>

        <header>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="text-sm text-neutral-500">
            {t.subtitle}
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
          <form onSubmit={onSubmit} className="p-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">{t.fieldTitle}</label>
                <input
                  className="input w-full"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm mb-1">{t.fieldSection}</label>
                <select
                  className="input w-full"
                  value={form.section_id}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, section_id: e.target.value }))
                  }
                >
                  <option value="">{t.selectSection}</option>
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
                <h2 className="text-sm font-medium">{t.items}</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-lg px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {t.addItem}
                </button>
              </div>
              {form.items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid gap-2 sm:grid-cols-3 items-center"
                >
                  <input
                    className="input"
                    placeholder={t.itemName}
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                  />
                  <input
                    className="input"
                    type="number"
                    min={1}
                    placeholder={t.quantity}
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                  />
                  <div className="flex gap-2 sm:col-span-1">
                    <input
                      className="input flex-1"
                      placeholder={t.note}
                      value={item.note}
                      onChange={(e) => updateItem(idx, "note", e.target.value)}
                    />
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="rounded-lg px-2 py-1 text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        {language === "en" ? "Remove" : "Quitar"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex gap-2">
              <button disabled={loading} className="btn-primary">
                {loading ? (language === "en" ? "Creating..." : "Creando...") : t.save}
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
