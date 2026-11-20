import Link from "next/link";
import { redirect } from "next/navigation";
import { TerritoriesAdminPanel } from "@/components/admin/TerritoriesAdminPanel";
import { getAdminAuthStateFromCookies } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminTerritoriesPage() {
  const authState = await getAdminAuthStateFromCookies();
  if (authState.status === "unauthenticated") redirect("/admin/login");
  if (authState.status === "access_denied" || !["super_admin", "admin"].includes(authState.session.role)) {
    return <main className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-2xl font-black text-slate-950">Access denied</h1><p className="mt-3 text-sm text-slate-600">Only active Afakpress administrators can manage territories and elected officials.</p><Link href="/admin/dashboard" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-red-700 px-4 text-sm font-bold text-white">Back to dashboard</Link></main>;
  }
  return <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-red-700">Afakpress CMS</p><h1 className="mt-1 text-3xl font-black text-slate-950">Territories & Officials</h1></div><Link href="/admin/dashboard" className="inline-flex min-h-11 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700">Back to dashboard</Link></div><TerritoriesAdminPanel /></div></main>;
}
