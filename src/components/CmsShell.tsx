"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CmsProvider, useCms } from "@/lib/cms-store";
import { getPublishedArticles } from "@/lib/cms";
import { MegaMenu } from "@/components/MegaMenu";

function Chrome({ children }: { children: React.ReactNode }) {
  const { state } = useCms();
  const fallbackBreaking = getPublishedArticles(state).find((article) => article.breaking);
  const breaking = state.breakingNews.filter((item) => item.isActive).sort((a, b) => a.orderIndex - b.orderIndex)[0];
  const breakingArticle = breaking?.articleId ? state.articles.find((article) => article.id === breaking.articleId) : null;
  const today = new Intl.DateTimeFormat("fr-MA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const footerMenus = state.menus.filter((item) => item.active !== false && item.showInFooter === true);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="border-b border-slate-100 bg-slate-950 text-white">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2 text-xs font-bold sm:px-6 lg:px-10">
            <span className="uppercase tracking-[0.18em] text-red-200">Presse marocaine indépendante</span>
            <span suppressHydrationWarning className="hidden capitalize text-slate-300 md:inline">{today}</span>
          </div>
        </div>
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col items-start justify-center gap-3 py-2 md:flex-row md:items-center md:justify-start lg:py-3">
            <div className="flex flex-wrap items-center gap-1 text-xs font-black uppercase tracking-[0.08em] text-slate-600 md:gap-2">
              <Link href="/category/national" className="border border-transparent px-3 py-2 transition hover:border-red-200 hover:text-red-700">
                À la une
              </Link>
              <Link href="/#newsletter" className="border border-transparent px-3 py-2 transition hover:border-red-200 hover:text-red-700">
                Newsletter
              </Link>
            </div>
            <Link href="/" className="block h-[58px] w-[108px] md:h-[66px] md:w-[122px] lg:h-[74px] lg:w-[138px]" aria-label="Afakpress">
              <Image src="/afakpress-logo.png" alt="Afakpress" width={138} height={74} priority className="h-full w-full object-contain" />
            </Link>
          </div>
        </div>
        <div className="w-full border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <MegaMenu regions={state.regions} />
          </div>
        </div>
      </header>
      {breaking ? (
        <div className="border-y border-red-200 bg-red-700 text-white">
          <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
            <span className="shrink-0 bg-white px-2 py-1 text-xs font-black uppercase text-red-700">Breaking</span>
            <Link href={breakingArticle ? `/article/${breakingArticle.slug}` : breaking.url || "/"} className="truncate text-sm font-bold hover:underline">
              {breaking.title}
            </Link>
          </div>
        </div>
      ) : fallbackBreaking ? (
        <div className="border-y border-red-200 bg-red-700 text-white">
          <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
            <span className="shrink-0 bg-white px-2 py-1 text-xs font-black uppercase text-red-700">Breaking</span>
            <Link href={`/article/${fallbackBreaking.slug}`} className="truncate text-sm font-bold hover:underline">
              {fallbackBreaking.title}
            </Link>
          </div>
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-slate-300">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10">
          <div>
            <p className="text-3xl font-black uppercase text-white">{state.settings.websiteName}</p>
            <p className="mt-4 max-w-md text-sm leading-7">{state.settings.footer}</p>
          </div>
          <div>
            <h3 className="font-black uppercase text-white">Menus</h3>
            <div className="mt-4 grid gap-2 text-sm">
              {(footerMenus.length ? footerMenus : state.menus).map((item) => (
                <Link key={item.id} href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-black uppercase text-white">Regions</h3>
            <div className="mt-4 grid gap-2 text-sm">
              {state.regions.slice(0, 6).map((region) => (
                <Link key={region.id} href={`/region/${region.slug}`} className="hover:text-white">
                  {region.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export function CmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <CmsProvider>
      {isAdmin ? children : <Chrome>{children}</Chrome>}
    </CmsProvider>
  );
}
