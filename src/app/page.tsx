import { ArticleCard, BreakingNewsBar, FeaturedArticle, Footer, Header, MegaMenu, MostRead, Newsletter, SectionBlock } from "@/components/site-shell";
import { articles } from "@/lib/content";

const politics = articles.filter((article) => article.category === "سياسة");
const economy = articles.filter((article) => article.category === "اقتصاد");
const society = articles.filter((article) => article.category === "مدينة");
const culture = articles.filter((article) => article.category === "ثقافة");
const sport = articles.filter((article) => article.category === "رياضة");
const opinion = articles.filter((article) => article.category === "آراء");

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Header />
      <BreakingNewsBar />
      <MegaMenu />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <FeaturedArticle />
        <section className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="grid gap-8">
            <SectionBlock title="آخر الأخبار" articles={articles.slice(0, 2)} />
            <SectionBlock title="سياسة" articles={politics} />
            <SectionBlock title="اقتصاد" articles={economy} />
            <SectionBlock title="ثقافة" articles={culture} />
          </div>
          <div className="space-y-8">
            <MostRead />
            <SectionBlock title="مجتمع" articles={society} />
            <SectionBlock title="رياضة" articles={sport} />
            <SectionBlock title="آراء" articles={opinion} />
          </div>
        </section>
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
