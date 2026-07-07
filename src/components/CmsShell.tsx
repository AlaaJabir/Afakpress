"use client";

import Link from "next/link";
import { CmsProvider, useCms } from "@/lib/cms-store";
import { getPublishedArticles } from "@/lib/cms";

function Chrome({ children }: { children: React.ReactNode }) {
  const { state } = useCms();
  const breaking = getPublishedArticles(state).find((article) => article.breaking);
  const categories = state.categories;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex min-h-20 items-center justify-between gap-6">
            <Link href="/" className="flex flex-col">
              <span className="text-3xl font-black uppercase tracking-normal text-slate-950">{state.settings.logo || state.settings.websiteName}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-red-700">Moroccan newsroom</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-bold text-slate-700 lg:flex">
              {state.menus.slice(0, 4).map((item) => (
                <Link key={item.id} href={item.href} className="transition hover:text-red-700">
                  {item.label}
                </Link>
              ))}
              <div className="group relative">
                <button className="flex items-center gap-2 text-sm font-bold transition hover:text-red-700" type="button">
                  Regions
                  <span aria-hidden="true">+</span>
                </button>
                <div className="invisible absolute right-0 top-full w-[720px] translate-y-3 border border-slate-200 bg-white p-6 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="grid grid-cols-3 gap-5">
                    {state.regions.map((region) => (
                      <div key={region.id}>
                        <Link href={`/region/${region.slug}`} className="font-black text-slate-950 hover:text-red-700">
                          {region.name}
                        </Link>
                        <div className="mt-2 space-y-2">
                          {region.provinces.slice(0, 2).map((province) => (
                            <div key={province.id} className="text-xs text-slate-600">
                              <span className="font-bold text-slate-800">{province.name}</span>
                              <span className="block">{province.communes.map((commune) => commune.name).join(", ")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
            <Link href="/admin" className="rounded-sm border border-slate-300 px-4 py-2 text-sm font-bold text-slate-900 transition hover:border-red-700 hover:text-red-700">
              Admin
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto border-t border-slate-100 py-3 text-sm font-semibold text-slate-600 lg:hidden">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="shrink-0">
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </header>
      {breaking ? (
        <div className="border-y border-red-200 bg-red-700 text-white">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-8">
            <span className="shrink-0 bg-white px-2 py-1 text-xs font-black uppercase text-red-700">Breaking</span>
            <Link href={`/article/${breaking.slug}`} className="truncate text-sm font-bold hover:underline">
              {breaking.title}
            </Link>
          </div>
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">{children}</main>
      <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <p className="text-3xl font-black uppercase text-white">{state.settings.websiteName}</p>
            <p className="mt-4 max-w-md text-sm leading-7">{state.settings.footer}</p>
          </div>
          <div>
            <h3 className="font-black uppercase text-white">Categories</h3>
            <div className="mt-4 grid gap-2 text-sm">
              {state.categories.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`} className="hover:text-white">
                  {category.name}
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
  return (
    <CmsProvider>
      <Chrome>{children}</Chrome>
    </CmsProvider>
  );
}

