import Link from "next/link";
import type { Article } from "@/data/articles";

export function MostRead({ articles }: { articles: Article[] }) {
  return (
    <aside className="border border-slate-200 bg-white p-6">
      <h2 className="border-b-4 border-red-700 pb-3 text-xl font-black uppercase text-slate-950">Most read</h2>
      <ol className="mt-5 space-y-5">
        {articles.map((article, index) => (
          <li key={article.slug} className="grid grid-cols-[36px_1fr] gap-4">
            <span className="text-3xl font-black text-red-700">{index + 1}</span>
            <Link href={`/article/${encodeURIComponent(article.slug)}`} className="font-black leading-snug text-slate-900 hover:text-red-700">
              {article.title}
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
