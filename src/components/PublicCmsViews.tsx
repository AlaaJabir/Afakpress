"use client";

import Image from "next/image";
import Link from "next/link";
import { useCms } from "@/lib/cms-store";
import { getPublishedArticles, initialCmsState, type CmsArticle, type CmsState } from "@/lib/cms";
import { moroccoRegions } from "@/data/morocco-regions";
import { sanitizeArticleHtml } from "@/lib/article-html";

const PRO_EDITORIAL_IMAGES = [
  "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
];

function imageFor(article: CmsArticle, fallbackIndex = 0) {
  if (article.featuredImage && article.featuredImage.startsWith("http")) return article.featuredImage;
  if (article.image && article.image.startsWith("http")) return article.image;
  return PRO_EDITORIAL_IMAGES[fallbackIndex % PRO_EDITORIAL_IMAGES.length];
}

function formatCardDate(dateStr?: string, defaultTime = "7:00 PM"): string {
  if (!dateStr) return `10/11/2026, ${defaultTime}`;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return `10/11/2026, ${defaultTime}`;
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}, ${defaultTime}`;
  } catch {
    return `10/11/2026, ${defaultTime}`;
  }
}

const defaultAuthors = [
  "المحرر الإخباري",
  "المحرر السياسي",
  "مراسل الرباط",
  "القسم الرياضي",
];
const defaultTimes = ["7:55 PM", "7:35 PM", "7:05 PM", "5:58 PM"];
const commentCounts = [22, 1, 12, 45];

function ArticleTag({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" }) {
  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${tone === "dark" ? "bg-white/90 text-slate-950" : "bg-red-50 text-red-700"}`}>
      {children}
    </span>
  );
}

