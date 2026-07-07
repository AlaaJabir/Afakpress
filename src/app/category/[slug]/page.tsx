import { CmsCategoryPage } from "@/components/PublicCmsViews";
import { categories } from "@/data/articles";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CmsCategoryPage slug={slug} />;
}

