import Link from "next/link";
import { articles, categories } from "@/data/articles";
import { moroccoRegions } from "@/data/morocco-regions";

const metrics = [
  { label: "Published articles", value: articles.length },
  { label: "Categories", value: categories.length },
  { label: "Morocco regions", value: moroccoRegions.length },
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <section className="border border-slate-200 bg-white p-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Admin</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Afakpress publishing overview</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          A clean deployment-ready admin placeholder for editorial monitoring. A CMS or secure dashboard can be connected after the public Vercel deployment is stable.
        </p>
        <Link href="/" className="mt-6 inline-block bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700">
          Open homepage
        </Link>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="border border-slate-200 bg-white p-6">
            <p className="text-sm font-bold uppercase text-slate-500">{metric.label}</p>
            <p className="mt-3 text-4xl font-black text-slate-950">{metric.value}</p>
          </div>
        ))}
      </section>
      <section className="border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-black text-slate-950">Editorial queue</h2>
        <div className="mt-5 divide-y divide-slate-200">
          {articles.map((article) => (
            <div key={article.slug} className="grid gap-2 py-4 lg:grid-cols-[1fr_160px_140px]">
              <Link href={`/article/${article.slug}`} className="font-black text-slate-950 hover:text-red-700">
                {article.title}
              </Link>
              <span className="text-sm font-bold text-slate-500">{article.category}</span>
              <span className="text-sm font-bold text-slate-500">{article.publishedAt}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

