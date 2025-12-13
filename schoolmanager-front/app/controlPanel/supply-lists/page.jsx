"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authHeaders, fetchJSON } from "@/lib/api";
import { useLanguage } from "@/lib/languageContext";

export default function SupplyListsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { language } = useLanguage();
  const [confirmId, setConfirmId] = useState("");

  const t =
    language === "en"
      ? {
          back: "Back",
          create: "Create list",
          title: "Supply Lists",
          subtitle: "Manage school supply lists",
          loading: "Loading...",
          id: "ID",
          titleCol: "Title",
          section: "Section",
          items: "Items",
          actions: "Actions",
          more: "More",
          del: "Delete",
          confirmDel: (id) => `Delete ${id}?`,
          confirmTitle: "Delete supply list",
          confirmDesc: "Are you sure you want to delete this list?",
          cancel: "Cancel",
          confirm: "Delete",
        }
      : {
          back: "Volver",
          create: "Crear lista",
          title: "Listas de útiles",
          subtitle: "Gestiona las listas de útiles escolares",
          loading: "Cargando...",
          id: "ID",
          titleCol: "Título",
          section: "Sección",
          items: "Ítems",
          actions: "Acciones",
          more: "Más",
          del: "Eliminar",
          confirmDel: (id) => `Eliminar ${id}?`,
          confirmTitle: "Eliminar lista",
          confirmDesc: "¿Seguro que deseas eliminar esta lista?",
          cancel: "Cancelar",
          confirm: "Eliminar",
        };

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON("/supply-lists", {
        headers: { ...authHeaders() },
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (list_id) => {
    try {
      await fetchJSON(`/supply-lists/${list_id}`, {
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
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/controlPanel"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <i className="fa-solid fa-arrow-left"></i>
            {t.back}
          </Link>
          <Link
            href="/controlPanel/supply-lists/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            {t.create}
          </Link>
        </div>

        <header>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="text-sm text-neutral-500">
            {t.subtitle}
          </p>
        </header>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-neutral-500">{t.loading}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left border-b border-neutral-200/60 dark:border-neutral-800">
                <tr>
                  <th className="p-3">{t.id}</th>
                  <th className="p-3">{t.titleCol}</th>
                  <th className="p-3">{t.section}</th>
                  <th className="p-3">{t.items}</th>
                  <th className="p-3">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((list) => (
                  <tr
                    key={list.list_id}
                    className="border-b last:border-none border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="p-3 whitespace-nowrap">{list.list_id}</td>
                    <td className="p-3 whitespace-nowrap">{list.title}</td>
                    <td className="p-3 whitespace-nowrap">{list.section_id}</td>
                    <td className="p-3 whitespace-nowrap">
                      {Array.isArray(list.items) ? list.items.length : 0}
                    </td>
                  <td className="p-3 flex gap-2">
                    <Link
                      href={`/controlPanel/supply-lists/${list.list_id}`}
                      className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                    >
                        {t.more}
                    </Link>
                    <button
                      onClick={() => setConfirmId(list.list_id)}
                      className="btn-danger"
                    >
                      {t.del}
                    </button>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmId("")}
          ></div>
          <div className="relative w-full max-w-sm rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-5 space-y-3">
            <h2 className="text-lg font-semibold">{t.confirmTitle}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {t.confirmDesc}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmId("")}
                className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await remove(confirmId);
                  setConfirmId("");
                }}
                className="btn-danger text-sm"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
