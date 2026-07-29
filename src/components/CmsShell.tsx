"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CmsProvider, useCms } from "@/lib/cms-store";
import { getPublishedArticles } from "@/lib/cms";
import { MegaMenu } from "@/components/MegaMenu";
import type { CmsState } from "@/lib/cms";

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
    <form
      className="relative w-full max-w-sm md:max-w-[285px]"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (results[0]) window.location.assign(`/article/${encodeURIComponent(results[0].slug)}`);
      }}
    >
      <label htmlFor="header-search" className="sr-only">Rechercher dans Afakpress</label>
      <div className="flex h-11 items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 shadow-sm transition focus-within:border-red-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
        <svg aria-hidden="true" className="ml-4 size-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          id="header-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => window.setTimeout(() => setIsFocused(false), 150)}
          placeholder="Rechercher un article…"
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
        />
        <button type="submit" disabled={!results.length} className="mr-1 rounded-full bg-slate-950 px-3 py-2 text-[11px] font-black uppercase text-white transition hover:bg-red-700 disabled:cursor-default disabled:opacity-35">
          Chercher
        </button>
      </div>
      {isFocused && query.trim() ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[2000] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
          {results.length ? (
            <ul>
              {results.map((article) => (
                <li key={article.id}>
                  <Link href={`/article/${encodeURIComponent(article.slug)}`} className="block rounded-xl px-3 py-2.5 text-sm font-bold leading-5 text-slate-800 transition hover:bg-red-50 hover:text-red-700" dir="auto">
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-4 text-center text-sm font-semibold text-slate-500">Aucun article trouvé</p>
          )}
        </div>
      ) : null}
    </form>
  );
}

function Chrome({ children }: { children: React.ReactNode }) {
  const { state } = useCms();
  const published = getPublishedArticles(state);
  const fallbackBreaking = published.find((article) => article.breaking);
  const breaking = state.breakingNews.filter((item) => item.isActive).sort((a, b) => a.orderIndex - b.orderIndex)[0];
  const breakingArticle = breaking?.articleId ? state.articles.find((article) => article.id === breaking.articleId) : null;
  const today = new Intl.DateTimeFormat("fr-MA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl">
        <div className="border-b border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-2 text-xs font-bold sm:px-6">
            <span className="uppercase tracking-[0.18em] text-white/80">Presse marocaine indépendante</span>
            <span suppressHydrationWarning className="hidden capitalize text-slate-300 md:inline">{today}</span>
          </div>
        </div>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid min-h-28 grid-cols-1 items-center gap-3 py-3 md:grid-cols-[1fr_auto_1fr]">
            <div className="order-2 flex justify-center md:order-1 md:justify-start">
              <HeaderSearch articles={published} />
            </div>
            <Link href="/" className="order-1 block h-[99px] w-[180px] justify-self-center md:order-2" aria-label="Afakpress">
              <Image src="/afakpress-logo.png" alt="Afakpress" width={180} height={99} priority className="h-full w-full object-contain" />
            </Link>
            <div className="order-3 flex items-center justify-center gap-1 text-sm font-semibold text-slate-700 md:justify-end">
              <Link href="/category/national" className="whitespace-nowrap rounded-xl px-3 py-2 transition hover:bg-slate-100 hover:text-red-700">
                À la une
              </Link>
              <Link href="/#newsletter" className="whitespace-nowrap rounded-xl px-3 py-2 transition hover:bg-slate-100 hover:text-red-700">
                Newsletter
              </Link>
            </div>
          </div>
        </div>
        <div className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <MegaMenu regions={state.regions} />
          </div>
        </div>
      </header>
      {breaking ? (
        <div className="border-y border-red-200 bg-red-700 text-white">
          <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
            <span className="shrink-0 bg-white px-2 py-1 text-xs font-black uppercase text-red-700">Breaking</span>
            <Link href={breakingArticle ? `/article/${encodeURIComponent(breakingArticle.slug)}` : breaking.url || "/"} className="truncate text-sm font-bold hover:underline">
              {breaking.title}
            </Link>
          </div>
        </div>
      ) : fallbackBreaking ? (
        <div className="border-y border-red-200 bg-red-700 text-white">
          <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
            <span className="shrink-0 bg-white px-2 py-1 text-xs font-black uppercase text-red-700">Breaking</span>
            <Link href={`/article/${encodeURIComponent(fallbackBreaking.slug)}`} className="truncate text-sm font-bold hover:underline">
              {fallbackBreaking.title}
            </Link>
          </div>
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">{children}</main>
      <footer className="mt-20 border-t-4 border-red-700 bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] lg:items-end lg:py-16">
            <div>
              <Image src="/afakpress-logo.png" alt="Afakpress" width={180} height={99} className="h-auto w-[180px] brightness-0 invert" />
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">{state.settings.footer}</p>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                <span>Independent journalism</span>
                <span className="h-1 w-1 rounded-full bg-red-600" />
                <span>Morocco</span>
              </div>
            </div>
            <div className="border-l-2 border-red-700 pl-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-400">Newsroom</p>
              <a className="mt-3 block break-all text-lg font-black text-white transition hover:text-red-300" href={`mailto:${state.settings.contactEmail}`}>
                {state.settings.contactEmail}
              </a>
              <p className="mt-3 text-sm leading-6 text-slate-400">{state.settings.address}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© Afakpress. All rights reserved.</p>
            <p className="uppercase tracking-[0.14em]">Moroccan press and regional news</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export function CmsShell({ children, initialState, initiallyLoaded = false }: { children: React.ReactNode; initialState?: CmsState; initiallyLoaded?: boolean }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <CmsProvider initialState={initialState} initiallyLoaded={initiallyLoaded && !isAdmin}>
      {isAdmin ? children : <Chrome>{children}</Chrome>}
    </CmsProvider>
  );
}
