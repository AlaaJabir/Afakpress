const inputClass = "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-red-700 focus:ring-4 focus:ring-red-100";
const primaryButtonClass = "inline-flex min-h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400";

export function AdminLoginForm({ error = "" }: { error?: string }) {
  return (
    <form action="/api/auth/admin-login" className="grid gap-4" method="post">
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        <span className="text-xs uppercase tracking-wide text-slate-500">Email</span>
        <input autoComplete="email" className={inputClass} name="email" required type="email" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        <span className="text-xs uppercase tracking-wide text-slate-500">Password</span>
        <input autoComplete="current-password" className={inputClass} name="password" required type="password" />
      </label>
      {error ? <p className="border-l-4 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}
      <button className={primaryButtonClass} type="submit">Sign in</button>
    </form>
  );
}
