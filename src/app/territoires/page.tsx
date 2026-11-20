import type { Metadata } from "next";
import { TerritoriesHomeView } from "@/components/TerritoriesPublicViews";
import { getTerritoriesHomeData } from "@/lib/territories";

export const metadata: Metadata = {
  title: "Territoires du Maroc | Afakpress",
  description: "Explorez les régions, provinces, préfectures et communes du Maroc.",
};

export default async function TerritoriesPage() {
  const result = await getTerritoriesHomeData();
  if (result.status === "unconfigured" || result.status === "error") {
    return <main className="mx-auto max-w-4xl px-4 py-20 text-center" dir="rtl"><h1 className="text-3xl font-black">Territoires</h1><p className="mt-4 text-slate-600">Les données des territoires sont temporairement indisponibles.</p></main>;
  }
  return <TerritoriesHomeView {...result.data} />;
}
