"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authHeaders, fetchJSON } from "@/lib/api";

const GROUP_OPTIONS = ["A", "B", "C", "D", "E"];

export default function EditSectionPage() {
  const params = useParams();
  const router = useRouter();
  const sectionId = params?.sectionId;

  const [form, setForm] = useState({
    title: "",
    group: "A",
    studyPlan_id: "",
    teacher_id: "",
    year: new Date().getFullYear().toString(),
    start_capacity: "",
  });
  const [studyPlans, setStudyPlans] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [sectionData, planData, teacherData] = await Promise.all([
          fetchJSON(`/sections/${sectionId}`, { headers: { ...authHeaders() } }),
          fetchJSON("/study-plans", { headers: { ...authHeaders() } }),
          fetchJSON("/teachers", { headers: { ...authHeaders() } }),
        ]);
        setForm({
          title: sectionData?.title || "",
          group: sectionData?.group || "A",
          studyPlan_id: sectionData?.studyPlan_id || "",
          teacher_id: sectionData?.teacher_id || "",
          year: String(sectionData?.year ?? ""),
          start_capacity: String(
            sectionData?.start_capacity ?? sectionData?.max_capacity ?? ""
          ),
        });
        setStudyPlans(Array.isArray(planData) ? planData : []);
        setTeachers(Array.isArray(teacherData) ? teacherData : []);
      } catch (e) {
        setError(e.message || "Error al cargar la sección");
      } finally {
        setLoading(false);
      }
    };
    if (sectionId) load();
  }, [sectionId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("staffProfile");
        if (raw) {
          const prof = JSON.parse(raw);
          setRole(String(prof?.role || "").toLowerCase());
        }
      } catch {
        setRole("");
      }
    }
  }, []);

  const isSecretary = role === "secretary";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (!form.title.trim()) throw new Error("El título es obligatorio");
      if (!form.studyPlan_id.trim())
        throw new Error("El plan de estudios es obligatorio");
      if (!form.teacher_id.trim())
        throw new Error("El profesor es obligatorio");
      const startCapNumber = Number(form.start_capacity);
      if (!Number.isFinite(startCapNumber) || startCapNumber < 0) {
        throw new Error(
          "La capacidad inicial debe ser un número no negativo"
        );
      }

      const payload = {
        title: form.title.trim(),
        group: form.group,
        studyPlan_id: form.studyPlan_id.trim(),
        teacher_id: form.teacher_id.trim(),
        year: Number(form.year) || new Date().getFullYear(),
        start_capacity: startCapNumber,
      };

      await fetchJSON(`/sections/${sectionId}`, {
        method: "PUT",
        headers: { ...authHeaders() },
        body: JSON.stringify(payload),
      });

      router.push("/controlPanel/sections");
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
      router.push("/controlPanel/sections");
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
            Volver
          </button>
          {sectionId && (
            <div className="text-xs text-neutral-500">
              ID: <span className="font-mono">{sectionId}</span>
            </div>
          )}
        </div>

        <header>
          <h1 className="text-2xl font-semibold">Editar sección</h1>
          <p className="text-sm text-neutral-500">
            Actualiza la información de la sección
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
          {loading ? (
            <div className="p-4 text-sm text-neutral-500">Cargando...</div>
          ) : (
            <form onSubmit={onSubmit} className="p-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Título</label>
                <input
                  className="input w-full"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Grupo</label>
                <select
                  className="input w-full"
                  value={form.group}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, group: e.target.value }))
                  }
                >
                  {GROUP_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      Grupo {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Plan de estudios</label>
                <select
                  className="input w-full"
                  value={form.studyPlan_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      studyPlan_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Selecciona un plan de estudios</option>
                  {studyPlans.map((plan) => (
                    <option key={plan.studyPlan_id} value={plan.studyPlan_id}>
                      {plan.studyPlan_id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Profesor</label>
                <select
                  className="input w-full"
                  value={form.teacher_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      teacher_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Selecciona un profesor</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.teacher_id} value={teacher.teacher_id}>
                      {teacher.name} {teacher.lastname}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Año</label>
                <input
                  className={`input w-full ${isSecretary ? "cursor-not-allowed" : ""}`}
                  type="number"
                  value={form.year}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, year: e.target.value }))
                  }
                  disabled={isSecretary}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Capacidad inicial</label>
                <input
                  className={`input w-full ${isSecretary ? "cursor-not-allowed" : ""}`}
                  type="number"
                  min={0}
                  value={form.start_capacity}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      start_capacity: e.target.value,
                    }))
                  }
                  disabled={isSecretary}
                />
              </div>

              {error && (
                <div className="sm:col-span-2 text-sm text-red-600">{error}</div>
              )}

              <div className="sm:col-span-2 flex gap-2">
                <button disabled={saving} className="btn-primary">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
