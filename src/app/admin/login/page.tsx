import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { getAdminSessionFromCookies } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  access_denied: "This account is not authorized for the Afakpress admin dashboard.",
  invalid_login: "Invalid email or password.",
  missing_config: "Supabase authentication is not configured.",
  missing_fields: "Email and password are required.",
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getAdminSessionFromCookies();
  if (session) redirect("/admin/dashboard");
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] ?? "Login failed." : "";

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[minmax(0,1fr)_520px]">
      <section className="hidden bg-[linear-gradient(135deg,#020617_0%,#111827_55%,#7f1d1d_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-red-200">Afakpress CMS</p>
          <h1 className="mt-5 max-w-2xl text-6xl font-black leading-tight">Secure newsroom access for authorized editors.</h1>
        </div>
        <p className="max-w-xl text-sm leading-7 text-slate-300">Sign in with your Supabase Auth account. Admin rights are checked server-side before the dashboard opens.</p>
      </section>
      <section className="flex items-center justify-center bg-slate-100 p-4 sm:p-8">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Protected CMS</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Admin Login</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Use the email and password configured in Supabase Auth. No demo passwords are stored in this app.</p>
          <div className="mt-6">
            <AdminLoginForm error={error} />
          </div>
        </div>
      </section>
    </main>
  );
}
