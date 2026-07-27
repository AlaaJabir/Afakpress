"use client";

import Image from "next/image";
import Link from "next/link";
import { useCms } from "@/lib/cms-store";
import { getPublishedArticles, type CmsArticle, type CmsState } from "@/lib/cms";
import { moroccoRegions } from "@/data/morocco-regions";
import { sanitizeArticleHtml } from "@/lib/article-html";

function imageFor(article: CmsArticle) {
  return article.featuredImage || article.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";
}

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
    <Link href={`/article/${encodeURIComponent(article.slug)}`} aria-label={article.title} className="group block h-full">
      <article className={`flex h-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-red-200 ${compact ? "gap-4 p-3" : "flex-col"}`}>
        <div className={`relative shrink-0 overflow-hidden rounded-xl bg-slate-200 ${compact ? "h-24 w-24 sm:h-28 sm:w-32" : "h-56 w-full"}`}>
          <Image src={imageFor(article)} alt="" fill sizes={compact ? "(min-width: 640px) 128px, 96px" : "(min-width: 1024px) 360px, 100vw"} className="object-cover brightness-95 transition duration-300 group-hover:scale-105" />
          {!compact ? (
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <ArticleTag>{article.category}</ArticleTag>
            </div>
          ) : null}
        </div>
        <div className={`${compact ? "min-w-0 flex-1 py-1" : "flex flex-1 flex-col p-5"}`}>
          {compact ? <ArticleTag>{article.category}</ArticleTag> : null}
          <h3 className={`${compact ? "mt-2 text-base" : "mt-3 text-2xl"} font-black leading-tight text-slate-950 transition group-hover:text-red-700`} dir="auto">
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

export function CmsHomePage() {
  const { state, isLoading, error, hasLoadedFromSupabase } = useCms();
  const published = publishedArticles(state);
  const homepageArticles = published;
  const homepageCategories = state.categories;
  const homepageRegions = state.regions.length >= 12 ? state.regions : moroccoRegions;
  const enabledSections = new Set(state.homepageSections.filter((section) => section.enabled).map((section) => section.label));
  const show = (label: string) => enabledSections.has(label);
  const featured = homepageArticles.find((article) => article.featured) ?? homepageArticles[0];
  const mostRead = homepageArticles.filter((article) => article.mostRead).slice(0, 5);
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
      {show("Featured Slider") ? <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_420px]">
        <Link href={`/article/${encodeURIComponent(featured.slug)}`} aria-label={featured.title} className="group relative min-h-[430px] overflow-hidden rounded-xl bg-slate-950 text-white shadow-sm md:min-h-[560px]">
          <Image src={imageFor(featured)} alt="" fill priority sizes="(min-width: 1280px) 980px, 100vw" className="object-cover brightness-[0.68] transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-8">
            <div className="flex flex-wrap gap-2">
              <ArticleTag tone="dark">{featured.category}</ArticleTag>
              <ArticleTag tone="dark">Top story</ArticleTag>
            </div>
            <div className="max-w-3xl">
              <h1 className="text-3xl font-black leading-tight tracking-normal md:text-5xl" dir="auto">{featured.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 md:text-lg">{featured.excerpt}</p>
              <div className="mt-5">
                <ArticleMeta article={featured} tone="dark" />
              </div>
            </div>
          </div>
        </Link>
        <aside className="grid gap-4">
          {homepageArticles.slice(1, 4).map((article) => <ArticleCard key={article.id} article={article} compact />)}
        </aside>
      </section> : null}

      {show("Latest News") ? <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
        <SectionBlock title="Latest news" href="/category/national" articles={homepageArticles.slice(1, 5)} />
        <aside className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-slate-950">Most read</h2>
          <ol className="mt-5 space-y-5">
            {mostRead.map((article, index) => (
              <li key={article.id} className="grid grid-cols-[36px_1fr] gap-4">
                <span className="text-3xl font-black text-red-700 tabular-nums">{index + 1}</span>
                <Link href={`/article/${encodeURIComponent(article.slug)}`} className="font-black leading-snug text-slate-900 hover:text-red-700">
                  {article.title}
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </section> : null}

      {show("Regional News") ? <section className="mx-auto w-full max-w-screen-2xl">
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

      <section id="newsletter" className="border border-slate-200 bg-slate-950 p-6 text-white lg:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-black">The Afakpress briefing</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Daily regional and national headlines prepared for readers who follow Morocco closely.</p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row">
            <input aria-label="Email address" className="min-h-12 flex-1 border border-slate-700 bg-white px-4 text-slate-950 outline-none focus:border-red-500" placeholder="reader@example.com" type="email" />
            <button className="min-h-12 bg-red-700 px-5 text-sm font-black text-white transition hover:bg-red-800" type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export function CmsArticlePage({ slug }: { slug: string }) {
  const { state, hasLoadedFromSupabase } = useCms();
  const article = publishedArticles(state).find((item) => item.slug === slug);
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
