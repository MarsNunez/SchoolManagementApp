"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";

export default function AuthLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { language } = useLanguage();

  const texts =
    language === "en"
      ? {
          title: "Welcome back",
          subtitle: "Sign in to your school account",
          emailLabel: "Email",
          emailPlaceholder: "you@school.edu",
          passwordLabel: "Password",
          remember: "Remember me",
          forgot: "Forgot password?",
          submitLoading: "Signing in...",
          submit: "Sign in",
          noAccount: "Don't have an account?",
          createOne: "Create one",
          fallbackError: "Login failed",
        }
      : {
          title: "Bienvenido de nuevo",
          subtitle: "Inicia sesión en tu cuenta del colegio",
          emailLabel: "Correo electrónico",
          emailPlaceholder: "tu@colegio.edu",
          passwordLabel: "Contraseña",
          remember: "Recordarme",
          forgot: "¿Olvidaste tu contraseña?",
          submitLoading: "Ingresando...",
          submit: "Iniciar sesión",
          noAccount: "¿No tienes una cuenta?",
          createOne: "Crea una",
          fallbackError: "Error al iniciar sesión",
        };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || texts.fallbackError);

      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("staffProfile", JSON.stringify(data.staff));
      }
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-blue-600/10 grid place-items-center">
            <span className="text-2xl font-semibold text-blue-600">SM</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {texts.title}
          </h1>
          <p className="text-sm text-neutral-500">{texts.subtitle}</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/60 bg-white/70 dark:bg-neutral-900/60 dark:border-neutral-800 shadow-sm backdrop-blur">
          <form className="p-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                {texts.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                placeholder={texts.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                {texts.passwordLabel}
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 rounded border-neutral-300 dark-border-neutral-700"
                />
                {texts.remember}
              </label>
              <a className="text-blue-600 hover:underline" href="#">
                {texts.forgot}
              </a>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? texts.submitLoading : texts.submit}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          {texts.noAccount}{" "}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            {texts.createOne}
          </Link>
        </p>
      </div>
    </main>
  );
}
