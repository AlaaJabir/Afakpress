import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, regions } from "@/lib/content";

export function generateStaticParams() {
  return regions.map((region) => ({ slug: region.slug }));
}

export default function RegionPage({ params }: { params: { slug: string } }) {
  const region = regions.find((item) => item.slug === params.slug);

  if (!region) {
    notFound();
  }

  const regionArticles = articles.filter((article) => article.region === region.name);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-700">منطقة</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-950">{region.name}</h1>
        <p className="mt-3 text-zinc-600">صفحة إقليمية تعرض أحدث الأخبار والتغطيات المرتبطة بهذه المنطقة.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {regionArticles.map((article) => (
          <article key={article.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-950">{article.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{article.excerpt}</p>
            <Link href={`/article/${article.slug}`} className="mt-4 inline-block text-sm font-semibold text-red-700">اقرأ الخبر</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
