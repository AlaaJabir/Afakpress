"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CmsProvider, useCms } from "@/lib/cms-store";
import { getPublishedArticles } from "@/lib/cms";
import { MegaMenu } from "@/components/MegaMenu";
import { ArabicBreakingNewsTicker } from "@/components/ArabicBreakingNewsTicker";
import { AfakFooter } from "@/components/AfakFooter";
import type { CmsState } from "@/lib/cms";

import { FileText, Home, Search, Sun, X } from "lucide-react";

function HeaderSearch({
  articles,
  variant = "dark",
}: {
  articles: ReturnType<typeof getPublishedArticles>;
  variant?: "dark" | "light";
}) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const normalizedQuery = query.normalize("NFKD").trim().toLocaleLowerCase();
  const results = normalizedQuery
    ? articles
        .filter((article) => article.title.normalize("NFKD").toLocaleLowerCase().includes(normalizedQuery))
        .slice(0, 5)
    : [];

  const isLight = variant === "light";

  return (
    <div className="flex items-center gap-2">
      {/* 1. Digital Edition (PDF) */}
      <a
        href="#digital-edition"
        className={
          isLight
            ? "hidden xl:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-black text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            : "hidden xl:inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-bold text-slate-200 transition hover:border-red-400/50 hover:bg-red-600/20 hover:text-white"
        }
        title="تصفح النسخة الورقية بصيغة PDF"
      >
        <FileText className={`size-3 ${isLight ? "text-red-700" : "text-red-400"}`} />
        <span>النسخة الرقمية</span>
        <span
          className={`rounded px-1 py-0.2 text-[9px] font-bold ${
            isLight ? "bg-red-100 text-red-700" : "bg-red-600/80 text-white"
          }`}
        >
          PDF
        </span>
      </a>

      {/* 2. Weather in Rabat */}
      {!isLight ? (
        <div className="hidden lg:flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-bold text-slate-300">
          <Sun className="size-3 text-amber-400" />
          <span>الرباط 21°C</span>
        </div>
      ) : null}

      {/* 3. Desktop Search Input */}
      <form
        className="relative"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (results[0]) window.location.assign(`/article/${encodeURIComponent(results[0].slug)}`);
        }}
      >
        <label htmlFor={`header-search-${variant}`} className="sr-only">Rechercher dans Afakpress</label>
        <div
          className={
            isLight
              ? "group flex h-8 w-36 items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-slate-800 transition-all duration-200 focus-within:w-52 focus-within:border-red-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-100 xl:w-44"
              : "group flex h-7 w-36 items-center overflow-hidden rounded-full border border-white/15 bg-white/10 text-white transition-all duration-200 focus-within:w-52 focus-within:border-white focus-within:bg-white focus-within:text-slate-900 lg:w-44"
          }
        >
          <button
            type="submit"
            aria-label="بحث"
            className={
              isLight
                ? "flex size-8 shrink-0 items-center justify-center text-slate-500 transition hover:text-red-700"
                : "flex size-7 shrink-0 items-center justify-center text-slate-300 transition group-focus-within:text-red-700 hover:text-white"
            }
          >
            <Search className="size-3.5" />
          </button>
          <input
            id={`header-search-${variant}`}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => window.setTimeout(() => setIsFocused(false), 150)}
            placeholder="بحث..."
            autoComplete="off"
            className={
              isLight
                ? "h-full min-w-0 flex-1 bg-transparent pl-2.5 text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                : "h-full min-w-0 flex-1 bg-transparent pl-2.5 text-[11px] font-semibold text-white outline-none placeholder:text-slate-300 group-focus-within:text-slate-900 group-focus-within:placeholder:text-slate-400"
            }
          />
        </div>
        {isFocused && query.trim() ? (
          <div className="absolute left-0 top-[calc(100%+8px)] z-[2000] min-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-2xl">
            {results.length ? (
              <ul>
                {results.map((article) => (
                  <li key={article.id}>
                    <Link href={`/article/${encodeURIComponent(article.slug)}`} className="block rounded-xl px-3 py-2 text-xs font-bold leading-5 text-slate-800 transition hover:bg-red-50 hover:text-red-700" dir="auto">
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-3 text-center text-xs font-semibold text-slate-500">لا توجد نتائج</p>
            )}
          </div>
        ) : null}
      </form>
    </div>
  );
}

function MobileSearchDrawer({
  articles,
  onClose,
}: {
  articles: ReturnType<typeof getPublishedArticles>;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.normalize("NFKD").trim().toLocaleLowerCase();
  const results = normalizedQuery
    ? articles
        .filter((article) => article.title.normalize("NFKD").toLocaleLowerCase().includes(normalizedQuery))
        .slice(0, 6)
    : [];

  return (
    <div className="border-t border-slate-100 bg-white px-3.5 py-2.5 md:hidden" dir="rtl">
      <form
        className="flex items-center gap-2"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (results[0]) {
            onClose();
            window.location.assign(`/article/${encodeURIComponent(results[0].slug)}`);
          }
        }}
      >
        <div className="flex h-9 flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 focus-within:border-red-300 focus-within:bg-white">
          <Search className="size-4 shrink-0 text-slate-400" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث في أخبار آفاق بريس..."
            className="h-full w-full bg-transparent pr-2 text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق البحث"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
        >
          <X className="size-4" />
        </button>
      </form>

      {query.trim() ? (
        <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          {results.length ? (
            <ul className="divide-y divide-slate-100">
              {results.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/article/${encodeURIComponent(article.slug)}`}
                    onClick={onClose}
                    className="block px-2.5 py-2 text-xs font-bold leading-5 text-slate-800 hover:bg-red-50 hover:text-red-700"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500">لا توجد نتائج</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Chrome({ children }: { children: React.ReactNode }) {
  const { state } = useCms();
  const published = getPublishedArticles(state);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const today = new Intl.DateTimeFormat("fr-MA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const scrollableRoom = document.documentElement.scrollHeight - window.innerHeight;
      setIsScrolled((prev) => {
        if (!prev && y > 130 && scrollableRoom > 320) return true;
        if (prev && y < 35) return false;
        return prev;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`relative z-50 w-full bg-white/[0.98] transition-shadow duration-300 md:sticky md:top-0 ${
          isScrolled ? "lg:shadow-[0_10px_30px_-10px_rgba(15,23,42,0.14)]" : ""
        }`}
      >
        {/* Desktop-only top black strip (collapses smoothly on scroll on lg+) */}
        <div
          className={`hidden bg-slate-950 text-white transition-all duration-300 ease-out md:block ${
            isScrolled
              ? "border-b border-slate-800 lg:max-h-0 lg:overflow-hidden lg:border-b-0 lg:opacity-0 lg:pointer-events-none"
              : "border-b border-slate-800 lg:max-h-20 lg:opacity-100"
          }`}
        >
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-1.5 text-xs font-bold sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-black text-white transition hover:border-red-400/50 hover:bg-red-600/20"
              >
                <Home className="size-3.5 text-red-400 shrink-0" />
                <span>الرئيسية</span>
              </Link>

              <div className="flex items-center gap-1">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook"
                  aria-label="Facebook"
                  className="flex size-6 items-center justify-center rounded border border-white/15 bg-white/5 text-[11px] font-black text-slate-200 transition hover:border-[#1877f2] hover:bg-[#1877f2] hover:text-white"
                >
                  f
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="X"
                  aria-label="X"
                  className="flex size-6 items-center justify-center rounded border border-white/15 bg-white/5 text-[11px] font-black text-slate-200 transition hover:border-white/40 hover:bg-black hover:text-white"
                >
                  𝕏
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="YouTube"
                  aria-label="YouTube"
                  className="flex size-6 items-center justify-center rounded border border-white/15 bg-white/5 text-[11px] font-black text-slate-200 transition hover:border-[#ff0000] hover:bg-[#ff0000] hover:text-white"
                >
                  ▶
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  aria-label="Instagram"
                  className="flex size-6 items-center justify-center rounded border border-white/15 bg-white/5 text-[11px] font-black text-slate-200 transition hover:border-[#e4405f] hover:bg-[#e4405f] hover:text-white"
                >
                  in
                </a>
              </div>

              <span className="hidden h-3.5 w-px bg-white/15 xl:block" />
              <span className="hidden uppercase tracking-[0.16em] text-[10px] text-white/70 xl:inline">
                Presse marocaine indépendante
              </span>
            </div>

            <div className="flex items-center gap-3">
              <HeaderSearch articles={published} />
              <span className="hidden h-3.5 w-px bg-white/15 sm:block" />
              <span suppressHydrationWarning className="capitalize text-[11px] text-slate-300 whitespace-nowrap">
                {today}
              </span>
            </div>
          </div>
        </div>

        {/* Ultra-compact Sticky Mobile Single-Row Header (< md) */}
        <div className="sticky top-0 z-50 border-b border-slate-100 bg-white/[0.98] md:hidden">
          <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-3.5" dir="rtl">
            <Link
              href="/"
              className="flex shrink-0 items-center py-0.5"
              aria-label="Afakpress"
            >
              <Image
                src="/afakpress-logo.png"
                alt="Afakpress"
                width={160}
                height={88}
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href="/"
                aria-label="الرئيسية"
                className="flex size-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 hover:text-red-700"
              >
                <Home className="size-[18px] text-red-700" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileSearchOpen((prev) => !prev)}
                aria-label="بحث"
                aria-expanded={mobileSearchOpen}
                className={`flex size-9 items-center justify-center rounded-lg transition ${
                  mobileSearchOpen ? "bg-red-50 text-red-700" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {mobileSearchOpen ? <X className="size-[18px]" /> : <Search className="size-[18px]" />}
              </button>
            </div>
          </div>

          {mobileSearchOpen ? (
            <MobileSearchDrawer articles={published} onClose={() => setMobileSearchOpen(false)} />
          ) : null}
        </div>

        {/* Desktop Header (>= md, collapses smoothly on scroll on lg+) */}
        <div
          className={`mx-auto hidden max-w-[1400px] px-4 transition-all duration-300 ease-out sm:px-6 md:block lg:px-8 ${
            isScrolled
              ? "lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none"
              : "lg:max-h-56 lg:opacity-100"
          }`}
        >
          <div className="grid min-h-28 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 py-2.5 lg:gap-7">
            {/* Right side (RTL start): Editorial figures statement */}
            <div
              dir="rtl"
              className="rounded-r-xl border-r-[3px] border-[#d99b1e] bg-gradient-to-l from-amber-50/60 via-white to-white py-2 pr-3.5 pl-2 text-right"
            >
              <p className="font-moroccan-naskh text-[12px] font-semibold leading-[1.8] text-slate-800 lg:text-[13.5px] lg:leading-[1.9] xl:text-[14.5px]">
                <span className="font-bold text-[#b91c1c]">آفاق بريس</span>{" "}
                <span className="font-bold text-[#b91c1c] underline decoration-[#d99b1e]/80 decoration-2 underline-offset-4">
                  &quot;همزة وصل&quot;
                </span>{" "}
                بين{" "}
                <span className="font-bold text-[#b91c1c] tabular-nums" dir="ltr">
                  33.191
                </span>{" "}
                مستشار جماعي{" "}
                <span className="font-bold text-[#b91c1c] tabular-nums">395</span>{" "}
                نائب برلماني و{" "}
                <span className="font-bold text-[#b91c1c] tabular-nums">120</span>{" "}
                مستشار برلماني تضمهم{" "}
                <span className="font-bold text-[#b91c1c] tabular-nums">1503</span>{" "}
                جماعة ترابية في{" "}
                <span className="font-bold text-[#b91c1c] tabular-nums">75</span>{" "}
                عمالة وإقليم بين أحضان{" "}
                <span className="font-bold text-[#b91c1c] tabular-nums">12</span>{" "}
                جهة في المملكة المغربية.
              </p>
            </div>

            {/* Center: Afakpress Logo (kept unchanged) */}
            <Link
              href="/"
              className="flex h-[74px] w-[180px] shrink-0 items-center justify-center p-1 justify-self-center transition hover:opacity-95 lg:h-[82px] lg:w-[210px]"
              aria-label="Afakpress"
            >
              <Image src="/afakpress-logo.png" alt="Afakpress" width={200} height={78} priority className="h-full w-full object-contain" />
            </Link>

            {/* Left side (RTL end): Territorial reach & portal address */}
            <div
              dir="rtl"
              className="rounded-l-xl border-l-[3px] border-[#0b1930] bg-gradient-to-r from-slate-100/75 via-white to-white py-2 pl-3.5 pr-2 text-center"
            >
              <p className="font-moroccan-naskh text-[12px] font-semibold leading-[1.8] text-slate-800 lg:text-[13.5px] lg:leading-[1.9] xl:text-[14.5px]">
                من الدوار و<span className="font-bold text-emerald-700">القرية</span> و
                <span className="font-bold text-emerald-700">الحي</span> والمدينة إلى{" "}
                <span className="font-bold text-[#b91c1c]">الجماعة</span> ثم من{" "}
                <span className="font-bold text-emerald-700">الإقليم</span> إلى{" "}
                <span className="font-bold text-[#b91c1c]">الجهة</span>.
              </p>
              <div className="my-0.5">
                <a
                  href="https://www.afakpress.ma"
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="inline-block text-[12px] font-black tracking-[0.06em] text-[#0b1930] transition hover:text-[#b91c1c] lg:text-[13px]"
                >
                  www.afakpress.ma
                </a>
              </div>
              <p className="font-moroccan-naskh text-[12px] font-semibold leading-[1.7] text-slate-800 lg:text-[13.5px] xl:text-[14.5px]">
                <span className="font-bold text-[#b91c1c]">تواصل دائم</span> بين{" "}
                <span className="font-bold text-emerald-700">سكان جهات المملكة</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Strip */}
        <div className="border-t border-slate-200/80 bg-white md:border-y">
          <div className="mx-auto max-w-[1400px] px-3.5 sm:px-6 lg:px-8">
            <MegaMenu
              regions={state.regions}
              isScrolled={isScrolled}
              compactRightSlot={
                <div className="flex items-center gap-2.5" dir="rtl">
                  <Link href="/" className="flex shrink-0 items-center py-0.5 transition hover:opacity-90" aria-label="Afakpress">
                    <Image
                      src="/afakpress-logo.png"
                      alt="Afakpress"
                      width={116}
                      height={44}
                      className="h-9 w-auto object-contain"
                    />
                  </Link>
                  <span className="h-5 w-px bg-slate-200 shrink-0" aria-hidden="true" />
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 text-xs font-black text-slate-800 transition hover:border-red-200 hover:bg-red-50 hover:text-[#b91c1c]"
                  >
                    <Home className="size-3.5 text-[#b91c1c] shrink-0" />
                    <span>الرئيسية</span>
                  </Link>
                </div>
              }
              compactLeftSlot={<HeaderSearch articles={published} variant="light" />}
            />
          </div>
        </div>

        <ArabicBreakingNewsTicker breakingNews={state.breakingNews} articles={state.articles} />
      </header>
      <main className="mx-auto w-full max-w-[1400px] overflow-x-clip px-3.5 py-4 sm:px-6 sm:py-7 lg:px-8 lg:py-8">{children}</main>
      <AfakFooter />
    </>
  );
}

export function CmsShell({ children, initialState, initiallyLoaded = true }: { children: React.ReactNode; initialState?: CmsState; initiallyLoaded?: boolean }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <CmsProvider initialState={initialState} initiallyLoaded={initiallyLoaded && !isAdmin}>
      {isAdmin ? <div dir="ltr" className="min-h-screen text-left">{children}</div> : <Chrome>{children}</Chrome>}
    </CmsProvider>
  );
}
