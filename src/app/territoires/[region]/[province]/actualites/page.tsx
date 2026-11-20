import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TerritoryNewsIndexView } from "@/components/TerritoriesPublicViews";
import { getTerritoryPageData } from "@/lib/territories";

type Props = PageProps<"/territoires/[region]/[province]/actualites">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, province } = await params;
  const result = await getTerritoryPageData({ type: "province", regionSlug: region, provinceSlug: province });
  return { title: result.status === "ok" ? `Actualités — ${result.data.entity.name_fr || result.data.entity.name} | Afakpress` : "Actualités territoriales | Afakpress" };
}

export default async function ProvinceNewsPage({ params }: Props) {
  const { region, province } = await params;
  const result = await getTerritoryPageData({ type: "province", regionSlug: region, provinceSlug: province });
  if (result.status === "not-found") notFound();
  if (result.status !== "ok") return <div className="mx-auto max-w-4xl px-4 py-16 text-center">Actualités temporairement indisponibles.</div>;
  return <TerritoryNewsIndexView data={result.data} />;
}
