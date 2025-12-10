"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ControlPanelLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    // Validate JWT expiry client-side (best effort)
    try {
      const [, payloadB64] = token.split(".");
      const payload = JSON.parse(
        atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
      );
      if (payload?.exp && Date.now() / 1000 > payload.exp) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("staffProfile");
        router.replace("/auth/login");
        return;
      }
    } catch {}
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="text-sm text-neutral-500">Verificando acceso…</div>
      </main>
    );
  }

  return <>{children}</>;
}
