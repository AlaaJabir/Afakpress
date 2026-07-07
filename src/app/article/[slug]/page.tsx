import { notFound } from "next/navigation";
import Image from "next/image";
import { articles, getArticle } from "@/data/articles";
import { getRegion } from "@/data/articles";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  const region = getRegion(article.region);

  return (
    <article className="mx-auto max-w-4xl">
      <div className="border-b-4 border-slate-950 pb-6">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">{article.category}</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950 lg:text-6xl">{article.title}</h1>
        <p className="mt-5 text-xl leading-8 text-slate-600">{article.excerpt}</p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-slate-500">
          <span>{article.author}</span>
          <span>{article.publishedAt}</span>
          <span>{article.readingTime}</span>
          {region ? <span>{region.name}</span> : null}
        </div>
      </div>
      <div className="relative mt-8 h-[420px] w-full overflow-hidden">
        <Image src={article.image} alt="" fill priority sizes="(min-width: 1024px) 896px, 100vw" className="object-cover" />
      </div>
      <div className="mt-8 space-y-6 text-lg leading-9 text-slate-700">
        {article.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
