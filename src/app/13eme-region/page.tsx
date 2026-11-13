import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchThirteenthRegionArticles } from "@/lib/thirteenth-region";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الجهة الثالثة عشرة — مغاربة العالم | آفاق بريس",
  description: "أخبار المغاربة المقيمين بالخارج: احتفالات وطنية، ريادة أعمال، وعلاقة الجالية بالمؤسسات.",
};

export default async function ThirteenthRegionListPage() {
  const articles = await fetchThirteenthRegionArticles();

  return (
    <div className="font-sans" dir="rtl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-700 transition mb-3"
          >
            <ArrowRight className="size-3.5" aria-hidden="true" />
            <span>العودة إلى الرئيسية</span>
          </Link>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-950">الجهة الثالثة عشرة</h1>
            <span className="text-xs sm:text-sm font-medium text-slate-500">مغاربة العالم</span>
          </div>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            أخبار المغاربة المقيمين بالخارج: احتفالات وطنية، ريادة أعمال، وعلاقة الجالية بالمؤسسات.
          </p>
        </div>

        <div className="rounded-xl border-2 border-dashed border-slate-800 px-5 py-3 text-right min-w-[160px]">
          <span className="block text-3xl font-black text-slate-900 leading-none tabular-nums">13</span>
          <span className="mt-1.5 block text-[11px] font-bold text-slate-700">خارج الخريطة، داخل الوطن</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/13eme-region/${encodeURIComponent(article.id)}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex flex-1 flex-col p-5 text-right">
              <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-500">
                <span>--- {article.countryName}</span>
                <span className="text-red-700">{article.category}</span>
              </div>

              <h2 className="mt-2.5 text-lg font-black leading-snug text-slate-950 transition group-hover:text-red-700 line-clamp-2">
                {article.title}
              </h2>

              {article.excerpt ? (
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 line-clamp-3">
                  {article.excerpt}
                </p>
              ) : null}

              <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
                <span>{article.author}</span>
                <span className="tabular-nums">{article.publishedAt}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
