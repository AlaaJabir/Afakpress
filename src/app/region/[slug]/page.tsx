import { CmsRegionPage } from "@/components/PublicCmsViews";
import { PublicDatabaseError, PublicLocationView } from "@/components/PublicRouteViews";
import { getRegionPageData } from "@/lib/public-content";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function RegionPage({ params }: PageProps<"/region/[slug]">) {
  const { slug } = await params;
  const result = await getRegionPageData(slug);
  if (result.status === "unconfigured") return <CmsRegionPage slug={slug} />;
  if (result.status === "not-found") notFound();
  if (result.status === "error") return <PublicDatabaseError />;
  return <PublicLocationView kind="Region" location={result.data.location} articles={result.data.articles} />;
}
