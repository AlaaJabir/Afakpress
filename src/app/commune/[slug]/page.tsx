import { CmsCommunePage } from "@/components/PublicCmsViews";
import { PublicDatabaseError, PublicLocationView } from "@/components/PublicRouteViews";
import { getCommunePageData } from "@/lib/public-content";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function CommunePage({ params }: PageProps<"/commune/[slug]">) {
  const { slug } = await params;
  const result = await getCommunePageData(slug);
  if (result.status === "unconfigured") return <CmsCommunePage slug={slug} />;
  if (result.status === "not-found") notFound();
  if (result.status === "error") return <PublicDatabaseError />;
  return <PublicLocationView kind="Commune" location={result.data.location} articles={result.data.articles} />;
}
