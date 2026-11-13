"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CmsProvider, useCms } from "@/lib/cms-store";
import { getPublishedArticles } from "@/lib/cms";
import { MegaMenu } from "@/components/MegaMenu";
import { ArabicBreakingNewsTicker } from "@/components/ArabicBreakingNewsTicker";
import { AfakFooter } from "@/components/AfakFooter";
import type { CmsState } from "@/lib/cms";

import { FileText, Home, Search, Sun, X } from "lucide-react";

function HeaderSearch({ articles }: { articles: ReturnType<typeof getPublishedArticles> }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const normalizedQuery = query.normalize("NFKD").trim().toLocaleLowerCase();
  const results = normalizedQuery
    ? articles
        .filter((article) => article.title.normalize("NFKD").toLocaleLowerCase().includes(normalizedQuery))
        .slice(0, 5)
    : [];

  return (
    <div className="flex items-center gap-2.5">
      {/* 1. Digital Edition (PDF) */}
      <a
        href="#digital-edition"
        className="hidden xl:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-black text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
        title="تصفح النسخة الورقية بصيغة PDF"
      >
        <FileText className="size-3.5 text-red-700" />
        <span>النسخة الرقمية</span>
        <span className="rounded bg-red-100 px-1 py-0.2 text-[9px] font-bold text-red-700">PDF</span>
      </a>

      {/* 2. Weather in Rabat */}
      <div className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
        <Sun className="size-3.5 text-amber-500" />
        <span>الرباط 21°C</span>
      </div>

      {/* 3. Desktop Search Input */}
      <form
        className="relative"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (results[0]) window.location.assign(`/article/${encodeURIComponent(results[0].slug)}`);
        }}
      >
        <label htmlFor="header-search" className="sr-only">Rechercher dans Afakpress</label>
        <div className="flex h-10 items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 shadow-xs transition-all duration-200 focus-within:w-64 focus-within:border-red-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-100 w-44 lg:w-48">
          <button
            type="submit"
            aria-label="بحث"
            className="flex size-10 shrink-0 items-center justify-center text-slate-500 transition hover:text-red-700"
          >
            <Search className="size-4" />
          </button>
          <input
            id="header-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => window.setTimeout(() => setIsFocused(false), 150)}
            placeholder="بحث..."
            autoComplete="off"
            className="h-full min-w-0 flex-1 bg-transparent pr-2 text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
        {isFocused && query.trim() ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[2000] min-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
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
  const today = new Intl.DateTimeFormat("fr-MA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return (
    <>
      <header className="relative z-50 w-full bg-white/95 backdrop-blur-xl md:sticky md:top-0">
        {/* Desktop-only top black strip */}
        <div className="hidden border-b border-slate-200 bg-slate-950 text-white md:block">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-2 text-xs font-bold sm:px-6 lg:px-8">
            <span className="uppercase tracking-[0.18em] text-white/80">Presse marocaine indépendante</span>
            <span suppressHydrationWarning className="capitalize text-slate-300">{today}</span>
          </div>
        </div>

        {/* Ultra-compact Mobile Single-Row Header (< md) */}
        <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between px-3.5 md:hidden" dir="rtl">
          <Link
            href="/"
            className="flex h-9 w-[112px] shrink-0 items-center justify-start"
            aria-label="Afakpress"
          >
            <Image
              src="/afakpress-logo.png"
              alt="Afakpress"
              width={112}
              height={36}
              priority
              className="h-full w-full object-contain object-right"
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

        {/* Desktop Header (>= md) */}
        <div className="mx-auto hidden max-w-[1400px] px-4 sm:px-6 md:block lg:px-8">
          <div className="grid min-h-28 grid-cols-[1fr_auto_1fr] items-center gap-3 py-3">
            <div className="flex justify-start">
              <HeaderSearch articles={published} />
            </div>
            <Link
              href="/"
              className="flex h-[82px] w-[210px] items-center justify-center p-1 justify-self-center transition hover:opacity-95"
              aria-label="Afakpress"
            >
              <Image src="/afakpress-logo.png" alt="Afakpress" width={200} height={78} priority className="h-full w-full object-contain" />
            </Link>
            <div className="flex items-center justify-end gap-2" dir="rtl">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-800 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <Home className="size-4 text-red-700 shrink-0" />
                <span>الرئيسية</span>
              </Link>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              <div className="flex items-center gap-1.5">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook"
                  aria-label="Facebook"
                  className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-600 transition hover:border-[#1877f2] hover:bg-[#1877f2] hover:text-white"
                >
                  f
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="X"
                  aria-label="X"
                  className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-600 transition hover:border-black hover:bg-black hover:text-white"
                >
                  𝕏
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="YouTube"
                  aria-label="YouTube"
                  className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-600 transition hover:border-[#ff0000] hover:bg-[#ff0000] hover:text-white"
                >
                  ▶
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  aria-label="Instagram"
                  className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-600 transition hover:border-[#e4405f] hover:bg-[#e4405f] hover:text-white"
                >
                  in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Strip */}
        <div className="border-t border-slate-200/80 bg-white md:border-y">
          <div className="mx-auto max-w-[1400px] px-3.5 sm:px-6 lg:px-8">
            <MegaMenu regions={state.regions} />
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
      {isAdmin ? children : <Chrome>{children}</Chrome>}
    </CmsProvider>
  );
}
