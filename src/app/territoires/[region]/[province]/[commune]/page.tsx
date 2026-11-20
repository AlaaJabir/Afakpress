import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TerritoryDetailView } from "@/components/TerritoriesPublicViews";
import { getTerritoryPageData } from "@/lib/territories";

type Props = PageProps<"/territoires/[region]/[province]/[commune]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, province, commune } = await params;
  const result = await getTerritoryPageData({ type: "commune", regionSlug: region, provinceSlug: province, communeSlug: commune });
  if (result.status !== "ok") return { title: "Territoire | Afakpress" };
  const title = result.data.entity.name_fr || result.data.entity.name || "Commune";
  return { title: `${title} | Afakpress`, description: `Actualités et informations locales de ${title}.` };
}

export default async function TerritoryCommunePage({ params }: Props) {
  const { region, province, commune } = await params;
  const result = await getTerritoryPageData({ type: "commune", regionSlug: region, provinceSlug: province, communeSlug: commune });
  if (result.status === "not-found") notFound();
  if (result.status !== "ok") return <div className="mx-auto max-w-4xl px-4 py-20 text-center">Les données de cette commune sont temporairement indisponibles.</div>;
  return <TerritoryDetailView data={result.data} />;
}
