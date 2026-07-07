import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/data/articles";

export function FeaturedArticle({ article }: { article: Article }) {
  return (
    <article className="grid overflow-hidden border border-slate-200 bg-white lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative min-h-80 w-full lg:min-h-[560px]">
        <Image src={article.image} alt="" fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
      </div>
      <div className="flex flex-col justify-center p-6 lg:p-10">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Top story</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950 lg:text-5xl">{article.title}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{article.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
          <span>{article.author}</span>
          <span>{article.publishedAt}</span>
          <span>{article.readingTime}</span>
        </div>
        <Link href={`/article/${article.slug}`} className="mt-8 w-fit bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700">
          Read the story
        </Link>
      </div>
    </article>
  );
}
