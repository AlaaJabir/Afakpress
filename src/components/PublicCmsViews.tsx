"use client";

import Image from "next/image";
import Link from "next/link";
import { useCms } from "@/lib/cms-store";
import { getPublishedArticles, type CmsArticle } from "@/lib/cms";

function imageFor(article: CmsArticle) {
  return article.featuredImage || article.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";
}

function ArticleCard({ article }: { article: CmsArticle }) {
  return (
    <article className="grid gap-4 border-b border-slate-200 pb-6 sm:grid-cols-[160px_1fr]">
      <div className="relative h-32 w-full overflow-hidden sm:h-full">
        <Image src={imageFor(article)} alt="" fill sizes="(min-width: 640px) 160px, 100vw" className="object-cover" />
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

function SectionBlock({ title, href, articles }: { title: string; href: string; articles: CmsArticle[] }) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4 border-b-4 border-slate-950 pb-3">
        <h2 className="text-2xl font-black uppercase text-slate-950">{title}</h2>
        <Link href={href} className="text-sm font-black text-red-700 hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-6">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div>
    </section>
  );
}

export function CmsHomePage() {
  const { state } = useCms();
  const published = getPublishedArticles(state);
  const enabledSections = new Set(state.homepageSections.filter((section) => section.enabled).map((section) => section.label));
  const show = (label: string) => enabledSections.has(label);
  const featured = published.find((article) => article.featured) ?? published[0];
  const mostRead = published.filter((article) => article.mostRead).slice(0, 5);
  const regionalArticles = published.filter((article) => article.category === "regions");
  const economyArticles = published.filter((article) => article.category === "economy");
  const opinionArticles = published.filter((article) => article.category === "opinion");

  if (!featured) {
    return <p className="border border-slate-200 bg-white p-6 text-slate-600">No published articles yet.</p>;
  }

  return (
    <div className="space-y-12">
      {show("Featured Slider") ? <article className="grid overflow-hidden border border-slate-200 bg-white lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-80 w-full lg:min-h-[560px]">
          <Image src={imageFor(featured)} alt="" fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center p-6 lg:p-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Top story</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950 lg:text-5xl">{featured.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">{featured.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
            <span>{featured.author}</span>
            <span>{featured.publishDate}</span>
            <span>{featured.readingTime}</span>
          </div>
          <Link href={`/article/${featured.slug}`} className="mt-8 w-fit bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700">
            Read the story
          </Link>
        </div>
      </article> : null}

      {show("Latest News") ? <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <SectionBlock title="Latest news" href="/category/national" articles={published.slice(1, 5)} />
        <aside className="border border-slate-200 bg-white p-6">
          <h2 className="border-b-4 border-red-700 pb-3 text-xl font-black uppercase text-slate-950">Most read</h2>
          <ol className="mt-5 space-y-5">
            {mostRead.map((article, index) => (
              <li key={article.id} className="grid grid-cols-[36px_1fr] gap-4">
                <span className="text-3xl font-black text-red-700">{index + 1}</span>
                <Link href={`/article/${article.slug}`} className="font-black leading-snug text-slate-900 hover:text-red-700">
                  {article.title}
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </section> : null}

      {show("Regional News") ? <section>
        <div className="mb-6 flex items-end justify-between gap-4 border-b-4 border-slate-950 pb-3">
          <h2 className="text-2xl font-black uppercase text-slate-950">Morocco regions</h2>
          <Link href="/category/regions" className="text-sm font-black text-red-700 hover:underline">
            Regional desk
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {state.regions.slice(0, 8).map((region) => (
            <Link key={region.id} href={`/region/${region.slug}`} className="border border-slate-200 bg-white p-5 transition hover:border-red-700">
              <span className="block text-lg font-black text-slate-950">{region.name}</span>
              <span className="mt-3 block text-sm leading-6 text-slate-600">{region.provinces.map((province) => province.name).join(" / ")}</span>
            </Link>
          ))}
        </div>
      </section> : null}

      <section className="grid gap-8 lg:grid-cols-3">
        {state.categories.slice(0, 3).map((category) => {
          const categoryArticles = published.filter((article) => article.category === category.slug).slice(0, 2);
          return (
            <div key={category.id} className="border border-slate-200 bg-white p-6">
              <h2 className="border-b-4 border-red-700 pb-3 text-xl font-black uppercase text-slate-950">{category.name}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">{category.description}</p>
              <div className="mt-5 space-y-4">{categoryArticles.map((article) => <ArticleCard key={article.id} article={article} />)}</div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <SectionBlock title="Regional news" href="/category/regions" articles={regionalArticles} />
        {show("Economy") || show("Opinion") ? <SectionBlock title="Economy and opinion" href="/category/economy" articles={[...economyArticles, ...opinionArticles].slice(0, 3)} /> : null}
      </section>

      <section className="border border-slate-200 bg-slate-950 p-6 text-white">
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
  const { state } = useCms();
  const article = state.articles.find((item) => item.slug === slug);
  const region = state.regions.find((item) => item.slug === article?.region);

  if (!article) {
    return <p className="border border-slate-200 bg-white p-6 text-slate-600">Article not found.</p>;
  }

  return (
    <article className="mx-auto max-w-4xl">
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
      <div className="relative mt-8 h-[420px] w-full overflow-hidden">
        <Image src={imageFor(article)} alt="" fill priority sizes="(min-width: 1024px) 896px, 100vw" className="object-cover" />
      </div>
      <div className="mt-8 space-y-6 text-lg leading-9 text-slate-700">
        {article.content.split(/\n{2,}/).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}

export function CmsCategoryPage({ slug }: { slug: string }) {
  const { state } = useCms();
  const category = state.categories.find((item) => item.slug === slug);
  const categoryArticles = getPublishedArticles(state).filter((article) => article.category === slug);

  if (!category) {
    return <p className="border border-slate-200 bg-white p-6 text-slate-600">Category not found.</p>;
  }

  return (
    <section className="mx-auto max-w-4xl">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Category</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">{category.name}</h1>
      <p className="mt-4 text-lg leading-8 text-slate-600">{category.description}</p>
      <div className="mt-10 space-y-6">
        {categoryArticles.length > 0 ? categoryArticles.map((article) => <ArticleCard key={article.id} article={article} />) : <p className="border border-slate-200 bg-white p-6 text-slate-600">No published articles in this category yet.</p>}
      </div>
    </section>
  );
}

export function CmsRegionPage({ slug }: { slug: string }) {
  const { state } = useCms();
  const region = state.regions.find((item) => item.slug === slug);
  const regionArticles = getPublishedArticles(state).filter((article) => article.region === slug);

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
            <div key={province.id}>
              <h3 className="font-black text-slate-950">{province.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{province.communes.map((commune) => commune.name).join(", ")}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
