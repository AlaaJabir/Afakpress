"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { CmsBreakingNews, CmsArticle } from "@/lib/cms";

export type ArabicNewsItem = {
  id: string;
  title: string;
  url?: string;
  slug?: string;
};

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

const REGION_STRIPE_COLORS = [
  "#4c9cd9",
  "#eb8523",
  "#157f59",
  "#991b35",
  "#657830",
  "#337a97",
  "#cf4d75",
  "#8d5f0d",
  "#e5aa32",
  "#3b499f",
  "#c2410c",
  "#25b5a8",
];

function getDisplayTitle(article: CmsArticle): string {
  if (SEED_ARTICLE_ARABIC_TITLES[article.slug]) {
    return SEED_ARTICLE_ARABIC_TITLES[article.slug];
  }
  return article.title;
}

interface ArabicBreakingNewsTickerProps {
  breakingNews?: CmsBreakingNews[];
  articles?: CmsArticle[];
}

export function ArabicBreakingNewsTicker({ breakingNews = [], articles = [] }: ArabicBreakingNewsTickerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const newsItems: ArabicNewsItem[] = [];

  const activeBreaking = breakingNews
    .filter((item) => item.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  for (const item of activeBreaking) {
    const matched = item.articleId ? articles.find((art) => art.id === item.articleId) : null;
    newsItems.push({
      id: `cms-breaking-${item.id}`,
      title: item.title,
      slug: matched?.slug,
      url: item.url || (matched ? `/article/${encodeURIComponent(matched.slug)}` : undefined),
    });
  }

  const publishedBreaking = articles
    .filter((art) => art.status === "Published" && art.breaking && !newsItems.some((n) => n.slug === art.slug))
    .sort((a, b) => (b.publishedAt || b.publishDate || "").localeCompare(a.publishedAt || a.publishDate || ""));

  for (const art of publishedBreaking) {
    newsItems.push({
      id: `article-breaking-${art.id}`,
      title: getDisplayTitle(art),
      slug: art.slug,
      url: `/article/${encodeURIComponent(art.slug)}`,
    });
  }

  const publishedArticles = articles
    .filter(
      (art) =>
        art.status === "Published" &&
        art.title &&
        art.title.trim() !== "test" &&
        art.title.trim().length > 3 &&
        !newsItems.some((n) => n.slug === art.slug)
    )
    .sort((a, b) => (b.publishedAt || b.publishDate || "").localeCompare(a.publishedAt || a.publishDate || ""));

  for (const art of publishedArticles) {
    newsItems.push({
      id: `article-${art.id}`,
      title: getDisplayTitle(art),
      slug: art.slug,
      url: `/article/${encodeURIComponent(art.slug)}`,
    });
  }

  const finalItems: ArabicNewsItem[] =
    newsItems.length > 0
      ? newsItems
      : [
          {
            id: "site-welcome",
            title: "منصة آفاق بريس الإخبارية - متابعة مستمرة لأحدث المستجدات الوطنية والجهوية في المغرب",
            url: "/",
          },
        ];

  const displayedItems = [...finalItems, ...finalItems, ...finalItems, ...finalItems];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let lastTimestamp = performance.now();

    const scrollStep = (timestamp: number) => {
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!isHovered && container) {
        container.scrollLeft -= delta * 0.055;

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
  }, [isHovered]);

  return (
    <div
      dir="rtl"
      className="relative z-40 w-full bg-[#0b1930] text-white select-none font-sans"
      aria-label="شريط الأنباء العاجلة"
    >
      {/* Top 12-region color stripe */}
      <div className="grid h-[5px] w-full grid-cols-12">
        {REGION_STRIPE_COLORS.map((color) => (
          <span key={color} style={{ backgroundColor: color }} />
        ))}
      </div>

      {/* Main Breaking News Bar */}
      <div className="mx-auto flex h-11 w-full max-w-[1400px] items-stretch overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Right Solid Red Badge: "عاجل" */}
        <div className="flex shrink-0 items-center justify-center bg-[#cc2828] px-5 sm:px-6 text-white">
          <span className="text-sm sm:text-[15px] font-black tracking-wide whitespace-nowrap">
            عاجل
          </span>
        </div>

        {/* Scrolling Headlines Stream */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="no-scrollbar flex flex-1 items-center overflow-x-hidden whitespace-nowrap pr-5 pl-2 cursor-pointer"
        >
          <div className="flex items-center gap-6">
            {displayedItems.map((item, index) => {
              const itemKey = `${item.id}-${index}`;
              const href = item.url || (item.slug ? `/article/${encodeURIComponent(item.slug)}` : null);

              return (
                <div key={itemKey} className="inline-flex items-center gap-5 text-sm sm:text-[15px]">
                  <span
                    aria-hidden="true"
                    className="inline-block size-2 rotate-45 bg-[#d99b1e] shrink-0"
                  />
                  {href ? (
                    <Link
                      href={href}
                      className="font-semibold text-white transition-colors hover:text-[#facc15] whitespace-nowrap"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <span className="font-semibold text-white whitespace-nowrap">
                      {item.title}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
