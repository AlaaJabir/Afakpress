import Link from "next/link";
import type { Article } from "@/data/articles";

export function BreakingNewsBar({ articles }: { articles: Article[] }) {
  const headline = articles[0];

  if (!headline) {
    return null;
  }

  return (
    <div className="border-y border-red-200 bg-red-700 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-8">
        <span className="shrink-0 bg-white px-2 py-1 text-xs font-black uppercase text-red-700">Breaking</span>
        <Link href={`/article/${headline.slug}`} className="truncate text-sm font-bold hover:underline">
          {headline.title}
        </Link>
      </div>
    </div>
  );
}

