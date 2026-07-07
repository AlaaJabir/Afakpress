import { CmsArticlePage } from "@/components/PublicCmsViews";
import { articles } from "@/data/articles";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CmsArticlePage slug={slug} />;
}

