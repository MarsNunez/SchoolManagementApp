"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ControlPanelLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="text-sm text-neutral-500">Checking access…</div>
      </main>
    );
  }

  return <>{children}</>;
}

