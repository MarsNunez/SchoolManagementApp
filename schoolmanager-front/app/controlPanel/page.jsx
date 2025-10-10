"use client";

import Link from "next/link";

export default function ControlPanel() {
  const cards = [
    { href: "/controlPanel/teachers", title: "Teachers", desc: "Manage teacher records" , color: "bg-indigo-600"},
    { href: "/controlPanel/courses", title: "Courses", desc: "Create and edit courses" , color: "bg-blue-600"},
    { href: "/controlPanel/staff", title: "Staff", desc: "Admins and secretaries" , color: "bg-emerald-600"},
  ];

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-neutral-900/5 grid place-items-center dark:bg-neutral-50/10">
            <span className="text-2xl font-semibold">SM</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Control Panel</h1>
          <p className="text-sm text-neutral-500">Quick access to school resources</p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className="group rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className={`h-10 w-10 ${c.color}/10 rounded-lg grid place-items-center mb-4`}>
                <div className={`h-2.5 w-2.5 rounded ${c.color}`}></div>
              </div>
              <h2 className="text-lg font-medium mb-1 group-hover:underline">{c.title}</h2>
              <p className="text-sm text-neutral-500">{c.desc}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

