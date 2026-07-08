import { getAdminAuthStateFromCookies } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authState = await getAdminAuthStateFromCookies();
  if (authState.status === "unauthenticated") redirect("/admin/login");

  if (authState.status === "access_denied") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <section className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-8 shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Access denied</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">You are signed in, but not authorized.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">{authState.email} does not have an active admin role for Afakpress.</p>
          <a className="mt-6 inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-black text-slate-900 transition hover:border-red-700 hover:text-red-700" href="/admin/login">Back to login</a>
        </section>
      </main>
    );
  }

  redirect("/admin/dashboard");
}
