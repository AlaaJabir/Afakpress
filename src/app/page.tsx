import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { FeaturedArticle } from "@/components/FeaturedArticle";
import { MostRead } from "@/components/MostRead";
import { Newsletter } from "@/components/Newsletter";
import { SectionBlock } from "@/components/SectionBlock";
import { articles, categories, featuredArticle, latestArticles, mostReadArticles } from "@/data/articles";
import { moroccoRegions } from "@/data/morocco-regions";

export default function Home() {
  const regionalArticles = articles.filter((article) => article.category === "regions");
  const economyArticles = articles.filter((article) => article.category === "economy");
  const opinionArticles = articles.filter((article) => article.category === "opinion");

  return (
    <div className="space-y-12">
      <FeaturedArticle article={featuredArticle} />

      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <SectionBlock title="Latest news" href="/category/national" articles={latestArticles.slice(1, 5)} />
        <MostRead articles={mostReadArticles} />
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4 border-b-4 border-slate-950 pb-3">
          <h2 className="text-2xl font-black uppercase text-slate-950">Morocco regions</h2>
          <Link href="/category/regions" className="text-sm font-black text-red-700 hover:underline">
            Regional desk
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {moroccoRegions.slice(0, 8).map((region) => (
            <Link key={region.slug} href={`/region/${region.slug}`} className="border border-slate-200 bg-white p-5 transition hover:border-red-700">
              <span className="block text-lg font-black text-slate-950">{region.name}</span>
              <span className="mt-3 block text-sm leading-6 text-slate-600">
                {region.provinces.map((province) => province.name).join(" / ")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        {categories.slice(0, 3).map((category) => {
          const categoryArticles = articles.filter((article) => article.category === category.slug).slice(0, 2);
          return (
            <div key={category.slug} className="border border-slate-200 bg-white p-6">
              <h2 className="border-b-4 border-red-700 pb-3 text-xl font-black uppercase text-slate-950">{category.name}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">{category.description}</p>
              <div className="mt-5 space-y-4">
                {categoryArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <SectionBlock title="Regional news" href="/category/regions" articles={regionalArticles} />
        <SectionBlock title="Economy and opinion" href="/category/economy" articles={[...economyArticles, ...opinionArticles].slice(0, 3)} />
      </section>

      <Newsletter />
    </div>
  );
}

