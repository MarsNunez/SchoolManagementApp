"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authHeaders, fetchJSON } from "@/lib/api";
import * as XLSX from "xlsx";

export default function SupplyListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params?.listId;

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const listData = await fetchJSON(`/supply-lists/${listId}`, {
          headers: { ...authHeaders() },
        });
        setList(listData);
      } catch (e) {
        setError(e.message || "Failed to load supply list");
      } finally {
        setLoading(false);
      }
    };
    if (listId) load();
  }, [listId]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/controlPanel/supply-lists");
    }
  };

  const downloadCsv = () => {
    if (!list) return;
    try {
      const rows = (list.items || []).map((it) => ({
        Item: it.name || "",
        Cantidad: it.quantity ?? "",
        Nota: it.note || "",
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "SupplyList");
      XLSX.writeFile(workbook, `supply-list-${list.list_id || "export"}.xlsx`);
    } catch (e) {
      console.error("Failed to export list:", e);
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
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                router.push(`/controlPanel/supply-lists/${listId}/edit`)
              }
              className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
            >
              Edit
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="h-9 w-9 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 flex items-center justify-center shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="More actions"
              >
                <i className="fa-solid fa-ellipsis-vertical text-neutral-600 dark:text-neutral-200"></i>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg py-1 z-20">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      downloadCsv();
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Download Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Supply List</h1>
          <p className="text-sm text-neutral-500">
            Details of this supply list and its items
          </p>
        </header>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm p-4 space-y-3">
          {loading ? (
            <div className="text-sm text-neutral-500">Loading...</div>
          ) : !list ? (
            <div className="text-sm text-red-600">List not found</div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-neutral-500">ID</div>
                  <div className="font-mono">{list.list_id}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Section</div>
                  <div className="font-medium">{list.section_id}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-neutral-500">Title</div>
                  <div className="font-medium">{list.title}</div>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200/60 dark:border-neutral-800 overflow-hidden mt-4">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200/60 dark:border-neutral-800">
                    <tr>
                      <th className="p-3 text-left">Item</th>
                      <th className="p-3 text-left">Quantity</th>
                      <th className="p-3 text-left">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(list.items || []).map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b last:border-none border-neutral-100 dark:border-neutral-800"
                      >
                        <td className="p-3 whitespace-nowrap">{item.name}</td>
                        <td className="p-3 whitespace-nowrap">
                          {item.quantity}
                        </td>
                        <td className="p-3">{item.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
