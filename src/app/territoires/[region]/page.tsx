import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TerritoryDetailView } from "@/components/TerritoriesPublicViews";
import { getTerritoryPageData, getTerritoryStaticParams } from "@/lib/territories";

type Props = PageProps<"/territoires/[region]">;

export const dynamicParams = true;
export async function generateStaticParams() {
  return getTerritoryStaticParams("region");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params;
  const result = await getTerritoryPageData({ type: "region", regionSlug: region });
  if (result.status !== "ok") return { title: "Territoire | Afakpress" };
  const title = result.data.entity.name_fr || result.data.entity.name || "Région";
  return { title: `${title} | Afakpress`, description: `Actualités, élus et informations de ${title}.` };
}

export default async function TerritoryRegionPage({ params }: Props) {
  const { region } = await params;
  const result = await getTerritoryPageData({ type: "region", regionSlug: region });
  if (result.status === "not-found") notFound();
  if (result.status !== "ok") return <div className="mx-auto max-w-4xl px-4 py-20 text-center">Les données de cette région sont temporairement indisponibles.</div>;
  return <TerritoryDetailView data={result.data} />;
}
