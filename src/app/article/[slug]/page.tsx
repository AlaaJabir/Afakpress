import { CmsArticlePage } from "@/components/PublicCmsViews";
import { PublicArticleView, PublicDatabaseError } from "@/components/PublicRouteViews";
import { getPublishedArticleBySlug } from "@/lib/public-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({ params }: PageProps<"/article/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedArticleBySlug(slug);
  if (result.status !== "ok") return {};
  const article = result.data;
  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/article/${article.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      images: article.featured_image ? [article.featured_image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/article/[slug]">) {
  const { slug } = await params;
  const result = await getPublishedArticleBySlug(slug);
  if (result.status === "unconfigured") return <CmsArticlePage slug={slug} />;
  if (result.status === "not-found") notFound();
  if (result.status === "error") return <PublicDatabaseError />;
  return <PublicArticleView article={result.data} />;
}
