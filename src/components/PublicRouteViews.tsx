import Image from "next/image";
import Link from "next/link";
import type { PublicArticle, PublicEntity, PublicLocation } from "@/lib/public-content";

const fallbackImage = "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";
const emptyMessage = "No published articles are available in this section yet.";

function articleImage(article: PublicArticle) {
  return article.featured_image || fallbackImage;
}

function formattedDate(article: PublicArticle) {
  const value = article.published_at ?? article.created_at;
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function ArticleCard({ article }: { article: PublicArticle }) {
  return (
    <Link href={`/article/${article.slug}`} aria-label={article.title} className="group block">
      <article className="grid gap-4 overflow-hidden rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg sm:grid-cols-[180px_1fr]">
        <div className="relative h-40 overflow-hidden rounded-lg bg-slate-200 sm:h-full">
          <Image src={articleImage(article)} alt="" fill sizes="(min-width: 640px) 180px, 100vw" className="object-cover transition duration-300 group-hover:scale-105" />
        </div>
        <div className="p-2">
          <p className="text-xs font-black uppercase text-red-700">{article.category?.name ?? ""}</p>
          <h2 className="mt-2 text-xl font-black leading-tight text-slate-950 group-hover:text-red-700" dir="auto">{article.title}</h2>
          {article.excerpt ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{article.excerpt}</p> : null}
          {formattedDate(article) ? <p className="mt-4 text-xs font-bold text-slate-500">{formattedDate(article)}</p> : null}
        </div>
      </article>
    </Link>
  );
}

function ArticleList({ articles }: { articles: PublicArticle[] }) {
  if (!articles.length) {
    return <p className="border border-slate-200 bg-white p-6 text-slate-600">{emptyMessage}</p>;
  }
  return <div className="space-y-6">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div>;
}

export function PublicArticleView({ article }: { article: PublicArticle }) {
  const locations = [article.region?.name, article.province?.name, article.commune?.name].filter(Boolean);
  return (
    <article className="mx-auto max-w-5xl">
      <div className="border-b-4 border-slate-950 pb-6">
        {article.category?.name ? <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">{article.category.name}</p> : null}
        <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950 lg:text-6xl" dir="auto">{article.title}</h1>
        {article.excerpt ? <p className="mt-5 text-xl leading-8 text-slate-600">{article.excerpt}</p> : null}
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-slate-500">
          {formattedDate(article) ? <span>{formattedDate(article)}</span> : null}
          {locations.length ? <span>{locations.join(" / ")}</span> : null}
        </div>
      </div>
      {article.featured_image ? (
        <div className="relative mt-8 h-[420px] w-full overflow-hidden bg-slate-200 lg:h-[560px]">
          <Image src={article.featured_image} alt="" fill priority sizes="(min-width: 1024px) 896px, 100vw" className="object-cover" />
        </div>
      ) : null}
      <div className="mt-8 space-y-6 text-lg leading-9 text-slate-700">
        {(article.content ?? "").split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)}
      </div>
    </article>
  );
}

export function PublicCategoryView({ entity, articles }: { entity: PublicEntity; articles: PublicArticle[] }) {
  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Category</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">{entity.name}</h1>
      {entity.description ? <p className="mt-4 text-lg leading-8 text-slate-600">{entity.description}</p> : null}
      <div className="mt-10"><ArticleList articles={articles} /></div>
    </section>
  );
}

export function PublicLocationView({ kind, location, articles }: { kind: "Region" | "Province / Prefecture" | "Commune"; location: PublicLocation; articles: PublicArticle[] }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">{kind}</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">{location.entity.name}</h1>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-black">
          {location.region ? <Link href={`/region/${location.region.slug}`} className="text-red-700 hover:underline">{location.region.name}</Link> : null}
          {location.province ? <Link href={`/province/${location.province.slug}`} className="text-slate-600 hover:text-red-700">{location.province.name}</Link> : null}
        </div>
        <div className="mt-8"><ArticleList articles={articles} /></div>
      </section>
      <aside className="border border-slate-200 bg-white p-6">
        <h2 className="border-b-4 border-red-700 pb-3 text-xl font-black uppercase text-slate-950">Local structure</h2>
        <div className="mt-5 grid gap-3">
          {location.provinces?.map((province) => (
            <div key={province.id}>
              <Link href={`/province/${province.slug}`} className="font-black text-slate-950 hover:text-red-700">{province.name}</Link>
              <p className="mt-1 text-sm text-slate-600">{province.communes.map((commune) => commune.name).join(", ")}</p>
            </div>
          ))}
          {location.communes?.map((commune) => <Link key={commune.id} href={`/commune/${commune.slug}`} className="font-bold text-slate-700 hover:text-red-700">{commune.name}</Link>)}
        </div>
      </aside>
    </div>
  );
}

export function PublicDatabaseError() {
  return <p className="border border-amber-200 bg-amber-50 p-6 text-amber-900">Content is temporarily unavailable. Please try again shortly.</p>;
}
