import Link from "next/link";
import type { Article } from "@/data/articles";
import { ArticleCard } from "./ArticleCard";

export function SectionBlock({ title, href, articles }: { title: string; href: string; articles: Article[] }) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4 border-b-4 border-slate-950 pb-3">
        <h2 className="text-2xl font-black uppercase text-slate-950">{title}</h2>
        <Link href={href} className="text-sm font-black text-red-700 hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-6">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}

