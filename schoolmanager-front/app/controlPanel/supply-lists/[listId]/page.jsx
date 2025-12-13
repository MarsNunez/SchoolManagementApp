"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authHeaders, fetchJSON } from "@/lib/api";
import * as XLSX from "xlsx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useLanguage } from "@/lib/languageContext";

export default function SupplyListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params?.listId;
  const { language } = useLanguage();

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
        setError(e.message || (language === "en" ? "Failed to load supply list" : "Error al cargar la lista"));
      } finally {
        setLoading(false);
      }
    };
    if (listId) load();
  }, [listId, language]);

  const handleBack = () => {
    router.push("/controlPanel/supply-lists");
  };

  const downloadCsv = () => {
    if (!list) return;
    try {
      const rows = (list.items || []).map((it) => ({
        [language === "en" ? "Item" : "Ítem"]: it.name || "",
        [language === "en" ? "Quantity" : "Cantidad"]: it.quantity ?? "",
        [language === "en" ? "Note" : "Nota"]: it.note || "",
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "SupplyList");
      XLSX.writeFile(workbook, `supply-list-${list.list_id || "export"}.xlsx`);
    } catch (e) {
      console.error("Failed to export list:", e);
    }
  };

  const downloadPdf = () => {
    if (!list) return;
    (async () => {
      try {
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([595, 842]); // A4
        let { width, height } = page.getSize();
        const padLeft = Number(list.paddingLeft ?? 80);
        const padRight = Number(list.paddingRight ?? 80);
        const padTop = Number(list.paddingTop ?? 80);
        const padBottom = Number(list.paddingBottom ?? 80);

        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const drawBackground = async (targetPage) => {
          const { width: w, height: h } = targetPage.getSize();
          const templateId = list.template || "default";
          const templatePath =
            templateId === "default"
              ? "/supply-template.jpg"
              : `/supply-templates/${templateId}.jpg`;
          const templateBytes = await fetch(templatePath)
            .then((r) => r.arrayBuffer())
            .catch(() => null);
          if (!templateBytes) return;
          try {
            let templateImage;
            if (templatePath.toLowerCase().endsWith(".png")) {
              templateImage = await pdfDoc.embedPng(templateBytes);
            } else {
              templateImage = await pdfDoc.embedJpg(templateBytes);
            }
            const scale = Math.min(
              w / templateImage.width,
              h / templateImage.height
            );
            const imgWidth = templateImage.width * scale;
            const imgHeight = templateImage.height * scale;
            const x = (w - imgWidth) / 2;
            const y = (h - imgHeight) / 2;
            targetPage.drawImage(templateImage, {
              x,
              y,
              width: imgWidth,
              height: imgHeight,
            });
          } catch (err) {
            // If embedding fails, silently skip background
            console.warn("Failed to embed template image", err);
          }
        };

        await drawBackground(page);
        // Header text centered (no section/ID)
        const title = list.title || (language === "en" ? "Supply List" : "Lista de útiles");
        const titleSize = 22;
        const titleWidth = fontBold.widthOfTextAtSize(title, titleSize) || 0;
        const titleX = (width - titleWidth) / 2;
        page.drawText(title, {
          x: titleX,
          y: height - padTop - 30,
          size: titleSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // Items with pagination and background on each page
        let y = height - padTop - 110;
        const rowGap = 24;
        let currentPage = page;
        let currentWidth = width;
        const items = list.items || [];
        for (const it of items) {
          if (y < padBottom + 80) {
            currentPage = pdfDoc.addPage([595, 842]);
            const sz = currentPage.getSize();
            currentWidth = sz.width;
            height = sz.height;
            await drawBackground(currentPage);
            y = height - padTop - 40; // start closer to top since no header on subsequent pages
          }
          const qtyText = `(x${it.quantity ?? ""})`;
          currentPage.drawText(it.name || "", {
            x: padLeft,
            y,
            size: 12,
            font: fontRegular,
            color: rgb(0.1, 0.1, 0.1),
          });
          currentPage.drawText(qtyText, {
            x: currentWidth - padRight - 100,
            y,
            size: 11,
            font: fontRegular,
            color: rgb(0.1, 0.1, 0.1),
          });
          if (it.note) {
            currentPage.drawText(it.note, {
              x: padLeft,
              y: y - 16,
              size: 10,
              font: fontRegular,
              color: rgb(0.2, 0.2, 0.2),
            });
          }
          y -= rowGap;
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `supply-list-${list.list_id || "export"}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Failed to export PDF:", e);
      }
    })();
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
            {language === "en" ? "Back" : "Volver"}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                router.push(`/controlPanel/supply-lists/${listId}/edit`)
              }
              className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
            >
              {language === "en" ? "Edit" : "Editar"}
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
                    {language === "en" ? "Download Excel" : "Descargar Excel"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        downloadPdf();
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                    {language === "en" ? "Download PDF" : "Descargar PDF"}
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
            <div className="text-sm text-neutral-500">
              {language === "en" ? "Loading..." : "Cargando..."}
            </div>
          ) : !list ? (
            <div className="text-sm text-red-600">
              {language === "en" ? "List not found" : "Lista no encontrada"}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <div className="text-neutral-500">
                    {language === "en" ? "Template" : "Plantilla"}
                  </div>
                  <div className="font-medium">{list.template || "default"}</div>
                </div>
                <Link
                  href={`/controlPanel/supply-lists/${listId}/template`}
                  className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                >
                  {language === "en" ? "Edit template" : "Editar plantilla"}
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-neutral-500">ID</div>
                  <div className="font-mono">{list.list_id}</div>
                </div>
                <div>
                  <div className="text-neutral-500">
                    {language === "en" ? "Section" : "Sección"}
                  </div>
                  <div className="font-medium">{list.section_id}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-neutral-500">
                    {language === "en" ? "Title" : "Título"}
                  </div>
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
