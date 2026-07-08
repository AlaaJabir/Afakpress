"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const inputClass = "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-red-700 focus:ring-4 focus:ring-red-100";
const primaryButtonClass = "inline-flex min-h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) throw new Error("Supabase is not configured.");

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error("No Supabase session was returned.");

      const response = await fetch("/api/auth/admin-session", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Admin access denied.");

      await supabase.auth.signOut();
      window.location.replace("/admin/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        <span className="text-xs uppercase tracking-wide text-slate-500">Email</span>
        <input autoComplete="email" className={inputClass} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        <span className="text-xs uppercase tracking-wide text-slate-500">Password</span>
        <input autoComplete="current-password" className={inputClass} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </label>
      {error ? <p className="border-l-4 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}
      <button className={primaryButtonClass} disabled={isSubmitting} type="submit">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
