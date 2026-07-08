"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CmsProvider, useCms } from "@/lib/cms-store";
import { getPublishedArticles, type CmsMenuItem, type CmsRegion } from "@/lib/cms";

function regionMenuItem(region: CmsRegion): CmsMenuItem {
  return {
    id: `region-menu-${region.id}`,
    label: region.name,
    href: `/region/${region.slug}`,
    type: "Region",
    active: true,
    showInHeader: true,
    children: region.provinces.map((province) => ({
      id: `province-menu-${region.id}-${province.id}`,
      label: province.name,
      href: `/region/${region.slug}`,
      type: "Province",
      active: true,
      showInHeader: true,
      children: province.communes.map((commune) => ({
        id: `commune-menu-${region.id}-${province.id}-${commune.id}`,
        label: commune.name,
        href: `/region/${region.slug}`,
        type: "Commune",
        active: true,
        showInHeader: true,
        children: [],
      })),
    })),
  };
}

function MenuItem({ item, depth = 0 }: { item: CmsMenuItem; depth?: number }) {
  const visibleChildren = item.children.filter((child) => child.active !== false && child.showInHeader !== false);

  if (visibleChildren.length === 0) {
    return (
      <Link
        href={item.href}
        dir="auto"
        className={depth === 0 ? "flex min-h-12 items-center border-b-2 border-transparent px-3 text-sm font-black uppercase text-slate-800 transition hover:border-red-700 hover:text-red-700" : "block rounded-md px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-700"}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className={depth === 0 ? "group relative" : "group/sub relative"}>
      <Link
        href={item.href}
        dir="auto"
        className={depth === 0 ? "flex min-h-12 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-black uppercase text-slate-800 transition hover:border-red-700 hover:text-red-700" : "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-700"}
      >
        <span>{item.label}</span>
        <span aria-hidden="true" className="text-red-700">{depth === 0 ? "+" : ">"}</span>
      </Link>
      <div className={depth === 0 ? "invisible absolute left-0 top-full z-50 max-h-[75vh] w-[min(920px,calc(100vw-2rem))] translate-y-2 overflow-y-auto border border-slate-200 bg-white p-4 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100" : "invisible absolute left-full top-0 z-50 max-h-[70vh] min-w-56 translate-x-2 overflow-y-auto border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover/sub:visible group-hover/sub:translate-x-0 group-hover/sub:opacity-100"}>
        <div className={depth === 0 ? "grid gap-2 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-1"}>
          {visibleChildren.map((child) => (
            <MenuItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Chrome({ children }: { children: React.ReactNode }) {
  const { state } = useCms();
  const fallbackBreaking = getPublishedArticles(state).find((article) => article.breaking);
  const breaking = state.breakingNews.filter((item) => item.isActive).sort((a, b) => a.orderIndex - b.orderIndex)[0];
  const breakingArticle = breaking?.articleId ? state.articles.find((article) => article.id === breaking.articleId) : null;
  const categories = state.categories;
  const headerMenus = [
    ...state.menus.filter((item) => item.type !== "Region" && item.active !== false && item.showInHeader !== false),
    ...state.regions.map(regionMenuItem),
  ];
  const footerMenus = state.menus.filter((item) => item.active !== false && item.showInFooter === true);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="border-b border-slate-100 bg-slate-950 text-white">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2 text-xs font-bold sm:px-6 lg:px-10">
            <span>Moroccan independent news platform</span>
            <span className="hidden text-slate-300 md:inline">{state.settings.contactEmail}</span>
          </div>
        </div>
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <div className="flex min-h-20 items-center justify-between gap-6">
            <Link href="/" className="flex flex-col">
              <span className="text-3xl font-black uppercase tracking-normal text-slate-950">{state.settings.logo || state.settings.websiteName}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-red-700">Moroccan newsroom</span>
            </Link>
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/category/national" className="bg-red-700 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-950">
                Latest
              </Link>
              <Link href="/admin" className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-900 transition hover:border-red-700 hover:text-red-700">
                Admin
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-10">
            <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
              {headerMenus.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </nav>
            <div className="flex gap-4 py-3 text-sm font-bold text-slate-700 lg:hidden">
              {categories.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`} className="shrink-0">
                  {category.name}
                </Link>
              ))}
              <Link href="/admin" className="shrink-0 text-red-700">
                Admin
              </Link>
            </div>
            <Link href="/admin" className="ml-auto hidden shrink-0 text-sm font-black uppercase text-red-700 hover:text-slate-950 lg:block">
              Admin
            </Link>
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
