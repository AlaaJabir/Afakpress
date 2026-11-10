"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Clock, Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { CmsBreakingNews, CmsArticle } from "@/lib/cms";

export type ArabicNewsItem = {
  id: string;
  tag: string;
  title: string;
  date: string;
  url?: string;
  slug?: string;
};

// Known Arabic titles for default site articles if they are in English
const SEED_ARTICLE_ARABIC_TITLES: Record<string, string> = {
  "morocco-regional-investment-local-project-desks":
    "المغرب يسرع خطط الاستثمار الجهوي مع إطلاق مكاتب جديدة لدعم المشاريع المحلية",
  "tanger-port-corridor-logistics-summer-peak":
    "رواق ميناء طنجة المتوسط يشهد حركة لوجستية مكثفة استعداداً لذروة الطلب الصيفي",
  "rabat-civic-services-dashboard-commune-follow-up":
    "الرباط تطلق منصة رقمية تفاعلية لتتبع الخدمات الجماعية وشكايات المواطنين",
  "agadir-tourism-coastal-mountain-offers":
    "مهنيو السياحة بأكادير يطلقون باقات متكاملة تربط الشريط الساحلي بالمسارات الجبلية",
  "commune-data-morocco-public-service-priority":
    "أهمية إتاحة البيانات المحلية والشفافية كأولوية وطنية لتطوير الحكامة الترابية",
  "dakhla-renewables-supplier-interest-southern-provinces":
    "مشاريع الطاقات المتجددة بالداخلة تستقطب اهتمام مقاولات الخدمات وسلاسل الإمداد",
};

const TAG_TRANSLATIONS: Record<string, string> = {
  national: "وطني",
  regions: "الجهات",
  economy: "اقتصاد",
  culture: "ثقافة",
  opinion: "رأي",
  politics: "سياسة",
  society: "مجتمع",
  sport: "رياضة",
  technology: "تكنولوجيا",
  casablanca: "الدار البيضاء",
  "casablanca-settat": "الدار البيضاء - سطات",
  maarif: "المعاريف",
  tanger: "طنجة",
  "tanger-assilah": "طنجة - أصيلة",
  "tanger-tetouan-al-hoceima": "طنجة - تطوان",
  rabat: "الرباط",
  "rabat-sale-kenitra": "الرباط - سلا",
  agadir: "أكادير",
  "agadir-ida-outanane": "أكادير إداوتنان",
  "souss-massa": "سوس - ماسة",
  fes: "فاس",
  "fes-meknes": "فاس - مكناس",
  dakhla: "الداخلة",
  "oued-ed-dahab": "وادي الذهب",
  "dakhla-oued-ed-dahab": "الداخلة - وادي الذهب",
  marrakech: "مراكش",
  "marrakech-safi": "مراكش - آسفي",
};

function formatTagLabel(label?: string): string {
  if (!label) return "أخبار";
  const normalized = label.trim().toLowerCase();
  if (TAG_TRANSLATIONS[normalized]) {
    return TAG_TRANSLATIONS[normalized];
  }
  // If already in Arabic or custom string
  return label.replace(/^جهة\s+/, "").replace(/^عمالة\s+/, "").trim() || "أخبار";
}

function getArticleTag(article: CmsArticle): string {
  if (article.breaking) {
    return "عاجل";
  }
  if (article.commune && article.commune !== "None") {
    return formatTagLabel(article.commune);
  }
  if (article.province && article.province !== "None") {
    return formatTagLabel(article.province);
  }
  if (article.region && article.region !== "None") {
    return formatTagLabel(article.region);
  }
  if (article.category) {
    return formatTagLabel(article.category);
  }
  return "أخبار";
}

function getDisplayTitle(article: CmsArticle): string {
  // If the article has an Arabic title or custom title
  if (SEED_ARTICLE_ARABIC_TITLES[article.slug]) {
    return SEED_ARTICLE_ARABIC_TITLES[article.slug];
  }
  return article.title;
}

