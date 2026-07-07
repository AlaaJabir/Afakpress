import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { categories, getArticlesByCategory, getCategory } from "@/data/articles";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!category) {
    notFound();
  }

  const categoryArticles = getArticlesByCategory(slug);

  return (
    <section className="mx-auto max-w-4xl">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Category</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">{category.name}</h1>
      <p className="mt-4 text-lg leading-8 text-slate-600">{category.description}</p>
      <div className="mt-10 space-y-6">
        {categoryArticles.length > 0 ? (
          categoryArticles.map((article) => <ArticleCard key={article.slug} article={article} />)
        ) : (
          <p className="border border-slate-200 bg-white p-6 text-slate-600">No published articles in this category yet.</p>
        )}
      </div>
    </section>
  );
}

