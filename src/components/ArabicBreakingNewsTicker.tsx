"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Flame, Clock, Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { CmsBreakingNews, CmsArticle } from "@/lib/cms";

export type ArabicNewsItem = {
  id: string;
  tag: string;
  title: string;
  date: string;
  url?: string;
  slug?: string;
};

const defaultArabicNews: ArabicNewsItem[] = [
  {
    id: "default-1",
    tag: "اليابان",
    title: "طوكيو وسيول تعززان التنسيق التقني لتطوير أشباه الموصلات وسلاسل توريد الذكاء الاصطناعي",
    date: "28 أغسطس 2026",
  },
  {
    id: "default-2",
    tag: "كينيا",
    title: "قمة نيروبي للمناخ تدعو إلى تمويلات عادلة ومشاريع مستدامة للطاقة المتجددة لدول الجنوب",
    date: "2 سبتمبر 2026",
  },
  {
    id: "default-3",
    tag: "المغرب",
    title: "المغرب يسجل مؤشرات إيجابية في نمو الاستثمارات الجهوية وصادرات الطاقات النظيفة والسيارات",
    date: "7 نوفمبر 2026",
  },
  {
    id: "default-4",
    tag: "اقتصاد",
    title: "افتتاح منصات جديدة لخدمة المستثمرين والمقاولات الناشئة بكبرى جهات المملكة لدعم التشغيل",
    date: "6 نوفمبر 2026",
  },
  {
    id: "default-5",
    tag: "طنجة",
    title: "ميناء طنجة المتوسط يسجل حركة استثنائية في تدفق الشاحنات الدولية وصادرات الصناعات الحديثة",
    date: "5 نوفمبر 2026",
  },
  {
    id: "default-6",
    tag: "الرباط",
    title: "مجلس جهة الرباط-سلا-القنيطرة يصادق على حزمة مشاريع تنموية للربط القروي والمساحات الخضراء",
    date: "4 نوفمبر 2026",
  },
];

interface ArabicBreakingNewsTickerProps {
  breakingNews?: CmsBreakingNews[];
  articles?: CmsArticle[];
}

export function ArabicBreakingNewsTicker({ breakingNews = [], articles = [] }: ArabicBreakingNewsTickerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Combine any active CMS breaking news with curated headlines
  const formattedToday = new Intl.DateTimeFormat("ar-MA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const cmsItems: ArabicNewsItem[] = breakingNews
    .filter((item) => item.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((item) => {
      const matchedArticle = item.articleId ? articles.find((art) => art.id === item.articleId) : null;
      return {
        id: `cms-${item.id}`,
        tag: "عاجل",
        title: item.title,
        date: formattedToday,
        slug: matchedArticle?.slug,
        url: item.url || (matchedArticle ? `/article/${encodeURIComponent(matchedArticle.slug)}` : undefined),
      };
    });

  const newsItems = cmsItems.length > 0 ? [...cmsItems, ...defaultArabicNews] : defaultArabicNews;

  // Quadruple items to ensure smooth seamless infinite scrolling
  const displayedItems = [...newsItems, ...newsItems, ...newsItems, ...newsItems];

  // Auto-scroll loop
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let lastTimestamp = performance.now();

    const scrollStep = (timestamp: number) => {
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (isPlaying && !isHovered && container) {
        // In RTL scrollLeft can be negative or positive depending on browser implementation
        container.scrollLeft -= delta * 0.055; // Smooth 55px per second

        // If scrolled past halfway, loop seamlessly back to start
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
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          <Flame className="size-4 shrink-0 fill-amber-300 text-amber-300" />
          <span className="text-xs sm:text-sm font-black tracking-wide whitespace-nowrap">
            شريط الأنباء العاجلة
          </span>
          {/* Subtle triangle point divider */}
          <div className="absolute -left-2 top-0 bottom-0 w-0 border-y-[22px] sm:border-y-[24px] border-y-transparent border-r-[8px] border-r-[#b91c1c] pointer-events-none" />
        </div>

        {/* Center: Scrolling News Feed */}
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

                  {/* Country/Category Tag */}
                  <span className="inline-flex items-center rounded bg-red-950/80 border border-red-700/80 px-2 py-0.5 text-[11px] sm:text-xs font-bold text-amber-300 shadow-sm whitespace-nowrap">
                    {item.tag}
                  </span>

                  {/* Headline Title */}
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

          {/* Next button (Right in RTL moves forward) */}
          <button
            type="button"
            onClick={scrollNext}
            title="الخبر التالي"
            aria-label="Next breaking news"
            className="flex h-7 w-7 items-center justify-center rounded transition hover:bg-slate-800 hover:text-white"
          >
            <ChevronRight className="size-4" />
          </button>

          {/* Previous button (Left in RTL moves backward) */}
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
