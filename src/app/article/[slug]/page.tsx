import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticleBySlug } from "@/lib/content";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-700">{article.category}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-zinc-950">{article.title}</h1>
        <p className="mt-4 text-sm text-zinc-600">بقلم {article.author} • {article.publishedAt} • {article.region} / {article.province} / {article.commune}</p>
      </div>
      <img src={article.image} alt={article.title} className="h-[320px] w-full rounded-3xl object-cover" />
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-lg leading-8 text-zinc-700">{article.excerpt}</p>
          <p className="mt-6 text-lg leading-8 text-zinc-700">هذا نموذج لصفحة مقالة Afakpress مصممة بصياغة صحافية احترافية، مع بنية قابلة للتوسّع في المستقبل عند ربطها بقاعدة بيانات أو CMS.</p>
        </article>
        <aside className="space-y-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">مقالات ذات صلة</h2>
            <div className="mt-4 space-y-3">
              {articles.filter((item) => item.id !== article.id).slice(0, 3).map((item) => (
                <Link key={item.id} href={`/article/${item.slug}`} className="block rounded-xl border border-zinc-200 p-3 text-sm text-zinc-700 hover:border-red-700">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
