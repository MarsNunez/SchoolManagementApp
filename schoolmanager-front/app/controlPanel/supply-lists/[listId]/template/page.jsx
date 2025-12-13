"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authHeaders, fetchJSON } from "@/lib/api";

const TEMPLATE_OPTIONS = [
  {
    id: "default",
    label: "Marco colorido",
    // Usa la imagen base que compartiste. Colócala en /public/supply-template.jpg
    src: "/supply-template.jpg",
  },
  {
    id: "clean",
    label: "Limpio",
    src: "/supply-templates/clean.jpg",
  },
];

const clampPadding = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 200) return 200;
  return n;
};

export default function SupplyListTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const listId = params?.listId;

  const [template, setTemplate] = useState("default");
  const [padding, setPadding] = useState({
    top: 80,
    right: 80,
    bottom: 80,
    left: 80,
  });
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchJSON(`/supply-lists/${listId}`, {
          headers: { ...authHeaders() },
        });
        setList(data);
        setTemplate(data?.template || "default");
        setPadding({
          top: data?.paddingTop ?? 80,
          right: data?.paddingRight ?? 80,
          bottom: data?.paddingBottom ?? 80,
          left: data?.paddingLeft ?? 80,
        });
      } catch (e) {
        setError(e.message || "Failed to load list");
      } finally {
        setLoading(false);
      }
    };
    if (listId) load();
  }, [listId]);

  const handlePaddingChange = (key) => (e) =>
    setPadding((prev) => ({ ...prev, [key]: clampPadding(e.target.value) }));

  const previewStyle = useMemo(() => {
    const currentTemplate =
      TEMPLATE_OPTIONS.find((t) => t.id === template) || TEMPLATE_OPTIONS[0];
    return {
      backgroundImage: `url(${currentTemplate.src})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      paddingTop: `${padding.top}px`,
      paddingRight: `${padding.right}px`,
      paddingBottom: `${padding.bottom}px`,
      paddingLeft: `${padding.left}px`,
      backgroundColor: "#f5f7ff", // fallback color if image fails
    };
  }, [template, padding]);

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      await fetchJSON(`/supply-lists/${listId}`, {
        method: "PUT",
        headers: { ...authHeaders() },
        body: JSON.stringify({
          template,
          paddingTop: padding.top,
          paddingRight: padding.right,
          paddingBottom: padding.bottom,
          paddingLeft: padding.left,
        }),
      });
      router.push(`/controlPanel/supply-lists/${listId}`);
    } catch (e) {
      setError(e.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(`/controlPanel/supply-lists/${listId}`);
    }
  };

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </button>
          <div className="text-xs text-neutral-500">
            {listId && <span className="font-mono">ID: {listId}</span>}
          </div>
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Template & Padding</h1>
          <p className="text-sm text-neutral-500">
            Choose the image frame and adjust the padding for this list
          </p>
        </header>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm p-4 space-y-4">
            <h2 className="text-sm font-medium">Template</h2>
            <div className="grid gap-3">
              {TEMPLATE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTemplate(opt.id)}
                  className={`border rounded-xl p-2 text-left ${
                    template === opt.id
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="mt-2 h-24 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${opt.src})` }}
                    />
                    <div className="absolute bottom-1 right-1 text-[10px] bg-white/80 dark:bg-black/50 rounded px-2 py-0.5 text-neutral-600 dark:text-neutral-300">
                      {opt.src}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-medium">Padding</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="space-y-1">
                <span className="text-neutral-500">Top</span>
                <input
                  className="input w-full"
                  type="number"
                  min={0}
                  max={200}
                  value={padding.top}
                  onChange={handlePaddingChange("top")}
                />
              </label>
              <label className="space-y-1">
                <span className="text-neutral-500">Right</span>
                <input
                  className="input w-full"
                  type="number"
                  min={0}
                  max={200}
                  value={padding.right}
                  onChange={handlePaddingChange("right")}
                />
              </label>
              <label className="space-y-1">
                <span className="text-neutral-500">Bottom</span>
                <input
                  className="input w-full"
                  type="number"
                  min={0}
                  max={200}
                  value={padding.bottom}
                  onChange={handlePaddingChange("bottom")}
                />
              </label>
              <label className="space-y-1">
                <span className="text-neutral-500">Left</span>
                <input
                  className="input w-full"
                  type="number"
                  min={0}
                  max={200}
                  value={padding.left}
                  onChange={handlePaddingChange("left")}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTemplate(list?.template || "default");
                  setPadding({
                    top: list?.paddingTop ?? 80,
                    right: list?.paddingRight ?? 80,
                    bottom: list?.paddingBottom ?? 80,
                    left: list?.paddingLeft ?? 80,
                  });
                }}
                className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
              >
                Reset
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm p-4 space-y-3 lg:col-span-1 lg:row-span-2">
            <h2 className="text-sm font-medium">Preview</h2>
            <div className="relative bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200/60 dark:border-neutral-700 overflow-hidden h-96">
              <div
                className="absolute inset-0 flex flex-col text-black"
                style={previewStyle}
              >
                <div className="text-lg font-semibold mb-2 text-center">
                  {list?.title || "Supply List"}
                </div>
                <div className="space-y-1 text-sm">
                  {(list?.items || [])
                    .slice(0, 3)
                    .map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.name || "Item"}</span>
                        <span className="text-xs text-neutral-600">
                          Qty: {it.quantity ?? ""}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              Usa el selector y el padding para ajustar el marco. La descarga en
              PDF intentará usar la imagen seleccionada; si no se encuentra, se
              usará un fondo sencillo.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
