export const metadata = {
  title: "SchoolManager | Login",
  description: "Access your school account",
};

export default function LoginPage() {
  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-blue-600/10 grid place-items-center">
            <span className="text-2xl font-semibold text-blue-600">SM</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-neutral-500">Sign in to your school account</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/60 bg-white/70 dark:bg-neutral-900/60 dark:border-neutral-800 shadow-sm backdrop-blur">
          <form className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@school.edu"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="size-4 rounded border-neutral-300 dark:border-neutral-700" />
                Remember me
              </label>
              <a className="text-blue-600 hover:underline" href="#">Forgot password?</a>
            </div>

            <button type="button" className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Don&apos;t have an account? {" "}
          <a href="/register" className="text-blue-600 hover:underline">Create one</a>
        </p>
      </div>
    </main>
  );
}

