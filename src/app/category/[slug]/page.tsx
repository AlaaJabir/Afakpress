import { CmsCategoryPage } from "@/components/PublicCmsViews";
import { PublicCategoryView, PublicDatabaseError } from "@/components/PublicRouteViews";
import { getCategoryPageData } from "@/lib/public-content";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const result = await getCategoryPageData(slug);
  if (result.status === "unconfigured") return <CmsCategoryPage slug={slug} />;
  if (result.status === "not-found") notFound();
  if (result.status === "error") return <PublicDatabaseError />;
  return <PublicCategoryView entity={result.data.entity} articles={result.data.articles} />;
}
