import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TerritoryDetailView } from "@/components/TerritoriesPublicViews";
import { getTerritoryPageData } from "@/lib/territories";

type Props = PageProps<"/territoires/[region]/[province]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, province } = await params;
  const result = await getTerritoryPageData({ type: "province", regionSlug: region, provinceSlug: province });
  if (result.status !== "ok") return { title: "Territoire | Afakpress" };
  const title = result.data.entity.name_fr || result.data.entity.name || "Province";
  return { title: `${title} | Afakpress`, description: `Élus, actualités et informations de ${title}.` };
}

export default async function TerritoryProvincePage({ params }: Props) {
  const { region, province } = await params;
  const result = await getTerritoryPageData({ type: "province", regionSlug: region, provinceSlug: province });
  if (result.status === "not-found") notFound();
  if (result.status !== "ok") return <main className="mx-auto max-w-4xl px-4 py-20 text-center">Les données de cette province sont temporairement indisponibles.</main>;
  return <TerritoryDetailView data={result.data} />;
}
