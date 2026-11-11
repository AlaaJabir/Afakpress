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

import { FileText, Home, Search, Sun } from "lucide-react";

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
      {/* 1. Professional Magazine Feature: Digital Edition (PDF) */}
      <a
        href="#digital-edition"
        className="hidden xl:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-black text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
        title="تصفح النسخة الورقية بصيغة PDF"
      >
        <FileText className="size-3.5 text-red-700" />
        <span>النسخة الرقمية</span>
        <span className="rounded bg-red-100 px-1 py-0.2 text-[9px] font-bold text-red-700">PDF</span>
      </a>

      {/* 2. Professional Magazine Feature: Weather in Rabat */}
      <div className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
        <Sun className="size-3.5 text-amber-500" />
        <span>الرباط 21°C</span>
      </div>

      {/* 3. Search Bar made as an elegant icon-focused input */}
      <form
        className="relative"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (results[0]) window.location.assign(`/article/${encodeURIComponent(results[0].slug)}`);
        }}
      >
        <label htmlFor="header-search" className="sr-only">Rechercher dans Afakpress</label>
        <div className="flex h-10 items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 shadow-xs transition-all duration-200 focus-within:w-64 focus-within:border-red-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-100 w-10 sm:w-48">
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

function Chrome({ children }: { children: React.ReactNode }) {
  const { state } = useCms();
  const published = getPublishedArticles(state);
  const today = new Intl.DateTimeFormat("fr-MA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl">
        <div className="border-b border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs font-bold sm:px-6 lg:px-8">
            <span className="uppercase tracking-[0.18em] text-white/80">Presse marocaine indépendante</span>
            <span suppressHydrationWarning className="hidden capitalize text-slate-300 md:inline">{today}</span>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid min-h-28 grid-cols-1 items-center gap-3 py-3 md:grid-cols-[1fr_auto_1fr]">
            <div className="order-2 flex justify-center md:order-1 md:justify-start">
              <HeaderSearch articles={published} />
            </div>
            <Link
              href="/"
              className="order-1 flex h-[82px] w-[210px] items-center justify-center p-1 justify-self-center transition hover:opacity-95 md:order-2"
              aria-label="Afakpress"
            >
              <Image src="/afakpress-logo.png" alt="Afakpress" width={200} height={78} priority className="h-full w-full object-contain" />
            </Link>
            <div className="order-3 flex items-center justify-center gap-2 md:justify-end" dir="rtl">
              {/* Home link in Arabic with Home icon */}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-800 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <Home className="size-4 text-red-700 shrink-0" />
                <span>الرئيسية</span>
              </Link>

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

              {/* Professional Social Media Icons */}
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
        <div className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MegaMenu regions={state.regions} />
          </div>
        </div>
        <ArabicBreakingNewsTicker breakingNews={state.breakingNews} articles={state.articles} />
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
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
