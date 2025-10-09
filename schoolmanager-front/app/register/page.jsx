export const metadata = {
  title: "SchoolManager | Register",
  description: "Create your staff account",
};

export default function RegisterPage() {
  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-emerald-600/10 grid place-items-center">
            <span className="text-2xl font-semibold text-emerald-600">SM</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-neutral-500">Register staff to access the dashboard</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/60 bg-white/70 dark:bg-neutral-900/60 dark:border-neutral-800 shadow-sm backdrop-blur">
          <form className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="staff_id" className="block text-sm font-medium">Staff ID</label>
              <input id="staff_id" type="text" placeholder="staff-001" className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">Name</label>
              <input id="name" type="text" placeholder="Lucia" className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastname" className="block text-sm font-medium">Lastname</label>
              <input id="lastname" type="text" placeholder="Ramirez" className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="space-y-2">
              <label htmlFor="dni" className="block text-sm font-medium">DNI</label>
              <input id="dni" type="number" placeholder="70234561" className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input id="email" type="email" placeholder="you@school.edu" className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <input id="password" type="password" placeholder="••••••••" className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium">Role</label>
              <select id="role" className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="admin">Admin</option>
                <option value="secretary">Secretary</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="size-4 rounded border-neutral-300 dark:border-neutral-700" defaultChecked />
                Active state
              </label>
              <a className="text-emerald-600 hover:underline" href="/login">Already have an account?</a>
            </div>

            <div className="sm:col-span-2">
              <button type="button" className="w-full rounded-lg bg-emerald-600 text-white py-2.5 font-medium hover:bg-emerald-700 transition-colors">
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

