"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCms } from "@/lib/cms-store";
import { getPublishedArticles, initialCmsState, type CmsArticle, type CmsState } from "@/lib/cms";
import { moroccoRegions } from "@/data/morocco-regions";
import { sanitizeArticleHtml } from "@/lib/article-html";

interface RegionGridItem {
  id: string;
  name: string;
  provincesCountText: string;
  bgColor: string;
  hoverBgColor: string;
  provincesSample: string;
  news: Array<{ title: string; category?: string }>;
}

const MOROCCO_12_REGIONS: RegionGridItem[] = [
  {
    id: "tanger",
    name: "طنجة تطوان",
    provincesCountText: "8 أقاليم",
    bgColor: "bg-[#5b9bd5]",
    hoverBgColor: "hover:bg-[#4b8ac5]",
    provincesSample: "طنجة أصيلة، تطوان، العرائش، شفشاون، وزان، الحسيمة، الفحص أنجرة، المضيق الفنيدق",
    news: [
      { title: "طنجة.. افتتاح معرض الاقتصاد الأزرق المتوسطي بمشاركة دولية", category: "طنجة" },
      { title: "تطوان.. تدشين مسارات سياحية بيئية جديدة بالريف الغربي", category: "تطوان" },
    ],
  },
  {
    id: "fes",
    name: "فاس مكناس",
    provincesCountText: "9 أقاليم",
    bgColor: "bg-[#1b7a5a]",
    hoverBgColor: "hover:bg-[#156349]",
    provincesSample: "فاس، مكناس، صفرو، بولمان، إفران، تاونات، تازة، الحاجب، مولاي يعقوب",
    news: [
      { title: "فاس.. برنامج طموح لترميم المعالم التاريخية بالمدينة العتيقة", category: "فاس" },
      { title: "مكناس.. استثمارات واعدة في الصناعات الغذائية التحويلية", category: "مكناس" },
    ],
  },
  {
    id: "oriental",
    name: "الشرق",
    provincesCountText: "8 أقاليم",
    bgColor: "bg-[#e58a22]",
    hoverBgColor: "hover:bg-[#cb7516]",
    provincesSample: "وجدة أنجاد، الناظور، الدريوش، جرادة، بركان، تاوريرت، جرسيف، فجيج",
    news: [
      { title: "وجدة.. معرض للمنتوجات المحلية بمشاركة تعاونيات نسائية", category: "وجدة" },
      { title: "الناظور.. تحسين الربط الطرقي بين الجماعات القروية", category: "الناظور" },
    ],
  },
  {
    id: "diaspora",
    name: "الجهة 13",
    provincesCountText: "مغاربة العالم",
    bgColor: "bg-white text-slate-900 border-2 border-dashed border-slate-700",
    hoverBgColor: "hover:bg-slate-50",
    provincesSample: "أوروبا، أمريكا الشمالية، الخليج العربي، إفريقيا، آسيا وأستراليا",
    news: [
      { title: "لندن.. الجالية المغربية تحتفي بعيد الوحدة والذكرى الـ 51 للمسيرة الخضراء", category: "مغاربة العالم" },
      { title: "الكفاءات المغربية بالخارج تناقش مساهمتها في التحول الرقمي الوطني", category: "مغاربة العالم" },
    ],
  },
  {
    id: "rabat",
    name: "الرباط سلا القنيطرة",
    provincesCountText: "7 أقاليم",
    bgColor: "bg-[#be254a]",
    hoverBgColor: "hover:bg-[#a31c3c]",
    provincesSample: "الرباط، سلا، الصخيرات تمارة، القنيطرة، الخميسات، سيدي قاسم، سيدي سليمان",
    news: [
      { title: "الرباط.. إطلاق مشاريع تنموية جديدة لتعزيز النقل الحضري النظيف", category: "الرباط" },
      { title: "القنيطرة.. تسريع وتيرة أشغال القطب الصناعي المندمج", category: "القنيطرة" },
    ],
  },
  {
    id: "benimellal",
    name: "بني ملال خنيفرة",
    provincesCountText: "5 أقاليم",
    bgColor: "bg-[#6b7b2c]",
    hoverBgColor: "hover:bg-[#586622]",
    provincesSample: "بني ملال، أزيلال، الفقيه بن صالح، خنيفرة، خريبكة",
    news: [
      { title: "بني ملال.. دعم المشاريع الزراعية المستدامة والري الحديث", category: "بني ملال" },
      { title: "أزيلال.. تدابير استباقية لمواجهة موجة البرد بالمناطق الجبلية", category: "أزيلال" },
    ],
  },
  {
    id: "casablanca",
    name: "الدار البيضاء سطات",
    provincesCountText: "9 أقاليم",
    bgColor: "bg-[#337a97]",
    hoverBgColor: "hover:bg-[#28637c]",
    provincesSample: "الدار البيضاء، المحمدية، النواصر، مديونة، الجديدة، بنسليمان، برشيد، سطات، سيدي بنور",
    news: [
      { title: "الدار البيضاء.. تقدم كبير في مشاريع البنية التحتية استعداداً للمونديال", category: "الدار البيضاء" },
      { title: "الجديدة.. تدشين مركب تجاري واجتماعي لدعم الشباب", category: "الجديدة" },
    ],
  },
  {
    id: "marrakech",
    name: "مراكش آسفي",
    provincesCountText: "8 أقاليم",
    bgColor: "bg-[#cf4d75]",
    hoverBgColor: "hover:bg-[#b83c61]",
    provincesSample: "مراكش، شيشاوة، الحوز، قلعة السراغنة، الصويرة، الرحامنة، آسفي، اليوسفية",
    news: [
      { title: "مراكش.. انتعاش سياحي استثنائي مع بداية موسم المؤتمرات الدولية", category: "مراكش" },
      { title: "آسفي.. تنمية قطاع الصيد البحري والصناعات التقليدية الفخارية", category: "آسفي" },
    ],
  },
  {
    id: "draa",
    name: "درعة تافيلالت",
    provincesCountText: "5 أقاليم",
    bgColor: "bg-[#a6632e]",
    hoverBgColor: "hover:bg-[#8f5224]",
    provincesSample: "الرشيدية، ورزازات، زاكورة، تنغير، ميدلت",
    news: [
      { title: "ورزازات.. استئناف تصوير إنتاجات سينمائية عالمية كبرى", category: "ورزازات" },
      { title: "الرشيدية.. مشاريع نموذجية لتثمين تمور الواحات ودعم الفلاحين", category: "الرشيدية" },
    ],
  },
  {
    id: "souss",
    name: "سوس ماسة",
    provincesCountText: "6 أقاليم",
    bgColor: "bg-[#e5aa32]",
    hoverBgColor: "hover:bg-[#cc9425]",
    provincesSample: "أكادير إداوتنان، إنزكان آيت ملول، اشتوكة آيت باها، تارودانت، تيزنيت، طاطا",
    news: [
      { title: "أكادير.. تعزيز محطات تحلية مياه البحر لتأمين الحاجيات الفلاحية", category: "أكادير" },
      { title: "تارودانت.. مواصلة تأهيل المدارس والمراكز الصحية القروية", category: "تارودانت" },
    ],
  },
  {
    id: "guelmim",
    name: "كلميم واد نون",
    provincesCountText: "4 أقاليم",
    bgColor: "bg-[#3e4491]",
    hoverBgColor: "hover:bg-[#303679]",
    provincesSample: "كلميم، سيدي إفني، طانطان، آسا الزاك",
    news: [
      { title: "كلميم.. إعطاء انطلاقة مشاريع الطاقة المتجددة والهيدروجين الأخضر", category: "كلميم" },
      { title: "طانطان.. استمرار برامج النهوض بالثرات الثقافي الحساني", category: "طانطان" },
    ],
  },
  {
    id: "laayoune",
    name: "العيون الساقية الحمراء",
    provincesCountText: "4 أقاليم",
    bgColor: "bg-[#c64f3c]",
    hoverBgColor: "hover:bg-[#a93e2d]",
    provincesSample: "العيون، بوجدور، طرفاية، السمارة",
    news: [
      { title: "العيون.. المسيرة الخضراء ملحمة تاريخية كرست تشبث المغاربة بوحدتهم الترابية", category: "العيون" },
      { title: "السمارة.. مشاريع مائية وطرقية جديدة لفك العزلة عن الجماعات القروية", category: "السمارة" },
    ],
  },
  {
    id: "dakhla",
    name: "الداخلة وادي الذهب",
    provincesCountText: "2 إقليمان",
    bgColor: "bg-[#25b5a8]",
    hoverBgColor: "hover:bg-[#1d968b]",
    provincesSample: "وادي الذهب، أوسرد",
    news: [
      { title: "الداخلة.. وتيرة متسارعة لأشغال ميناء الداخلة الأطلسي الاستراتيجي", category: "الداخلة" },
      { title: "الداخلة.. قطب سياحي عالمي لرياضات ركوب الأمواج والاستدامة", category: "الداخلة" },
    ],
  },
];

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

  const [selectedRegionId, setSelectedRegionId] = useState<string>("oriental");
  const selectedRegion = MOROCCO_12_REGIONS.find((r) => r.id === selectedRegionId) || MOROCCO_12_REGIONS[2];

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
        <section
          className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-10 items-start font-sans"
          dir="rtl"
        >
          {/* LEFT COLUMN: Morocco 12 Regions Mosaic & Interactive Box (approx 36% width) */}
          <div className="w-full lg:w-[38%] shrink-0 flex flex-col">
            {/* Header Title */}
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                المغرب بجهاته الاثنتي عشرة
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                اختر جهة لتتصفح أخبارها وأقاليمها
              </p>
            </div>

            {/* Mosaic Grid: 4 columns corresponding to screenshot placement */}
            <div className="grid grid-cols-4 gap-2 text-center text-white">
              {/* Row 1: Tanger, Fes, Oriental (Active by default), Diaspora */}
              {MOROCCO_12_REGIONS.slice(0, 4).map((region) => {
                const isActive = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`relative flex flex-col justify-between rounded-lg p-2.5 transition duration-200 text-right cursor-pointer min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-3 ring-slate-900 shadow-md scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}

              {/* Row 2: Rabat (col 1), Beni Mellal (col 2), editorial hint placeholder (cols 3-4) */}
              {MOROCCO_12_REGIONS.slice(4, 6).map((region) => {
                const isActive = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`relative flex flex-col justify-between rounded-lg p-2.5 transition duration-200 text-right cursor-pointer min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-3 ring-slate-900 shadow-md scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}
              <div className="col-span-2 flex items-center justify-center p-2 text-[11px] leading-relaxed text-slate-400 font-medium text-center">
                خريطة تحريرية مبسطة. الشمال في الأعلى، والغرب جهة المحيط.
              </div>

              {/* Row 3: Casablanca (col 1), Marrakech (col 2), Draa Tafilalet (col 3) */}
              {MOROCCO_12_REGIONS.slice(6, 9).map((region) => {
                const isActive = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`relative flex flex-col justify-between rounded-lg p-2.5 transition duration-200 text-right cursor-pointer min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-3 ring-slate-900 shadow-md scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}
              {/* Empty placeholder cell 4 */}
              <div />

              {/* Row 4: Souss Massa */}
              {MOROCCO_12_REGIONS.slice(9, 10).map((region) => {
                const isActive = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`relative flex flex-col justify-between rounded-lg p-2.5 transition duration-200 text-right cursor-pointer min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-3 ring-slate-900 shadow-md scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}
              <div className="col-span-3" />

              {/* Row 5: Guelmim Oued Noun */}
              {MOROCCO_12_REGIONS.slice(10, 11).map((region) => {
                const isActive = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`relative flex flex-col justify-between rounded-lg p-2.5 transition duration-200 text-right cursor-pointer min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-3 ring-slate-900 shadow-md scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}
              <div className="col-span-3" />

              {/* Row 6: Laayoune Sakia El Hamra */}
              {MOROCCO_12_REGIONS.slice(11, 12).map((region) => {
                const isActive = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`relative flex flex-col justify-between rounded-lg p-2.5 transition duration-200 text-right cursor-pointer min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-3 ring-slate-900 shadow-md scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}
              <div className="col-span-3" />

              {/* Row 7: Dakhla Oued Ed-Dahab */}
              {MOROCCO_12_REGIONS.slice(12, 13).map((region) => {
                const isActive = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`relative flex flex-col justify-between rounded-lg p-2.5 transition duration-200 text-right cursor-pointer min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-3 ring-slate-900 shadow-md scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}
              <div className="col-span-3" />
            </div>

            {/* Active Region Preview Card matching screenshot */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition duration-300">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900">
                  جهة {selectedRegion.name}
                </h3>
                <span className="text-xs text-slate-500 font-bold tabular-nums">
                  {selectedRegion.provincesCountText} وعمالات
                </span>
              </div>

              {/* News list */}
              <div className="divide-y divide-slate-100 py-2">
                {selectedRegion.news.map((n, idx) => (
                  <Link
                    key={idx}
                    href="/category/regions"
                    className="group block py-2.5 transition hover:text-red-700"
                  >
                    <p className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-red-700">
                      {n.title}
                    </p>
                  </Link>
                ))}
              </div>

              {/* Provinces list sample */}
              <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                {selectedRegion.provincesSample}
              </p>

              {/* Full Region News Link */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-start">
                <Link
                  href="/category/regions"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 hover:text-red-700 transition"
                >
                  <span>كل أخبار الجهة</span>
                  <span className="text-red-700 font-bold text-sm">←</span>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Hero Editorial Article + 3 Columns Secondary (approx 62% width) */}
          <div className="w-full lg:w-[62%] flex flex-col">
            {/* Main Featured Article */}
            <Link
              href={`/article/${encodeURIComponent(featured.slug)}`}
              className="group block"
            >
              {/* Featured Article Exact Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md">
                <Image
                  src={imageFor(featured, 0)}
                  alt={featured.title || "صورة المقال"}
                  fill
                  priority
                  sizes="(min-width: 1024px) 850px, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Text content under the image */}
              <div className="mt-5 text-right">
                {/* Category badge */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#c2410c]">
                  <span className="inline-block size-2 rounded-xs bg-[#c2410c]" />
                  <span>قصة مميزة · وطنية</span>
                </div>

                {/* Big Serif Title */}
                <h1 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-black leading-[1.25] text-slate-950 transition duration-200 group-hover:text-red-700">
                  {featured.title && featured.title.includes("الذكرى")
                    ? featured.title
                    : "الذكرى 51 للمسيرة الخضراء المظفرة.. ملحمة وطنية متجددة ومكاسب دبلوماسية راسخة"}
                </h1>

                {/* Excerpt */}
                <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {featured.excerpt ||
                    "يخلد الشعب المغربي قاطبة، من طنجة إلى الكويرة، في أجواء من الحماس الفياض والتعبئة المستمرة، ذكرى المسيرة الخضراء، واليقظة الموصولة حول قضية الوحدة الترابية."}
                </p>

                {/* Metadata */}
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <span>آفاق بريس</span>
                  <span>·</span>
                  <span dir="rtl">5 نونبر 2026</span>
                  <span>·</span>
                  <span>3 دقائق للقراءة</span>
                </div>
              </div>
            </Link>

            {/* 3 Secondary Editorial Columns with Colored Top Accent Bars */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Secondary 1: Orange-red accent */}
              <Link
                href={secondaryArticles[0] ? `/article/${encodeURIComponent(secondaryArticles[0].slug)}` : "/category/regions"}
                className="group block"
              >
                <div className="h-1 w-full bg-[#c2410c] rounded-full mb-3.5 transition group-hover:h-1.5" />
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#c2410c] mb-1.5">
                  <span className="inline-block size-1.5 rounded-xs bg-[#c2410c]" />
                  <span>العيون</span>
                </div>
                <h3 className="font-serif text-sm sm:text-base font-black leading-snug text-slate-900 transition group-hover:text-red-700">
                  {secondaryArticles[0]?.title ||
                    "العيون.. المسيرة الخضراء ملحمة تاريخية كرست تشبث المغاربة بوحدتهم الترابية"}
                </h3>
                <span className="mt-3 block text-[11px] text-slate-400 tabular-nums font-medium">
                  7 نونبر 2026
                </span>
              </Link>

              {/* Secondary 2: Ruby / Berry accent */}
              <Link
                href={secondaryArticles[1] ? `/article/${encodeURIComponent(secondaryArticles[1].slug)}` : "/category/sports"}
                className="group block"
              >
                <div className="h-1 w-full bg-[#be185d] rounded-full mb-3.5 transition group-hover:h-1.5" />
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#be185d] mb-1.5">
                  <span className="inline-block size-1.5 rounded-xs bg-[#be185d]" />
                  <span>رياضة</span>
                </div>
                <h3 className="font-serif text-sm sm:text-base font-black leading-snug text-slate-900 transition group-hover:text-red-700">
                  {secondaryArticles[1]?.title ||
                    "الجيش الملكي يحقق انتصارا كبيرا في دوري أبطال إفريقيا للسيدات"}
                </h3>
                <span className="mt-3 block text-[11px] text-slate-400 tabular-nums font-medium">
                  5 نونبر 2026
                </span>
              </Link>

              {/* Secondary 3: Navy accent */}
              <Link
                href={secondaryArticles[2] ? `/article/${encodeURIComponent(secondaryArticles[2].slug)}` : "/category/national"}
                className="group block"
              >
                <div className="h-1 w-full bg-[#1e293b] rounded-full mb-3.5 transition group-hover:h-1.5" />
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1e293b] mb-1.5">
                  <span className="inline-block size-1.5 rounded-xs bg-[#1e293b]" />
                  <span>مغاربة العالم</span>
                </div>
                <h3 className="font-serif text-sm sm:text-base font-black leading-snug text-slate-900 transition group-hover:text-red-700">
                  {secondaryArticles[2]?.title ||
                    "لندن.. الجالية المغربية تحتفي بعيد الوحدة والذكرى الـ 51 للمسيرة الخضراء"}
                </h3>
                <span className="mt-3 block text-[11px] text-slate-400 tabular-nums font-medium">
                  8 نونبر 2026
                </span>
              </Link>
            </div>
          </div>
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
