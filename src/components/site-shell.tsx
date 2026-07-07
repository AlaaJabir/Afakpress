import Link from "next/link";
import { articles, regions } from "@/lib/content";

const navItems = ["أخبار", "سياسة", "اقتصاد", "ثقافة", "رياضة", "آراء"];

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-black tracking-[0.25em] text-zinc-950">
          Afakpress
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-zinc-700 md:flex">
          {navItems.map((item) => (
            <Link key={item} href="/" className="transition hover:text-red-700">
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function BreakingNewsBar() {
  return (
    <div className="border-b border-zinc-200 bg-zinc-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8">
        <span className="rounded-full bg-red-700 px-3 py-1 font-semibold">عاجل</span>
        <span>المغرب يُعزز جهوده في التحول الاقتصادي والجهوي.</span>
      </div>
    </div>
  );
}

export function MegaMenu() {
  return (
    <div className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 text-sm sm:px-6 md:grid-cols-3 lg:px-8">
        {regions.map((region) => (
          <div key={region.slug} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-zinc-950">{region.name}</h3>
            <div className="mt-3 space-y-2">
              {region.provinces.map((province) => (
                <div key={province.slug}>
                  <Link href={`/region/${region.slug}`} className="font-medium text-zinc-700 hover:text-red-700">
                    {province.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-2 pl-2 text-xs text-zinc-500">
                    {province.communes.map((commune) => (
                      <span key={commune.slug}>{commune.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturedArticle() {
  const featured = articles.find((article) => article.featured) ?? articles[0];
  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <img src={featured.image} alt={featured.title} className="h-72 w-full object-cover" />
        <div className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-700">الرئيسية</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-zinc-950">{featured.title}</h1>
          <p className="mt-3 text-base leading-7 text-zinc-600">{featured.excerpt}</p>
          <Link href={`/article/${featured.slug}`} className="mt-5 inline-flex rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white">
            اقرأ المزيد
          </Link>
        </div>
      </article>
      <div className="space-y-4">
        {articles.slice(1, 3).map((article) => (
          <article key={article.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-red-700">{article.category}</p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-900">{article.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{article.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ArticleCard({ article }: { article: (typeof articles)[number] }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-700">{article.category}</p>
      <h3 className="mt-3 text-lg font-semibold text-zinc-900">{article.title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{article.excerpt}</p>
      <Link href={`/article/${article.slug}`} className="mt-4 inline-block text-sm font-semibold text-zinc-950">
        اقرأ المزيد
      </Link>
    </article>
  );
}

export function SectionBlock({ title, articles: sectionArticles }: { title: string; articles: typeof articles }) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
        <Link href="/" className="text-sm font-semibold text-red-700">المزيد</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sectionArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}

export function MostRead() {
  const mostRead = articles.filter((article) => article.mostRead);
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-950">الأكثر قراءة</h2>
      <div className="mt-4 space-y-3">
        {mostRead.map((article) => (
          <Link key={article.id} href={`/article/${article.slug}`} className="block rounded-xl border border-zinc-200 p-3 text-sm text-zinc-700 hover:border-red-700">
            {article.title}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function Newsletter() {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm">
      <h2 className="text-xl font-semibold">اشترك في النشرة اليومية</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">احصل على أبرز الأخبار المغربية والدولية مباشرة في بريدك.</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input className="w-full rounded-full border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white" placeholder="بريدك الإلكتروني" />
        <button className="rounded-full bg-red-700 px-5 py-3 text-sm font-semibold">اشترك</button>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-zinc-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>© 2026 Afakpress. كل الحقوق محفوظة.</p>
        <div className="flex gap-4">
          <Link href="/" className="hover:text-red-700">من نحن</Link>
          <Link href="/" className="hover:text-red-700">اتصل بنا</Link>
          <Link href="/admin" className="hover:text-red-700">الإدارة</Link>
        </div>
      </div>
    </footer>
  );
}
