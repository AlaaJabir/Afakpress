import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/data/articles";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="grid gap-4 border-b border-slate-200 pb-6 sm:grid-cols-[160px_1fr]">
      <div className="relative h-32 w-full overflow-hidden sm:h-full">
        <Image src={article.image} alt="" fill sizes="(min-width: 640px) 160px, 100vw" className="object-cover" />
      </div>
      <div>
        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase text-red-700">
          <span>{article.category}</span>
          <span>{article.readingTime}</span>
        </div>
        <h3 className="mt-2 text-xl font-black leading-tight text-slate-950">
          <Link href={`/article/${article.slug}`} className="hover:text-red-700">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{article.excerpt}</p>
      </div>
    </article>
  );
}
