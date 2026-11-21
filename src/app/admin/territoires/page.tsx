import { getAdminAuthStateFromCookies } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { AdminTerritoiresClient } from "./AdminTerritoiresClient";
import { getAllOfficials } from "@/lib/territories-db";

export const dynamic = "force-dynamic";

export default async function AdminTerritoiresPage() {
  const authState = await getAdminAuthStateFromCookies();
  if (authState.status === "unauthenticated") {
    redirect("/admin/login");
  }

  const initialOfficials = await getAllOfficials();

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 font-sans p-4 sm:p-6 lg:p-10">
      <AdminTerritoiresClient
        adminEmail={authState.status === "authenticated" ? authState.session.email : ""}
        initialOfficials={initialOfficials}
      />
    </main>
  );
}
