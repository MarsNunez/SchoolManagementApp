"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJSON, authHeaders } from "@/lib/api";
import { useLanguage } from "@/lib/languageContext";
import * as XLSX from "xlsx";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const STATE_BADGE_STYLES = {
  draft:
    "border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  active:
    "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  archived:
    "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
};

export default function StudyPlansPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { language } = useLanguage();

  const texts =
    language === "en"
      ? {
          title: "Study plans",
          subtitle: "List and manage study plans",
          exportExcel: "Export to Excel",
        }
      : {
          title: "Planes de estudio",
          subtitle: "Listar y gestionar planes de estudio",
          exportExcel: "Exportar a Excel",
        };

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON("/study-plans", {
        headers: { ...authHeaders() },
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error al cargar los planes de estudio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (studyPlan_id) => {
    if (!confirm(`¿Eliminar ${studyPlan_id}?`)) return;
    try {
      await fetchJSON(`/study-plans/${studyPlan_id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      await load();
    } catch (e) {
      alert(e.message || "Error al eliminar el plan de estudio");
    }
  };

  const exportToExcel = () => {
    try {
      const rows = items.map((plan) => {
        const stateLabels = {
          draft: "borrador",
          active: "activo",
          archived: "archivado",
        };
        const stateKey = String(plan.state || "").toLowerCase();
        const stateLabel = stateLabels[stateKey] || plan.state;

        return {
          ID: plan.studyPlan_id,
          Nivel: plan.level,
          Grado: plan.grade,
          Versión: plan.version,
          Estado: stateLabel,
          "Vigente desde": formatDate(plan.effectiveFrom),
          Cursos: Array.isArray(plan.courses) ? plan.courses.length : 0,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "StudyPlans");
      XLSX.writeFile(workbook, "study-plans.xlsx");
    } catch (e) {
      console.error("Error al exportar planes de estudio a Excel:", e);
    }
  };

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <Link
            href="/controlPanel"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver
          </Link>
          <Link
            href="/controlPanel/study-plans/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            Registrar nuevo plan de estudio
          </Link>
        </div>
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{texts.title}</h1>
            <p className="text-sm text-neutral-500">{texts.subtitle}</p>
          </div>
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
                    exportToExcel();
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {texts.exportExcel}
                </button>
              </div>
            )}
          </div>
        </header>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-neutral-500">Cargando...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left border-b border-neutral-200/60 dark:border-neutral-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Nivel</th>
                  <th className="p-3">Grado</th>
                  <th className="p-3">Versión</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Vigente desde</th>
                  <th className="p-3">Cursos</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((plan) => {
                  const stateLabels = {
                    draft: "borrador",
                    active: "activo",
                    archived: "archivado",
                  };
                  const stateKey = String(plan.state || "").toLowerCase();
                  const stateLabel = stateLabels[stateKey] || plan.state;

                  return (
                    <tr
                      key={plan.studyPlan_id}
                      className="border-b last:border-none border-neutral-100 dark:border-neutral-800"
                    >
                      <td className="p-3 whitespace-nowrap">
                        {plan.studyPlan_id}
                      </td>
                      <td className="p-3 whitespace-nowrap capitalize">
                        {plan.level}
                      </td>
                      <td className="p-3 whitespace-nowrap">{plan.grade}</td>
                      <td className="p-3 whitespace-nowrap">{plan.version}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div
                          className={`border px-2 py-1 rounded inline-flex items-center gap-1 text-xs capitalize ${
                            STATE_BADGE_STYLES[stateKey] ||
                            "border-neutral-300 bg-neutral-50 text-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-200"
                          }`}
                        >
                          {stateLabel}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {formatDate(plan.effectiveFrom)}
                      </td>
                      <td className="p-3 whitespace-nowrap text-center">
                        {Array.isArray(plan.courses) ? plan.courses.length : 0}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/controlPanel/study-plans/${plan.studyPlan_id}`}
                            className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => remove(plan.studyPlan_id)}
                            className="btn-danger"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
