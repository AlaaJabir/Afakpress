import { redirect } from "next/navigation";
import { getAdminAuthStateFromCookies } from "@/lib/admin-auth";
import {
  getAllMinistryPageContents,
  getAllMinistryProfiles,
} from "@/lib/ministries-db";
import { AdminMinisteresClient } from "./AdminMinisteresClient";

export const dynamic = "force-dynamic";

export default async function AdminMinisteresPage() {
  const authState = await getAdminAuthStateFromCookies();
  if (authState.status === "unauthenticated") {
    redirect("/admin/login");
  }

  const [initialProfiles, initialContents] = await Promise.all([
    getAllMinistryProfiles(),
    getAllMinistryPageContents(),
  ]);

  return (
    <main
      dir="ltr"
      className="min-h-screen bg-slate-100 text-slate-900 font-sans p-4 sm:p-6 lg:p-10"
    >
      <AdminMinisteresClient
        adminEmail={
          authState.status === "authenticated" ? authState.session.email : ""
        }
        initialProfiles={initialProfiles}
        initialContents={initialContents}
      />
    </main>
  );
}
