import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { getArticlesByRegion, getRegion } from "@/data/articles";
import { moroccoRegions } from "@/data/morocco-regions";

export function generateStaticParams() {
  return moroccoRegions.map((region) => ({ slug: region.slug }));
}

export default async function RegionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const region = getRegion(slug);

  if (!region) {
    notFound();
  }

  const regionArticles = getArticlesByRegion(slug);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Regional desk</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">{region.name}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Coverage organized by region, province or prefecture, and commune.</p>
        <div className="mt-8 space-y-6">
          {regionArticles.length > 0 ? (
            regionArticles.map((article) => <ArticleCard key={article.slug} article={article} />)
          ) : (
            <p className="border border-slate-200 bg-white p-6 text-slate-600">No articles are assigned to this region yet.</p>
          )}
        </div>
      </section>
      <aside className="border border-slate-200 bg-white p-6">
        <h2 className="border-b-4 border-red-700 pb-3 text-xl font-black uppercase text-slate-950">Local structure</h2>
        <div className="mt-5 space-y-5">
          {region.provinces.map((province) => (
            <div key={province.slug}>
              <h3 className="font-black text-slate-950">{province.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{province.communes.map((commune) => commune.name).join(", ")}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

