import { CmsProvincePage } from "@/components/PublicCmsViews";
import { PublicDatabaseError, PublicLocationView } from "@/components/PublicRouteViews";
import { getProvincePageData } from "@/lib/public-content";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function ProvincePage({ params }: PageProps<"/province/[slug]">) {
  const { slug } = await params;
  const result = await getProvincePageData(slug);
  if (result.status === "unconfigured") return <CmsProvincePage slug={slug} />;
  if (result.status === "not-found") notFound();
  if (result.status === "error") return <PublicDatabaseError />;
  return <PublicLocationView kind="Province / Prefecture" location={result.data.location} articles={result.data.articles} />;
}