function ArticleMeta({ article, tone = "light" }: { article: CmsArticle; tone?: "light" | "dark" }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold ${tone === "dark" ? "text-white/85" : "text-slate-500"}`}>
      <span>{article.author}</span>
      <span>{article.publishDate}</span>
      <span>{article.readingTime}</span>
    </div>
  );
}

function ArticleCard({ article, compact = false }: { article: CmsArticle; compact?: boolean }) {
  return (
    <Link href={`/article/${encodeURIComponent(article.slug)}`} aria-label={article.title} className={`group block ${compact ? "" : "h-full"}`}>
      <article className={`flex overflow-hidden bg-white transition hover:-translate-y-0.5 hover:shadow-lg ${compact ? "items-center gap-4 rounded-2xl border border-slate-200 p-3 shadow-sm hover:border-red-200" : "h-full flex-col rounded-xl shadow-sm ring-1 ring-slate-200 hover:ring-red-200"}`}>
        <div className={`relative shrink-0 overflow-hidden bg-slate-200 ${compact ? "h-28 w-28 rounded-xl sm:h-32 sm:w-36" : "h-56 w-full rounded-xl"}`}>
          <Image src={imageFor(article)} alt="" fill sizes={compact ? "(min-width: 640px) 144px, 112px" : "(min-width: 1024px) 360px, 100vw"} className="object-cover brightness-95 transition duration-300 group-hover:scale-105" />
          {!compact ? (
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <ArticleTag>{article.category}</ArticleTag>
            </div>
          ) : null}
        </div>
        <div className={`${compact ? "min-w-0 flex-1 py-1" : "flex flex-1 flex-col p-5"}`}>
          {compact && article.category ? <ArticleTag>{article.category}</ArticleTag> : null}
          <h3 className={`${compact ? `${article.category ? "mt-3" : ""} line-clamp-3 text-lg leading-7` : "mt-3 text-2xl leading-tight"} font-black text-slate-950 transition group-hover:text-red-700`} dir="auto">
            {article.title}
          </h3>
          {!compact ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{article.excerpt}</p> : null}
          <div className={compact ? "mt-2" : "mt-auto pt-5"}>
            <ArticleMeta article={article} />
          </div>
        </div>
      </article>
    </Link>
  );
}

function dedupeArticles(articles: CmsArticle[]) {
  return articles.filter((article, index, list) => list.findIndex((item) => item.id === article.id || item.slug === article.slug) === index);
}

function publishedArticles(state: ReturnType<typeof useCms>["state"]) {
  return dedupeArticles(getPublishedArticles(state));
}

function articleCategorySlug(state: CmsState, article: CmsArticle) {
  return article.category || state.categories.find((category) => category.id === article.categoryId)?.slug || "";
}

function articleRegionSlug(state: CmsState, article: CmsArticle) {
  return article.region || state.regions.find((region) => region.id === article.regionId)?.slug || "";
}

function articleProvinceSlug(state: CmsState, article: CmsArticle) {
  return article.province || state.regions.flatMap((region) => region.provinces).find((province) => province.id === article.provinceId)?.slug || "";
}

function articleCommuneSlug(state: CmsState, article: CmsArticle) {
  return article.commune || state.regions.flatMap((region) => region.provinces.flatMap((province) => province.communes)).find((commune) => commune.id === article.communeId)?.slug || "";
}

function SectionBlock({ title, href, articles }: { title: string; href: string; articles: CmsArticle[] }) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-3xl font-black text-slate-950">{title}</h2>
        <Link href={href} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700">
          View all
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div>
    </section>
  );
}

function RegionPin() {
  return (
    <svg aria-hidden="true" className="size-4 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M12 2.25a7.5 7.5 0 0 0-7.5 7.5c0 5.3 6.35 11.3 6.62 11.55a1.3 1.3 0 0 0 1.76 0c.27-.25 6.62-6.25 6.62-11.55a7.5 7.5 0 0 0-7.5-7.5Zm0 10.25a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function RegionsSpotlight({ regions }: { regions: CmsState["regions"] }) {
  if (!regions.length) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="regions-spotlight-title">
      <div className="bg-slate-950 px-5 py-5 text-center text-white">
        <h2 id="regions-spotlight-title" className="text-xl font-black uppercase tracking-[0.08em]">
          Les {regions.length} régions du Maroc
        </h2>
        <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-red-600" />
      </div>
      <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 px-4 py-5 sm:grid-cols-[112px_minmax(0,1fr)]">
        <div className="relative min-h-80 overflow-hidden rounded-xl bg-slate-50">
          <Image
            src="/morocco-regions-map.png"
            alt="Carte des 12 régions du Maroc"
            fill
            sizes="112px"
            className="object-contain object-center p-1 drop-shadow-sm"
          />
        </div>
        <nav aria-label="Régions du Maroc">
          <ul className="grid gap-0.5">
            {regions.map((region) => (
              <li key={region.id}>
                <Link
                  href={`/region/${encodeURIComponent(region.slug)}`}
                  className="group flex min-h-7 items-center gap-2 rounded-lg px-2 py-1 text-right text-[13px] font-bold leading-5 text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800 focus:bg-emerald-50 focus:text-emerald-800 focus:outline-none"
                  dir="rtl"
                >
                  <RegionPin />
                  <span className="line-clamp-1">{region.name.replace(/^جهة\s+/u, "")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="px-4 pb-5">
        <Link
          href="#morocco-regions"
          className="flex min-h-11 items-center justify-center rounded-xl bg-red-700 px-4 text-sm font-black uppercase tracking-[0.06em] text-white shadow-sm transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-100"
        >
          Voir toutes les régions
        </Link>
      </div>
    </section>
  );
}

export function CmsHomePage() {
  const { state, isLoading, error, hasLoadedFromSupabase } = useCms();
  const published = publishedArticles(state);
  const homepageArticles = published.length > 0 ? published : initialCmsState.articles;
  const homepageCategories = state.categories.length > 0 ? state.categories : initialCmsState.categories;
  const homepageRegions = state.regions.length > 0 ? state.regions : initialCmsState.regions;
  const enabledSections = new Set(state.homepageSections.filter((section) => section.enabled).map((section) => section.label));
  const show = (label: string) => enabledSections.has(label);
  const validArticles = homepageArticles.filter(
    (article) =>
      article.title &&
      article.title.trim() !== "test" &&
      article.title.trim() !== "Untitled" &&
      article.title.trim().length > 3
  );
  const effectiveArticles = validArticles.length >= 5 ? validArticles : homepageArticles;
  const featured = effectiveArticles.find((article) => article.featured) ?? effectiveArticles[0];
  const secondaryArticles = effectiveArticles.filter((article) => article.id !== featured?.id).slice(0, 4);
  const markedMostRead = homepageArticles.filter((article) => article.mostRead);
  const mostReadFallback = homepageArticles.filter((article) => article.id !== featured?.id);
  const mostRead = (markedMostRead.length ? markedMostRead : mostReadFallback.length ? mostReadFallback : homepageArticles).slice(0, 5);
  const regionalArticles = homepageArticles.filter((article) => articleCategorySlug(state, article) === "regions");
  const economyArticles = homepageArticles.filter((article) => articleCategorySlug(state, article) === "economy");
  const opinionArticles = homepageArticles.filter((article) => articleCategorySlug(state, article) === "opinion");

  if (!hasLoadedFromSupabase && !featured) {
    return (
      <div aria-label="Loading AfakPress" aria-busy="true" className="space-y-6">
        <div className="h-[430px] animate-pulse rounded-xl bg-slate-200 md:h-[560px]" />
        <div className="grid gap-5 md:grid-cols-3">
          <div className="h-44 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-44 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-44 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!featured) {
    return <p className="border border-slate-200 bg-white p-6 text-slate-600">No published articles yet.</p>;
  }

  return (
    <div className="space-y-14">
      {isLoading ? <p className="border border-slate-200 bg-white p-4 text-sm font-bold text-slate-600">Loading latest newsroom data...</p> : null}
      {error ? <p className="border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">{error}</p> : null}
      {show("Featured Slider") && featured ? (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 bg-[#f3f4f6]/80 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs" dir="rtl">
          <Link
            href={`/article/${encodeURIComponent(featured.slug)}`}
            aria-label={featured.title}
            className="group relative flex flex-col justify-between overflow-hidden bg-slate-950 text-white shadow-xs ring-1 ring-slate-200/80 transition duration-300 hover:shadow-md md:col-span-2 min-h-[380px] lg:min-h-[440px]"
          >
            {/* div:nth-of-type(1): Image & dark gradient & top badge */}
            <div className="absolute inset-0 overflow-hidden bg-slate-900">
              <Image
                src={imageFor(featured, 0)}
                alt=""
                fill
                priority
                sizes="(min-width: 1280px) 980px, 100vw"
                className="object-cover brightness-95 transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />
              <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5 bg-white px-2.5 py-1 text-[11px] font-black tracking-wider text-slate-900 shadow-xs">
                <span className="text-orange-500 font-bold text-xs">★</span>
                <span>قصة مميزة</span>
              </div>
            </div>

            {/* div:nth-of-type(2): Bottom overlay content (SELECTOR 1!) */}
            <div className="relative mt-auto flex flex-col justify-end p-5 sm:p-6 text-right" dir="rtl">
              <div className="max-w-3xl">
                <h1
                  className="font-serif text-xl sm:text-2xl lg:text-3xl font-black leading-tight text-white drop-shadow-sm transition group-hover:text-red-300"
                  dir="auto"
                >
                  {featured.title}
                </h1>
                <p
                  className="mt-2.5 text-xs sm:text-sm font-semibold text-[#4ade80] line-clamp-2 drop-shadow-xs"
                  dir="auto"
                >
                  {featured.excerpt}
                </p>
                <div className="mt-3.5 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#ea580c]">
                  <span>{featured.author || "هيئة التحرير"}</span>
                  <span aria-hidden="true">-</span>
                  <span dir="ltr" className="tabular-nums">
                    {formatCardDate(featured.publishDate || featured.publishedAt, "8:00 PM")}
                  </span>
                </div>
              </div>
            </div>

            {/* div:nth-of-type(3): Bottom Grey Shelf Bar */}
            <div className="relative z-10 h-7 w-full bg-[#d8dbdf] flex items-center justify-center">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#596169] text-white text-xs font-black shadow-xs tabular-nums">
                0
              </span>
            </div>
          </Link>

          <aside className="contents">
            {secondaryArticles.map((article, index) => (
              <Link
                key={article.id}
                href={`/article/${encodeURIComponent(article.slug)}`}
                aria-label={article.title}
                className="group block h-full md:col-span-1"
              >
                <article className="flex h-full flex-col overflow-hidden bg-white shadow-xs ring-1 ring-slate-200/80 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  {/* Image container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 shrink-0">
                    <Image
                      src={imageFor(article, index + 1)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 400px, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    {index === 0 && (
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white px-2.5 py-1 text-[11px] font-black tracking-wider text-slate-900 shadow-xs">
                        <span>آخر الأخبار</span>
                        <span className="font-bold text-emerald-600">↳</span>
                      </div>
                    )}
                  </div>

                  {/* White content box */}
                  <div className="flex flex-1 flex-col p-4 sm:p-5 text-right" dir="rtl">
                    <h3
                      className="font-serif text-base sm:text-lg font-black leading-snug text-slate-900 transition group-hover:text-red-700 line-clamp-2"
                      dir="auto"
                    >
                      {article.title}
                    </h3>
                    <p
                      className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500"
                      dir="auto"
                    >
                      {article.excerpt}
                    </p>
                    <div className="mt-auto pt-3 text-[11px] font-black uppercase tracking-wider text-[#ea580c] flex items-center gap-1.5">
                      <span>{article.author || defaultAuthors[index % defaultAuthors.length]}</span>
                      <span aria-hidden="true">-</span>
                      <span dir="ltr" className="tabular-nums">
                        {formatCardDate(article.publishDate || article.publishedAt, defaultTimes[index % defaultTimes.length])}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Grey Shelf Bar with Centered Number Bubble */}
                  <div className="relative mt-auto h-7 w-full bg-[#d8dbdf] flex items-center justify-center">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#596169] text-white text-xs font-black shadow-xs tabular-nums">
                      {commentCounts[index % commentCounts.length]}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </aside>
        </section>
      ) : null}

      {show("Latest News") ? <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
        <SectionBlock title="Latest news" href="/category/national" articles={homepageArticles.slice(1, 5)} />
        <aside className="grid self-start gap-6">
          <RegionsSpotlight regions={homepageRegions} />
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="text-2xl font-black text-slate-950">Most read</h2>
              <span className="h-1 w-12 rounded-full bg-red-700" />
            </div>
            <ol className="divide-y divide-slate-100 px-6">
              {mostRead.map((article, index) => (
                <li key={article.id}>
                  <Link href={`/article/${encodeURIComponent(article.slug)}`} className="group/read grid grid-cols-[42px_1fr] gap-4 py-5">
                    <span className="text-3xl font-black leading-none text-red-700/25 transition group-hover/read:text-red-700 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 font-black leading-6 text-slate-900 transition group-hover/read:text-red-700" dir="auto">{article.title}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                        {article.category ? <span className="uppercase text-red-700">{article.category}</span> : null}
                        {article.publishDate ? <span>{article.publishDate}</span> : null}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </section> : null}

      {show("Regional News") ? <section id="morocco-regions" className="mx-auto w-full max-w-screen-2xl scroll-mt-36">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-black text-slate-950">Morocco regions</h2>
          <Link href="/category/regions" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700">
            Regional desk
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
          {homepageRegions.slice(0, 8).map((region) => (
            <Link key={region.slug} href={`/region/${region.slug}`} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-red-200">
              <span className="block text-lg font-black text-slate-950">{region.name}</span>
              <span className="mt-3 block text-sm leading-6 text-slate-600">{region.provinces.map((province) => province.name).join(" / ")}</span>
            </Link>
          ))}
        </div>
      </section> : null}

      <section className="grid gap-6 lg:grid-cols-3">
        {homepageCategories.slice(0, 3).map((category) => {
          const categoryArticles = homepageArticles.filter((article) => articleCategorySlug(state, article) === category.slug).slice(0, 2);
          return (
            <div key={category.id} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-black text-slate-950">{category.name}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">{category.description}</p>
              <div className="mt-5 space-y-4">{categoryArticles.map((article) => <ArticleCard key={article.id} article={article} />)}</div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <SectionBlock title="Regional news" href="/category/regions" articles={regionalArticles} />
        {show("Economy") || show("Opinion") ? <SectionBlock title="Economy and opinion" href="/category/economy" articles={[...economyArticles, ...opinionArticles].slice(0, 3)} /> : null}
      </section>
    </div>
  );
}

export function CmsArticlePage({ slug }: { slug: string }) {
  const { state, hasLoadedFromSupabase } = useCms();
  const article = publishedArticles(state).find((item) => item.slug === slug) ?? initialCmsState.articles.find((item) => item.slug === slug);
  const articleRegion = article ? articleRegionSlug(state, article) : "";
  const region = state.regions.find((item) => item.slug === articleRegion);

  if (!article) {
    if (!hasLoadedFromSupabase) {
      return <p className="border border-slate-200 bg-white p-6 text-slate-600">Loading article...</p>;
    }
    return <p className="border border-slate-200 bg-white p-6 text-slate-600">Article not found.</p>;
  }
  const content = sanitizeArticleHtml(article.content || article.excerpt || "No article content is available yet.");

  return (
    <article className="mx-auto max-w-5xl">
      <div className="border-b-4 border-slate-950 pb-6">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">{article.category}</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950 lg:text-6xl">{article.title}</h1>
        <p className="mt-5 text-xl leading-8 text-slate-600">{article.excerpt}</p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-slate-500">
          <span>{article.author}</span>
          <span>{article.publishDate}</span>
          <span>{article.readingTime}</span>
          {region ? <span>{region.name}</span> : null}
        </div>
      </div>
      <div className="relative mt-8 h-[420px] w-full overflow-hidden bg-slate-200 lg:h-[560px]">
        <Image src={imageFor(article)} alt="" fill priority sizes="(min-width: 1024px) 896px, 100vw" className="object-cover" />
      </div>
      <div className="article-content mt-8 text-lg text-slate-700" dir="auto" dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}

export function CmsCategoryPage({ slug }: { slug: string }) {
  const { state } = useCms();
  const category = state.categories.find((item) => item.slug === slug);
  const categoryArticles = publishedArticles(state).filter((article) => articleCategorySlug(state, article) === slug);

  if (!category) {
    return <p className="border border-slate-200 bg-white p-6 text-slate-600">Category not found.</p>;
  }

  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Category</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">{category.name}</h1>
      <p className="mt-4 text-lg leading-8 text-slate-600">{category.description}</p>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {categoryArticles.length > 0 ? categoryArticles.map((article) => <ArticleCard key={article.id} article={article} />) : <p className="border border-slate-200 bg-white p-6 text-slate-600">No published articles in this category yet.</p>}
      </div>
    </section>
  );
}

export function CmsRegionPage({ slug }: { slug: string }) {
  const { state } = useCms();
  const region = state.regions.find((item) => item.slug === slug) ?? moroccoRegions.find((item) => item.slug === slug);
  const regionArticles = publishedArticles(state).filter((article) => articleRegionSlug(state, article) === slug);

  if (!region) {
    return <p className="border border-slate-200 bg-white p-6 text-slate-600">Region not found.</p>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Regional desk</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">{region.name}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Coverage organized by region, province or prefecture, and commune.</p>
        <div className="mt-8 space-y-6">
          {regionArticles.length > 0 ? regionArticles.map((article) => <ArticleCard key={article.id} article={article} />) : <p className="border border-slate-200 bg-white p-6 text-slate-600">No articles are assigned to this region yet.</p>}
        </div>
      </section>
      <aside className="border border-slate-200 bg-white p-6">
        <h2 className="border-b-4 border-red-700 pb-3 text-xl font-black uppercase text-slate-950">Local structure</h2>
        <div className="mt-5 space-y-5">
          {region.provinces.map((province) => (
            <div key={province.slug}>
              <Link href={`/province/${province.slug}`} className="font-black text-slate-950 hover:text-red-700">{province.name}</Link>
              <p className="mt-2 text-sm leading-6 text-slate-600">{province.communes.map((commune) => commune.name).join(", ")}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function CmsProvincePage({ slug }: { slug: string }) {
  const { state } = useCms();
  const geography = state.regions.length ? state.regions : moroccoRegions;
  const match = geography.flatMap((region) => region.provinces.map((province) => ({ region, province }))).find((item) => item.province.slug === slug);
  const provinceArticles = publishedArticles(state).filter((article) => articleProvinceSlug(state, article) === slug);

  if (!match) {
    return <p className="border border-slate-200 bg-white p-6 text-slate-600">Province or prefecture not found.</p>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Province / Prefecture</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">{match.province.name}</h1>
        <Link href={`/region/${match.region.slug}`} className="mt-4 inline-block text-sm font-black text-red-700 hover:underline">
          {match.region.name}
        </Link>
        <div className="mt-8 space-y-6">
          {provinceArticles.length > 0 ? provinceArticles.map((article) => <ArticleCard key={article.id} article={article} />) : <p className="border border-slate-200 bg-white p-6 text-slate-600">No articles are assigned to this province yet.</p>}
        </div>
      </section>
      <aside className="border border-slate-200 bg-white p-6">
        <h2 className="border-b-4 border-red-700 pb-3 text-xl font-black uppercase text-slate-950">Communes</h2>
        <div className="mt-5 grid gap-2">
          {match.province.communes.map((commune) => (
            <Link key={commune.slug} href={`/commune/${commune.slug}`} className="rounded-md px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-700">
              {commune.name}
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function CmsCommunePage({ slug }: { slug: string }) {
  const { state } = useCms();
  const geography = state.regions.length ? state.regions : moroccoRegions;
  const match = geography
    .flatMap((region) => region.provinces.flatMap((province) => province.communes.map((commune) => ({ region, province, commune }))))
    .find((item) => item.commune.slug === slug);
  const communeArticles = publishedArticles(state).filter((article) => articleCommuneSlug(state, article) === slug);

  if (!match) {
    return <p className="border border-slate-200 bg-white p-6 text-slate-600">Commune not found.</p>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Commune</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">{match.commune.name}</h1>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-black">
          <Link href={`/province/${match.province.slug}`} className="text-red-700 hover:underline">{match.province.name}</Link>
          <Link href={`/region/${match.region.slug}`} className="text-slate-600 hover:text-red-700">{match.region.name}</Link>
        </div>
        <div className="mt-8 space-y-6">
          {communeArticles.length > 0 ? communeArticles.map((article) => <ArticleCard key={article.id} article={article} />) : <p className="border border-slate-200 bg-white p-6 text-slate-600">No articles are assigned to this commune yet.</p>}
        </div>
      </section>
      <aside className="border border-slate-200 bg-white p-6">
        <h2 className="border-b-4 border-red-700 pb-3 text-xl font-black uppercase text-slate-950">Local context</h2>
        <div className="mt-5 grid gap-3 text-sm font-bold text-slate-700">
          <Link href={`/region/${match.region.slug}`} className="hover:text-red-700">{match.region.name}</Link>
          <Link href={`/province/${match.province.slug}`} className="hover:text-red-700">{match.province.name}</Link>
        </div>
      </aside>
    </div>
  );
}
