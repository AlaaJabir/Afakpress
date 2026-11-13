"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useCms } from "@/lib/cms-store";
import { getPublishedArticles, initialCmsState, type CmsArticle, type CmsState } from "@/lib/cms";
import { moroccoRegions } from "@/data/morocco-regions";
import { sanitizeArticleHtml } from "@/lib/article-html";
import { ArticleComments } from "@/components/ArticleComments";
import { FALLBACK_13EME_ARTICLES, type ThirteenthRegionArticle } from "@/lib/thirteenth-region";
import type { PublicComment } from "@/lib/comments-store";

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

function isValidImageUrl(url?: string) {
  return Boolean(url && (url.startsWith("http") || url.startsWith("/") || url.startsWith("data:image/")));
}

function imageFor(article: CmsArticle, fallbackIndex = 0) {
  if (isValidImageUrl(article.featuredImage)) return article.featuredImage;
  if (isValidImageUrl(article.image)) return article.image;
  return PRO_EDITORIAL_IMAGES[fallbackIndex % PRO_EDITORIAL_IMAGES.length];
}

function formatArabicLatinDate(dateStr?: string) {
  if (!dateStr) return "";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat("ar-MA-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
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
  const isEconomyArticle = (article: CmsArticle) => {
    const rawCat = articleCategorySlug(state, article).trim().toLowerCase();
    const matchedCat = homepageCategories.find(
      (c) => c.id === article.categoryId || c.slug.toLowerCase() === rawCat || c.name.toLowerCase() === rawCat
    );
    return (
      rawCat === "economy" ||
      rawCat === "اقتصاد" ||
      matchedCat?.slug.toLowerCase() === "economy" ||
      matchedCat?.slug === "اقتصاد" ||
      matchedCat?.name === "اقتصاد"
    );
  };
  const economyArticles = effectiveArticles.filter(isEconomyArticle);
  const economyKeywordPattern = /اقتصاد|مالية|المالية|الضرائب|المقاولات|استثمار|الزراعة|البنك|التعاونيات|رواد الأعمال/;
  const economyRelatedFallback = effectiveArticles.filter(
    (article) =>
      !economyArticles.some((e) => e.id === article.id || e.slug === article.slug) &&
      (economyKeywordPattern.test(article.title) || economyKeywordPattern.test(article.excerpt || ""))
  );
  const economyDisplayArticles = dedupeArticles([
    ...economyArticles,
    ...economyRelatedFallback,
    ...effectiveArticles,
  ]).slice(0, 4);
  const heroEconomyArticle = economyDisplayArticles[0];
  const sideEconomyArticles = economyDisplayArticles.slice(1, 4);
  const opinionMatches = effectiveArticles.filter((article) => {
    const rawCat = articleCategorySlug(state, article).trim().toLowerCase();
    return (
      rawCat === "opinion" ||
      rawCat === "رأي" ||
      /قراءة تحليلية|المقاربة الدبلوماسية|كواد|مفترق الطرق|الضرائب|وعود الحكومة/.test(article.title)
    );
  });
  const opinionDisplayArticles = dedupeArticles([
    ...opinionMatches,
    ...effectiveArticles,
  ]).slice(0, 3);

  const [selectedRegionId, setSelectedRegionId] = useState<string>("oriental");
  const selectedRegion = MOROCCO_12_REGIONS.find((r) => r.id === selectedRegionId) || MOROCCO_12_REGIONS[2];
  const [thirteenthRegionArticles, setThirteenthRegionArticles] = useState<ThirteenthRegionArticle[]>(
    FALLBACK_13EME_ARTICLES.slice(0, 4),
  );
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [recentCommentsByArticle, setRecentCommentsByArticle] = useState<Record<string, PublicComment[]>>({});
  const [openCommentArticleId, setOpenCommentArticleId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/external/13eme-region")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active || !Array.isArray(payload?.articles) || payload.articles.length === 0) return;
        setThirteenthRegionArticles((payload.articles as ThirteenthRegionArticle[]).slice(0, 4));
      })
      .catch(() => {
        // Keep fallback 13eme-region snapshot on network failure
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/comments?summary=1")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active || !payload) return;
        if (payload.counts && typeof payload.counts === "object") {
          setCommentCounts(payload.counts as Record<string, number>);
        }
        if (payload.recentByArticle && typeof payload.recentByArticle === "object") {
          setRecentCommentsByArticle(payload.recentByArticle as Record<string, PublicComment[]>);
        }
      })
      .catch(() => {
        // Comments summary optional
      });
    return () => {
      active = false;
    };
  }, []);

  const handleOpinionCommentCount = useCallback((articleId: string, count: number) => {
    setCommentCounts((prev) => (prev[articleId] === count ? prev : { ...prev, [articleId]: count }));
  }, []);

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
    <div className="space-y-8 sm:space-y-12 lg:space-y-14">
      {isLoading ? <p className="border border-slate-200 bg-white p-4 text-sm font-bold text-slate-600">Loading latest newsroom data...</p> : null}
      {error ? <p className="border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">{error}</p> : null}
      {show("Featured Slider") && featured ? (
        <section
          className="flex flex-col-reverse lg:flex-row gap-6 sm:gap-8 lg:gap-10 items-start font-sans"
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

            {/* Mosaic Grid: 2 columns on mobile (clean compact grid), 4 columns geographic mosaic on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-center text-white">
              {/* Row 1: Tanger, Fes, Oriental (Active by default), Diaspora */}
              {MOROCCO_12_REGIONS.slice(0, 4).map((region) => {
                const isActive = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`relative flex flex-col justify-between rounded-lg p-2 sm:p-2.5 transition duration-200 text-right cursor-pointer min-h-[64px] sm:min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-2 sm:ring-3 ring-slate-900 shadow-md sm:scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-xs sm:text-[13px] font-black leading-snug line-clamp-2">
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
                    className={`relative flex flex-col justify-between rounded-lg p-2 sm:p-2.5 transition duration-200 text-right cursor-pointer min-h-[64px] sm:min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-2 sm:ring-3 ring-slate-900 shadow-md sm:scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-xs sm:text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}
              <div className="hidden sm:flex col-span-2 items-center justify-center p-2 text-[11px] leading-relaxed text-slate-400 font-medium text-center">
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
                    className={`relative flex flex-col justify-between rounded-lg p-2 sm:p-2.5 transition duration-200 text-right cursor-pointer min-h-[64px] sm:min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-2 sm:ring-3 ring-slate-900 shadow-md sm:scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-xs sm:text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}
              {/* Empty placeholder cell 4 */}
              <div className="hidden sm:block" />

              {/* Row 4: Souss Massa */}
              {MOROCCO_12_REGIONS.slice(9, 10).map((region) => {
                const isActive = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`relative flex flex-col justify-between rounded-lg p-2 sm:p-2.5 transition duration-200 text-right cursor-pointer min-h-[64px] sm:min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-2 sm:ring-3 ring-slate-900 shadow-md sm:scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-xs sm:text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}
              <div className="hidden sm:block col-span-3" />

              {/* Row 5: Guelmim Oued Noun */}
              {MOROCCO_12_REGIONS.slice(10, 11).map((region) => {
                const isActive = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`relative flex flex-col justify-between rounded-lg p-2 sm:p-2.5 transition duration-200 text-right cursor-pointer min-h-[64px] sm:min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-2 sm:ring-3 ring-slate-900 shadow-md sm:scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-xs sm:text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}
              <div className="hidden sm:block col-span-3" />

              {/* Row 6: Laayoune Sakia El Hamra */}
              {MOROCCO_12_REGIONS.slice(11, 12).map((region) => {
                const isActive = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`relative flex flex-col justify-between rounded-lg p-2 sm:p-2.5 transition duration-200 text-right cursor-pointer min-h-[64px] sm:min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-2 sm:ring-3 ring-slate-900 shadow-md sm:scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-xs sm:text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}
              <div className="hidden sm:block col-span-3" />

              {/* Row 7: Dakhla Oued Ed-Dahab */}
              {MOROCCO_12_REGIONS.slice(12, 13).map((region) => {
                const isActive = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`relative flex flex-col justify-between rounded-lg p-2 sm:p-2.5 transition duration-200 text-right cursor-pointer min-h-[64px] sm:min-h-[92px] ${
                      region.bgColor
                    } ${region.hoverBgColor} ${
                      isActive ? "ring-2 sm:ring-3 ring-slate-900 shadow-md sm:scale-[1.02] z-10" : "shadow-xs hover:opacity-95"
                    }`}
                  >
                    <span className="text-xs sm:text-[13px] font-black leading-snug line-clamp-2">
                      {region.name}
                    </span>
                    <span className="text-[10px] opacity-90 font-bold block mt-auto tabular-nums">
                      {region.provincesCountText}
                    </span>
                  </button>
                );
              })}
              <div className="hidden sm:block col-span-3" />
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

      {show("Latest News") ? (
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px] items-start font-sans" dir="rtl">
          {/* Main Column: Timeline feed "آخر الأخبار" */}
          <div className="flex flex-col">
            {/* Header: "آخر الأخبار" with "بحسب وقت النشر" and "عرض الكل" */}
            <div className="mb-6 flex items-baseline justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-baseline gap-4">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif">
                  آخر الأخبار
                </h2>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  بحسب وقت النشر
                </span>
              </div>
              <Link
                href="/category/national"
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-red-700 transition"
              >
                عرض الكل
              </Link>
            </div>

            {/* Vertical Timeline Feed */}
            <div className="relative border-r border-slate-200/90 pr-4 sm:pr-8 space-y-6 sm:space-y-8 mr-1.5 sm:mr-24">
              {[
                {
                  id: "1",
                  time: "19:55",
                  date: "8 نونبر",
                  category: "وطنية",
                  tagColor: "bg-[#1e293b]",
                  dotColor: "bg-[#1e293b]",
                  title: "لندن.. الجالية المغربية تحتفي بعيد الوحدة والذكرى الـ 51 للمسيرة الخضراء",
                  excerpt: "التأم أفراد من الجالية المغربية المقيمة بالمملكة المتحدة، أمس السبت بلندن، للاحتفال بعيد الوحدة وتخليد الذكرى الحادية والخمسين للمسيرة الخضراء.",
                  slug: "لندن-الجالية-المغربية-تحتفي-بعيد-الوحدة-والذكرى-الـ-51-للمسيرة-الخضراء",
                },
                {
                  id: "2",
                  time: "19:35",
                  date: "7 نونبر",
                  category: "العيون",
                  tagColor: "bg-[#c2410c]",
                  dotColor: "bg-[#c2410c]",
                  title: "العيون.. المسيرة الخضراء ملحمة تاريخية كرست تشبث المغاربة بوحدتهم الترابية",
                  excerpt: "أكد المندوب السامي لقدماء المقاومين وأعضاء جيش التحرير، مصطفى الكثيري، اليوم السبت بالعيون، أن المسيرة الخضراء تشكل ملحمة تاريخية كبرى.",
                  slug: "العيون-المسيرة-الخضراء-ملحمة-تاريخية-كرست-تشبث-المغاربة-بوحدتهم-الترابية",
                },
                {
                  id: "3",
                  time: "19:05",
                  date: "5 نونبر",
                  category: "رياضة",
                  tagColor: "bg-[#eab308]",
                  dotColor: "bg-[#eab308]",
                  title: "الجيش الملكي يحقق انتصارا كبيرا في دوري أبطال إفريقيا للسيدات لكرة القدم",
                  excerpt: "اكتسح فريق الجيش الملكي نظيره «USFAS» باماكو المالي، بنتيجة ستة أهداف دون مقابل، في المباراة التي جمعتهما مساء الخميس.",
                  slug: "الجيش-الملكي-يحقق-انتصارا-كبيرا-في-دوري-ا-بطال-ا-فريقيا-للسيدات-لكرة-القدم",
                },
                {
                  id: "4",
                  time: "17:58",
                  date: "3 غشت",
                  category: "الرباط سلا القنيطرة",
                  tagColor: "bg-[#be185d]",
                  dotColor: "bg-[#be185d]",
                  title: "عيد الشباب القنيطرة 2026",
                  excerpt: "حفل الاستماع إلى الخطاب الملكي بمناسبة عيد العرش المجيد، بحضور عامل إقليم القنيطرة.",
                  slug: "عيد-الشباب-القنيطرة-2026",
                },
              ].map((item) => (
                <article key={item.id} className="relative group">
                  {/* Timeline Dot positioned cleanly on the border line */}
                  <span
                    className={`absolute -right-[21.5px] sm:-right-[38.5px] top-1.5 size-2.5 sm:size-3 rounded-full ${item.dotColor} ring-4 ring-white shadow-xs`}
                  />

                  {/* Desktop Date & Time Column on the right of the line */}
                  <div className="hidden sm:block absolute -right-28 top-0 text-left w-16 select-none" dir="ltr">
                    <span className="block text-xs font-black text-slate-900 tabular-nums">
                      {item.time}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium">
                      {item.date}
                    </span>
                  </div>

                  {/* Content Box */}
                  <div className="pr-1 sm:pr-2">
                    {/* Category tag + Mobile inline timestamp */}
                    <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block size-2 rounded-xs ${item.tagColor}`} />
                        <span>{item.category}</span>
                      </div>
                      <span className="sm:hidden text-[11px] font-semibold text-slate-400 tabular-nums" dir="ltr">
                        {item.time} · {item.date}
                      </span>
                    </div>

                    {/* Headline */}
                    <Link
                      href={`/article/${encodeURIComponent(item.slug)}`}
                      className="block group"
                    >
                      <h3 className="text-base sm:text-lg font-black leading-snug text-slate-950 font-serif transition group-hover:text-red-700">
                        {item.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Aside Column: "الأكثر قراءة" Card matching screenshot */}
          <aside className="self-start">
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="text-lg font-black text-slate-950 font-serif border-b border-slate-100 pb-3">
                الأكثر قراءة
              </h3>
              <ol className="divide-y divide-slate-100">
                {[
                  {
                    rank: 1,
                    title: "لندن.. الجالية المغربية تحتفي بعيد الوحدة والذكرى الـ 51 للمسيرة الخضراء",
                    slug: "لندن-الجالية-المغربية-تحتفي-بعيد-الوحدة-والذكرى-الـ-51-للمسيرة-الخضراء",
                  },
                  {
                    rank: 2,
                    title: "العيون.. المسيرة الخضراء ملحمة تاريخية كرست تشبث المغاربة بوحدتهم الترابية",
                    slug: "العيون-المسيرة-الخضراء-ملحمة-تاريخية-كرست-تشبث-المغاربة-بوحدتهم-الترابية",
                  },
                  {
                    rank: 3,
                    title: "الذكرى 51 للمسيرة الخضراء المظفرة.. ملحمة وطنية متجددة",
                    slug: "الذكرى-51-للمسيرة-الخضراء-المظفرة-ملحمة-وطنية-متجددة-ومكاسب-دبلوماسية-راسخة",
                  },
                  {
                    rank: 4,
                    title: "الجيش الملكي يحقق انتصارا كبيرا في دوري أبطال إفريقيا للسيدات",
                    slug: "الجيش-الملكي-يحقق-انتصارا-كبيرا-في-دوري-ا-بطال-ا-فريقيا-للسيدات-لكرة-القدم",
                  },
                ].map((item) => (
                  <li key={item.rank} className="py-3.5 first:pt-3 last:pb-1">
                    <Link
                      href={`/article/${encodeURIComponent(item.slug)}`}
                      className="group flex items-start justify-between gap-3 text-right"
                    >
                      <span className="flex-1 text-xs sm:text-[13px] font-bold text-slate-800 leading-snug group-hover:text-red-700 transition">
                        {item.title}
                      </span>
                      <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums shrink-0 leading-none pt-0.5">
                        {item.rank}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </section>
      ) : null}

      {show("Regional News") ? (
        <section id="morocco-regions" className="mx-auto w-full max-w-screen-2xl scroll-mt-36 font-sans" dir="rtl">
          {/* Header matching site style */}
          <div className="mb-6 flex items-baseline justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-baseline gap-4">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif">
                أخبار الجهات والوطن
              </h2>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                أحدث التغطيات والمستجدات من مختلف جهات وأقاليم المملكة
              </span>
            </div>
            <Link
              href="/category/regions"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-red-700 transition"
            >
              عرض الكل
            </Link>
          </div>

          {/* Cards Grid: 3 columns with dark text overlays matching Screenshot 2026-11-11 17.13.16 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                id: "card-1",
                title: "لندن.. الجالية المغربية تحتفي بعيد الوحدة والذكرى الـ 51 للمسيرة الخضراء",
                category: "مغاربة العالم",
                region: "الجهة 13",
                slug: "لندن-الجالية-المغربية-تحتفي-بعيد-الوحدة-والذكرى-الـ-51-للمسيرة-الخضراء",
                image: "https://zqzwevynueggpyieabzi.supabase.co/storage/v1/object/public/media/articles/2026-11-08/ce331728-42ed-4814-aad1-67fe13788e74.jpg",
                tagColor: "bg-[#1e293b]",
              },
              {
                id: "card-2",
                title: "العيون.. المسيرة الخضراء ملحمة تاريخية كرست تشبث المغاربة بوحدتهم الترابية",
                category: "وطنية",
                region: "العيون الساقية الحمراء",
                slug: "العيون-المسيرة-الخضراء-ملحمة-تاريخية-كرست-تشبث-المغاربة-بوحدتهم-الترابية",
                image: "https://zqzwevynueggpyieabzi.supabase.co/storage/v1/object/public/media/articles/2026-11-07/7c179e7b-5039-478f-9b5f-664b41d9bc7a.jpg",
                tagColor: "bg-[#c2410c]",
              },
              {
                id: "card-3",
                title: "الجيش الملكي يحقق انتصارا كبيرا في دوري أبطال إفريقيا للسيدات لكرة القدم",
                category: "رياضة",
                region: "الرباط سلا القنيطرة",
                slug: "الجيش-الملكي-يحقق-انتصارا-كبيرا-في-دوري-ا-بطال-ا-فريقيا-للسيدات-لكرة-القدم",
                image: "https://zqzwevynueggpyieabzi.supabase.co/storage/v1/object/public/media/articles/2026-11-05/853e2141-79aa-4858-865a-f2a90d3a60cb.jpg",
                tagColor: "bg-[#be185d]",
              },
              {
                id: "card-4",
                title: "الداخلة.. وتيرة متسارعة لأشغال ميناء الداخلة الأطلسي الاستراتيجي",
                category: "جهات",
                region: "الداخلة وادي الذهب",
                slug: "جدول-مباريات-كا-س-ا-مم-ا-فريقيا-المغرب-2025",
                image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
                tagColor: "bg-[#25b5a8]",
              },
              {
                id: "card-5",
                title: "طنجة.. افتتاح معرض الاقتصاد الأزرق المتوسطي بمشاركة دولية وازنة",
                category: "جهات",
                region: "طنجة تطوان الحسيمة",
                slug: "عيد-الشباب-القنيطرة-2026",
                image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
                tagColor: "bg-[#5b9bd5]",
              },
              {
                id: "card-6",
                title: "مراكش.. انتعاش سياحي استثنائي مع بداية موسم المؤتمرات الدولية",
                category: "اقتصاد",
                region: "مراكش آسفي",
                slug: "توجيهات-سامية-لجلالة-الملك-محمد-السادس-في-مجلس-وزاري-بالقصر-الملكي-العامر-بالعصمة-بالعاصمة-الرباط-قراءة-تحليلية-لمشروع-قانون-المالية-2026",
                image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
                tagColor: "bg-[#cf4d75]",
              },
            ].map((article) => (
              <Link
                key={article.id}
                href={`/article/${encodeURIComponent(article.slug)}`}
                className="group relative block aspect-[16/10] sm:aspect-[16/11] overflow-hidden rounded-xl bg-slate-900 shadow-sm transition hover:shadow-md"
              >
                {/* Background Image with zoom effect */}
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(min-width: 1024px) 440px, 100vw"
                  className="object-cover brightness-90 transition duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Top Badge: Region or Category */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-sm bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-white">
                  <span className={`inline-block size-1.5 rounded-full ${article.tagColor}`} />
                  <span>{article.region}</span>
                </div>

                {/* Bottom Dark Gradient and Text Overlay with Black Box Banner matching Screenshot */}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/95 via-black/85 to-transparent pt-10 pb-3 px-3.5 sm:px-4 text-right">
                  <h3 className="text-sm sm:text-[15px] font-bold leading-snug text-white transition group-hover:text-red-300 line-clamp-2">
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Section: اقتصاد */}
      <section className="font-sans pt-4" dir="rtl">
        {/* Header: "اقتصاد" with subtitle and "عرض الكل" */}
        <div className="mb-6 flex items-baseline justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif">
              اقتصاد
            </h2>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              الأسواق والاستثمار والتشغيل والفلاحة والمالية العمومية
            </span>
          </div>
          <Link
            href="/category/economy"
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-red-700 transition"
          >
            عرض الكل
          </Link>
        </div>

        {/* 2-Column Economy Layout with Real Category Articles & Real Photos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Right Column: Hero Economy Article */}
          {heroEconomyArticle ? (
            <Link
              href={`/article/${encodeURIComponent(heroEconomyArticle.slug)}`}
              className="group block"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-md ring-1 ring-slate-200/80">
                <Image
                  src={imageFor(heroEconomyArticle, 0)}
                  alt={heroEconomyArticle.title}
                  fill
                  sizes="(min-width: 1024px) 660px, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 transition group-hover:opacity-40" />
              </div>

              <div className="mt-4 text-right">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669]">
                  <span className="inline-block size-2 rounded-xs bg-[#059669]" />
                  <span>{articleCategorySlug(state, heroEconomyArticle) || "اقتصاد"}</span>
                </div>

                <h3 className="mt-2 text-xl sm:text-2xl font-black leading-snug text-slate-950 font-serif transition group-hover:text-red-700">
                  {heroEconomyArticle.title}
                </h3>

                {heroEconomyArticle.excerpt ? (
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal line-clamp-3">
                    {heroEconomyArticle.excerpt}
                  </p>
                ) : null}

                <div className="mt-3 text-xs font-semibold text-slate-400 tabular-nums">
                  {heroEconomyArticle.author ? `بقلم ${heroEconomyArticle.author} · ` : ""}
                  {formatArabicLatinDate(heroEconomyArticle.publishDate || heroEconomyArticle.publishedAt)}
                </div>
              </div>
            </Link>
          ) : null}

          {/* Left Column: 3 Real Articles with Real Thumbnails */}
          <div className="divide-y divide-slate-100 flex flex-col">
            {sideEconomyArticles.map((item, idx) => {
              const dotColors = ["bg-[#e5aa32]", "bg-[#059669]", "bg-[#337a97]"];
              const catLabel = articleCategorySlug(state, item) || "اقتصاد";
              const dateLabel = formatArabicLatinDate(item.publishDate || item.publishedAt);
              return (
                <Link
                  key={item.id || item.slug}
                  href={`/article/${encodeURIComponent(item.slug)}`}
                  className="group flex items-start gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <div className="flex-1 text-right min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                      <span className={`inline-block size-2 rounded-xs ${dotColors[idx % dotColors.length]}`} />
                      <span>{catLabel}</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black leading-snug text-slate-900 font-serif transition group-hover:text-red-700 line-clamp-2">
                      {item.title}
                    </h4>
                    {item.excerpt ? (
                      <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {item.excerpt}
                      </p>
                    ) : null}
                    <span className="mt-2 block text-xs text-slate-400 font-medium tabular-nums">
                      {dateLabel}
                    </span>
                  </div>

                  <div className="relative h-20 w-28 sm:h-24 sm:w-32 rounded-xl bg-slate-100 shrink-0 overflow-hidden shadow-xs ring-1 ring-slate-200/80">
                    <Image
                      src={imageFor(item, idx + 1)}
                      alt={item.title}
                      fill
                      sizes="(min-width: 640px) 128px, 112px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section: آراء وقراءات */}
      <section className="font-sans pt-4" dir="rtl">
        <div className="mb-6 flex items-baseline justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif">
              آراء وقراءات
            </h2>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              أوراق تحليلية ونقاش مدني
            </span>
          </div>
          <Link
            href="/category/opinion"
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-red-700 transition"
          >
            عرض الكل
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          {opinionDisplayArticles.map((item, idx) => {
            const badgeColors = ["bg-[#0f172a]", "bg-[#1b5e73]", "bg-[#d9a01c]"];
            const defaultAuthorNames = ["هيئة التحرير", "قلم الرأي", "متابعة وتحليل"];
            const authorName =
              item.author && item.author !== "Afakpress"
                ? item.author
                : defaultAuthorNames[idx % defaultAuthorNames.length];
            const roleLabel = articleCategorySlug(state, item) || (idx === 1 ? "افتتاحية" : idx === 2 ? "مجتمع" : "تحليل");
            const count = commentCounts[item.id] ?? 0;
            const latestComment = recentCommentsByArticle[item.id]?.[0];
            const isOpen = openCommentArticleId === item.id;

            return (
              <div
                key={item.id || item.slug}
                className="border-t border-slate-200/90 pt-5 flex flex-col text-right"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${
                      badgeColors[idx % badgeColors.length]
                    }`}
                  >
                    {authorName.trim().slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{authorName}</p>
                    <p className="text-[11px] font-medium text-slate-500 truncate">{roleLabel}</p>
                  </div>
                </div>

                <Link
                  href={`/article/${encodeURIComponent(item.slug)}`}
                  className="group block mt-4"
                >
                  <h3 className="text-base sm:text-lg font-black leading-snug text-slate-950 font-serif transition group-hover:text-red-700 line-clamp-3">
                    {item.title}
                  </h3>
                  {item.excerpt ? (
                    <p className="mt-2.5 text-xs sm:text-[13px] leading-relaxed text-slate-500 line-clamp-2">
                      {item.excerpt}
                    </p>
                  ) : null}
                </Link>

                {latestComment ? (
                  <p className="mt-3 border-r-2 border-slate-300 pr-2.5 text-[11px] leading-relaxed text-slate-600 line-clamp-2">
                    <span className="font-bold text-slate-800">{latestComment.author}: </span>
                    {latestComment.content}
                  </p>
                ) : null}

                <div className="mt-auto pt-3 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-500">
                  <button
                    type="button"
                    onClick={() => setOpenCommentArticleId(isOpen ? null : item.id)}
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-red-700 transition cursor-pointer"
                  >
                    <MessageSquare className="size-3.5" aria-hidden="true" />
                    <span className="tabular-nums">
                      {isOpen ? "إغلاق التعليقات" : `تعليقات القراء (${count})`}
                    </span>
                  </button>
                  <Link
                    href={`/article/${encodeURIComponent(item.slug)}#comments`}
                    className="text-slate-400 hover:text-red-700 transition"
                  >
                    شارك برأيك
                  </Link>
                </div>

                {isOpen ? (
                  <ArticleComments
                    articleId={item.id}
                    articleTitle={item.title}
                    compact
                    onCountChange={(nextCount) => handleOpinionCommentCount(item.id, nextCount)}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section: الجهة الثالثة عشرة (مغاربة العالم - 13emeregion.vercel.app) */}
      <section className="font-sans pt-4" dir="rtl">
        <div className="mb-6 flex items-baseline justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif">
              الجهة الثالثة عشرة
            </h2>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              مغاربة العالم
            </span>
          </div>
          <Link
            href="/13eme-region"
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-red-700 transition"
          >
            عرض الكل
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start pt-2">
          {/* Right Column: Dashed 13 Card + Title + Description */}
          <div className="lg:col-span-4 text-right">
            <Link
              href="/13eme-region"
              className="group block rounded-xl border-2 border-dashed border-slate-800 bg-transparent p-6 min-h-[210px] flex flex-col justify-between transition hover:bg-white/70"
            >
              <span className="block text-6xl sm:text-7xl font-black tracking-tight text-slate-900 leading-none tabular-nums">
                13
              </span>
              <span className="block text-xs sm:text-sm font-bold leading-snug text-slate-800 mt-10">
                خارج الخريطة،
                <br />
                داخل الوطن
              </span>
            </Link>

            <h3 className="mt-5 text-xl sm:text-2xl font-black leading-snug text-slate-950 font-serif">
              أخبار الجالية من لندن إلى واشنطن
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
              أخبار المغاربة المقيمين بالخارج: احتفالات وطنية، ريادة أعمال، وعلاقة الجالية بالمؤسسات.
            </p>
          </div>

          {/* Left Column: 2x2 Grid of Live Articles from 13emeregion.vercel.app */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7 lg:pt-8">
            {thirteenthRegionArticles.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                href={`/13eme-region/${encodeURIComponent(item.id)}`}
                className="group block border-t border-slate-200/90 pt-4 text-right"
              >
                <span className="block text-xs font-medium text-slate-500">
                  --- {item.countryName}
                </span>
                <h4 className="mt-2 text-base sm:text-[17px] font-black leading-snug text-slate-950 font-serif transition group-hover:text-red-700 line-clamp-2">
                  {item.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
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
        <Image src={imageFor(article)} alt="" fill priority sizes="(min-width: 1024px) 896px, 100vw" className="object-cover" referrerPolicy="no-referrer" />
      </div>
      <div className="article-content mt-8 text-lg text-slate-700" dir="auto" dangerouslySetInnerHTML={{ __html: content }} />
      <ArticleComments articleId={article.id} articleTitle={article.title} />
    </article>
  );
}

export function CmsCategoryPage({ slug }: { slug: string }) {
  const { state } = useCms();
  const category = state.categories.find((item) => item.slug === slug);
  const directMatches = publishedArticles(state).filter((article) => articleCategorySlug(state, article) === slug);
  const categoryArticles =
    directMatches.length > 0
      ? directMatches
      : slug === "opinion"
        ? publishedArticles(state).filter((article) =>
            /قراءة تحليلية|المقاربة الدبلوماسية|كواد|مفترق الطرق|الضرائب|وعود الحكومة/.test(article.title),
          )
        : [];

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