function formatArabicDate(dateString?: string): string {
  if (!dateString) {
    return new Intl.DateTimeFormat("ar-MA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) {
      return dateString;
    }
    return new Intl.DateTimeFormat("ar-MA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

interface ArabicBreakingNewsTickerProps {
  breakingNews?: CmsBreakingNews[];
  articles?: CmsArticle[];
}

export function ArabicBreakingNewsTicker({ breakingNews = [], articles = [] }: ArabicBreakingNewsTickerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 1. Build dynamic ticker items exclusively from site articles & CMS breaking news
  const newsItems: ArabicNewsItem[] = [];

  // A. CMS Breaking news configured in Admin
  const activeBreaking = breakingNews
    .filter((item) => item.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  for (const item of activeBreaking) {
    const matched = item.articleId ? articles.find((art) => art.id === item.articleId) : null;
    newsItems.push({
      id: `cms-breaking-${item.id}`,
      tag: matched ? (matched.breaking ? "عاجل" : getArticleTag(matched)) : "عاجل",
      title: item.title,
      date: matched ? formatArabicDate(matched.publishedAt || matched.publishDate) : formatArabicDate(),
      slug: matched?.slug,
      url: item.url || (matched ? `/article/${encodeURIComponent(matched.slug)}` : undefined),
    });
  }

  // B. Published articles marked breaking in the site
  const publishedBreaking = articles
    .filter((art) => art.status === "Published" && art.breaking && !newsItems.some((n) => n.slug === art.slug))
    .sort((a, b) => (b.publishedAt || b.publishDate || "").localeCompare(a.publishedAt || a.publishDate || ""));

  for (const art of publishedBreaking) {
    newsItems.push({
      id: `article-breaking-${art.id}`,
      tag: "عاجل",
      title: getDisplayTitle(art),
      date: formatArabicDate(art.publishedAt || art.publishDate),
      slug: art.slug,
      url: `/article/${encodeURIComponent(art.slug)}`,
    });
  }

  // C. All published articles from the site
  const publishedArticles = articles
    .filter((art) => art.status === "Published" && !newsItems.some((n) => n.slug === art.slug))
    .sort((a, b) => (b.publishedAt || b.publishDate || "").localeCompare(a.publishedAt || a.publishDate || ""));

  for (const art of publishedArticles) {
    newsItems.push({
      id: `article-${art.id}`,
      tag: getArticleTag(art),
      title: getDisplayTitle(art),
      date: formatArabicDate(art.publishedAt || art.publishDate),
      slug: art.slug,
      url: `/article/${encodeURIComponent(art.slug)}`,
    });
  }

  // Fallback if no articles exist yet
  const finalItems: ArabicNewsItem[] =
    newsItems.length > 0
      ? newsItems
      : [
          {
            id: "site-welcome",
            tag: "آفاق بريس",
            title: "منصة آفاق بريس الإخبارية - متابعة مستمرة لأحدث المستجدات الوطنية والجهوية في المغرب",
            date: formatArabicDate(),
            url: "/",
          },
        ];

  // Quadruple items to ensure smooth continuous marquee loop
  const displayedItems = [...finalItems, ...finalItems, ...finalItems, ...finalItems];

  // Auto-scroll loop
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let lastTimestamp = performance.now();

    const scrollStep = (timestamp: number) => {
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (isPlaying && !isHovered && container) {
        container.scrollLeft -= delta * 0.055; // Smooth 55px per second in RTL

        const maxScroll = container.scrollWidth / 2;
        if (Math.abs(container.scrollLeft) >= maxScroll) {
          container.scrollLeft = 0;
        }
      }

      animationFrameRef.current = requestAnimationFrame(scrollStep);
    };

    animationFrameRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isHovered]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const scrollPrev = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  }, []);

  const scrollNext = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  }, []);

  return (
    <div
      dir="rtl"
      className="relative z-40 w-full border-b border-red-950/40 bg-[#0b0e17] text-white shadow-md select-none font-sans"
      aria-label="شريط الأنباء العاجلة"
    >
      <div className="mx-auto flex h-11 sm:h-12 w-full max-w-[1600px] items-stretch justify-between overflow-hidden">
        {/* Right Badge: "شريط الأنباء العاجلة" */}
        <div className="relative z-20 flex shrink-0 items-center gap-2 bg-[#b91c1c] px-3 sm:px-5 text-white shadow-xl">
          <span className="text-xs sm:text-sm font-black tracking-wide whitespace-nowrap">
            شريط الأنباء العاجلة
          </span>
          <span className="text-sm">🔥</span>
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          {/* Subtle triangle point divider */}
          <div className="absolute -left-2 top-0 bottom-0 w-0 border-y-[22px] sm:border-y-[24px] border-y-transparent border-r-[8px] border-r-[#b91c1c] pointer-events-none" />
        </div>

        {/* Center: Scrolling News Feed with dynamic articles */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="no-scrollbar flex flex-1 items-center overflow-x-hidden whitespace-nowrap px-4 cursor-pointer"
        >
          <div className="flex items-center gap-6">
            {displayedItems.map((item, index) => {
              const itemKey = `${item.id}-${index}`;
              const href = item.url || (item.slug ? `/article/${encodeURIComponent(item.slug)}` : null);

              return (
                <div key={itemKey} className="inline-flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
                  {/* Separator slashes */}
                  <span className="font-mono text-slate-500 font-bold tracking-widest text-[11px] sm:text-xs select-none">
                    {"///"}
                  </span>

                  {/* Date with Clock */}
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-slate-300 whitespace-nowrap font-medium">
                    <Clock className="size-3 text-slate-400" />
                    <span>{item.date}</span>
                  </span>

                  {/* Dynamic Category/Region/Tag */}
                  <span className="inline-flex items-center rounded bg-red-950/80 border border-red-700/80 px-2 py-0.5 text-[11px] sm:text-xs font-bold text-amber-300 shadow-sm whitespace-nowrap">
                    {item.tag}
                  </span>

                  {/* Article Title */}
                  {href ? (
                    <Link
                      href={href}
                      className="font-bold text-white transition-colors hover:text-red-300 hover:underline whitespace-nowrap"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <span className="font-bold text-slate-100 whitespace-nowrap">
                      {item.title}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Left: Player and Navigation Controls */}
        <div className="relative z-20 flex shrink-0 items-center gap-1 border-r border-white/10 bg-[#0b0e17] px-2 sm:px-3 text-slate-400">
          {/* Pause / Play button */}
          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            aria-label={isPlaying ? "Pause breaking news" : "Play breaking news"}
            className="flex h-7 w-7 items-center justify-center rounded transition hover:bg-slate-800 hover:text-white"
          >
            {isPlaying ? (
              <Pause className="size-3.5 fill-current" />
            ) : (
              <Play className="size-3.5 fill-current text-amber-400" />
            )}
          </button>

          <span className="text-slate-700 select-none">|</span>

          {/* Next button */}
          <button
            type="button"
            onClick={scrollNext}
            title="الخبر التالي"
            aria-label="Next breaking news"
            className="flex h-7 w-7 items-center justify-center rounded transition hover:bg-slate-800 hover:text-white"
          >
            <ChevronRight className="size-4" />
          </button>

          {/* Previous button */}
          <button
            type="button"
            onClick={scrollPrev}
            title="الخبر السابق"
            aria-label="Previous breaking news"
            className="flex h-7 w-7 items-center justify-center rounded transition hover:bg-slate-800 hover:text-white"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
