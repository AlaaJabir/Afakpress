import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Globe2, User } from "lucide-react";
import { ArticleComments } from "@/components/ArticleComments";
import {
  fetchThirteenthRegionArticles,
  getThirteenthRegionArticleById,
} from "@/lib/thirteenth-region";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getThirteenthRegionArticleById(id);
  if (!article) return {};

  return {
    title: `${article.title} | الجهة الثالثة عشرة — آفاق بريس`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
  };
}

export default async function ThirteenthRegionArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, allArticles] = await Promise.all([
    getThirteenthRegionArticleById(id),
    fetchThirteenthRegionArticles(),
  ]);

  if (!article) {
    notFound();
  }

  const paragraphs = article.content
    .split(/\n{2,}|(?<=\.)\s+(?=[\u0600-\u06FF])/)
    .map((p) => p.trim())
    .filter(Boolean);

  const relatedArticles = allArticles
    .filter((item) => item.id !== article.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl font-sans" dir="rtl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
          <Link href="/" className="hover:text-red-700 transition">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/13eme-region" className="hover:text-red-700 transition">
            الجهة الثالثة عشرة
          </Link>
          <span>/</span>
          <span className="text-slate-800">{article.countryName}</span>
        </nav>

        <article>
          {/* Afakpress Article Header */}
          <div className="border-b-4 border-slate-950 pb-6 text-right">
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-black">
              <span className="text-red-700">{article.category}</span>
              <span className="text-slate-300">|</span>
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <Globe2 className="size-3.5 text-slate-500" aria-hidden="true" />
                <span>--- {article.countryName}</span>
              </span>
            </div>

            <h1 className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-black leading-tight text-slate-950">
              {article.title}
            </h1>

            {article.excerpt ? (
              <p className="mt-5 text-base sm:text-xl leading-8 text-slate-600">
                {article.excerpt}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-bold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5 text-slate-400" aria-hidden="true" />
                <span>{article.author}</span>
              </span>
              <span className="tabular-nums">{article.publishedAt}</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-slate-400" aria-hidden="true" />
                <span>{article.readTime}</span>
              </span>
            </div>
          </div>

          {/* Hero Image */}
          {article.imageUrl ? (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-200 shadow-sm">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                priority
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : null}

          {/* Article Body in Afakpress Editorial Typography */}
          <div className="article-content mt-8 space-y-5 text-base sm:text-lg leading-9 text-slate-800 text-right">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
            ) : (
              <p>{article.excerpt}</p>
            )}
          </div>

          {/* Real Reader Comments */}
          <ArticleComments
            articleId={`13eme-${article.id}`}
            articleTitle={article.title}
          />
        </article>

        {/* Related 13eme Region Articles */}
        {relatedArticles.length > 0 ? (
          <section className="mt-14 border-t border-slate-200/90 pt-8 text-right">
            <div className="mb-6 flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                  المزيد من الجهة الثالثة عشرة
                </h2>
                <span className="text-xs font-medium text-slate-500">مغاربة العالم</span>
              </div>
              <Link
                href="/13eme-region"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-700 hover:text-red-700 transition"
              >
                <span>عرض الكل</span>
                <ArrowRight className="size-3.5 rotate-180" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedArticles.map((item) => (
                <Link
                  key={item.id}
                  href={`/13eme-region/${encodeURIComponent(item.id)}`}
                  className="group block border-t border-slate-200/90 pt-4"
                >
                  <span className="text-xs font-medium text-slate-500">
                    --- {item.countryName}
                  </span>
                  <h3 className="mt-2 text-base font-black leading-snug text-slate-950 transition group-hover:text-red-700">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
    </div>
  );
}
