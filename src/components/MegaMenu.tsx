"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Landmark,
  Layers,
  MapPin,
  Newspaper,
  Palette,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import type { CmsRegion } from "@/lib/cms";

type RegionSource = CmsRegion;

type MenuNode = {
  id: string;
  label: string;
  href: string;
  children: MenuNode[];
};

export const ARABIC_CATEGORIES = [
  {
    name: "أخبار وطنية",
    slug: "وطنية",
    icon: Newspaper,
    description: "مستجدات الشأن الوطني والقرارات الكبرى",
    color: "bg-red-50 text-red-700",
  },
  {
    name: "سياسة ودبلوماسية",
    slug: "سياسة",
    icon: Landmark,
    description: "الأحزاب، البرلمان، والدبلوماسية المغربية",
    color: "bg-blue-50 text-blue-700",
  },
  {
    name: "رياضة",
    slug: "رياضة",
    icon: Trophy,
    description: "البطولة الوطنية، المحترفون، والمنتخبات",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    name: "اقتصاد ومال",
    slug: "اقتصاد",
    icon: TrendingUp,
    description: "الأسواق، الاستثمارات، ومشاريع المملكة",
    color: "bg-amber-50 text-amber-700",
  },
  {
    name: "أخبار الجهات",
    slug: "جهات",
    icon: MapPin,
    description: "تغطية ميدانية من كافة أقاليم وعمالات المغرب",
    color: "bg-purple-50 text-purple-700",
  },
  {
    name: "مجتمع وقضايا",
    slug: "مجتمع",
    icon: Users,
    description: "نبض الشارع المغربي وشؤون المواطنين",
    color: "bg-rose-50 text-rose-700",
  },
  {
    name: "ثقافة وفنون",
    slug: "ثقافة",
    icon: Palette,
    description: "التراث المغربي الأصيل، الأدب، والفنون",
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    name: "آراء وتحليلات",
    slug: "رأي",
    icon: BookOpen,
    description: "مقالات رأي بأقلام نخبة الكتاب والخبراء",
    color: "bg-slate-100 text-slate-800",
  },
];

function sourceId(prefix: string, fallback: string, id?: string) {
  return `${prefix}-${id || fallback}`;
}

function regionLabel(name: string) {
  return name
    .replace(/^جهة\s+/u, "")
    .replace(/تافلالت/gu, "تافيلالت")
    .replace(/اسفي/gu, "آسفي")
    .replace(/واد الذهب/gu, "وادي الذهب")
    .replace(/[.\-–]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildRegionNodes(regions: RegionSource[]): MenuNode[] {
  return regions.map((region) => ({
    id: sourceId("region", region.slug, "id" in region ? region.id : undefined),
    label: regionLabel(region.name),
    href: `/region/${region.slug}`,
    children: region.provinces.map((province) => ({
      id: sourceId("province", `${region.slug}-${province.slug}`, "id" in province ? province.id : undefined),
      label: province.name,
      href: `/province/${province.slug}`,
      children: province.communes.map((commune) => ({
        id: sourceId("commune", `${region.slug}-${province.slug}-${commune.slug}`, "id" in commune ? commune.id : undefined),
        label: commune.name,
        href: `/commune/${commune.slug}`,
        children: [],
      })),
    })),
  }));
}

function MobileBranch({ node, depth }: { node: MenuNode; depth: number }) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <li className={depth === 0 ? "border-b border-slate-200" : "border-l border-slate-200 pl-3"}>
      <div className="grid grid-cols-[1fr_auto] items-center gap-2">
        <Link
          dir="auto"
          href={node.href}
          className={depth === 0 ? "py-3 text-sm font-black uppercase text-slate-900" : "py-2 text-sm font-bold text-slate-700"}
        >
          {node.label}
        </Link>
        {hasChildren ? (
          <button
            aria-expanded={open}
            aria-label={`${open ? "Collapse" : "Expand"} ${node.label}`}
            className="flex size-10 items-center justify-center rounded-md border border-slate-200 text-lg font-black text-red-700"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            {open ? "-" : "+"}
          </button>
        ) : null}
      </div>
      {hasChildren && open ? (
        <ul className="grid gap-1 pb-2">
          {node.children.map((child) => (
            <MobileBranch key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function MegaMenu({
  regions,
}: {
  regions: RegionSource[];
}) {
  const regionItems = useMemo(() => buildRegionNodes(regions), [regions]);
  const [activeRegionId, setActiveRegionId] = useState("");
  const [activeProvinceId, setActiveProvinceId] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeRegion = regionItems.find((region) => region.id === activeRegionId) ?? null;
  const activeProvince = activeRegion?.children.find((province) => province.id === activeProvinceId) ?? activeRegion?.children[0] ?? null;

  const closeMenu = useCallback(() => {
    setActiveRegionId("");
    setActiveProvinceId("");
    setCategoriesOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const closeFromOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        setMobileOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromEscape);
    };
  }, [closeMenu]);

  const toggleRegion = (region: MenuNode) => {
    if (activeRegionId === region.id) {
      closeMenu();
      return;
    }
    setCategoriesOpen(false);
    setActiveRegionId(region.id);
    setActiveProvinceId(region.children[0]?.id ?? "");
  };

  return (
    <div ref={menuRef} className="relative z-[100] w-full">
      <nav className="hidden w-full lg:block" aria-label="Primary regional navigation" dir="rtl">
        <div className="flex w-full items-center gap-2 py-2">
          {/* 1. National News & Categories Button */}
          <div className="relative shrink-0">
            <button
              id="national-news-categories-btn"
              type="button"
              aria-expanded={categoriesOpen}
              aria-haspopup="menu"
              onClick={() => {
                closeMenu();
                setCategoriesOpen((prev) => !prev);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition-all shadow-sm ${
                categoriesOpen
                  ? "bg-red-700 text-white shadow-md ring-2 ring-red-600/40 ring-offset-1"
                  : "bg-[#b91c1c] text-white hover:bg-red-800 active:scale-95"
              }`}
            >
              <Newspaper className="size-4 shrink-0" />
              <span className="whitespace-nowrap tracking-wide">أخبار وطنية</span>
              <ChevronDown
                className={`size-3.5 shrink-0 transition-transform duration-200 ${
                  categoriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Categories Dropdown Modal */}
            {categoriesOpen && (
              <div
                className="absolute right-0 top-[calc(100%+8px)] z-[1100] w-[340px] sm:w-[440px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-slate-900/5 transition-all animate-in fade-in zoom-in-95 duration-150"
                role="menu"
                dir="rtl"
              >
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-50 text-red-700">
                      <Layers className="size-3.5" />
                    </span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      الأقسام والتغطيات الإخبارية
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                    {ARABIC_CATEGORIES.length} أقسام
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {ARABIC_CATEGORIES.map((cat) => {
                    const IconComponent = cat.icon;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/category/${encodeURIComponent(cat.slug)}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="group flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50/70 hover:shadow-sm"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cat.color} shadow-xs transition group-hover:scale-105`}
                        >
                          <IconComponent className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <p className="text-xs font-black text-slate-900 transition group-hover:text-red-700">
                            {cat.name}
                          </p>
                          <p className="line-clamp-1 text-[10px] text-slate-500 transition group-hover:text-slate-600">
                            {cat.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Vertical divider */}
          <div className="h-6 w-px bg-slate-200 shrink-0 mx-1 hidden xl:block" />

          {/* 2. 12 Moroccan Regions Navigation */}
          <div className="grid flex-1 grid-cols-12 items-center gap-1">
            {regionItems.map((region) => (
              <button
                key={region.id}
                aria-expanded={activeRegionId === region.id}
                aria-haspopup="menu"
                dir="auto"
                type="button"
                onClick={() => {
                  setCategoriesOpen(false);
                  toggleRegion(region);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") closeMenu();
                  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                    event.preventDefault();
                    if (activeRegionId !== region.id) toggleRegion(region);
                  }
                }}
                className={`flex min-h-10 items-center justify-center rounded-xl px-1 text-center text-[11px] font-bold leading-4 transition focus:outline-none ${
                  activeRegionId === region.id
                    ? "bg-red-50 text-red-700"
                    : "text-slate-700 hover:bg-slate-100 hover:text-red-700 focus:bg-slate-100 focus:text-red-700"
                }`}
              >
                <span dir="auto" className="line-clamp-1">{region.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {activeRegion ? (
        <div
          className="absolute left-0 right-0 top-full z-[1000] hidden rounded-b-xl border border-slate-200 bg-white opacity-100 shadow-2xl ring-1 ring-slate-950/5 transition duration-150 ease-out lg:grid lg:grid-cols-[320px_minmax(0,1fr)]"
          role="menu"
        >
          <div className="max-h-[78vh] overflow-y-auto border-r border-slate-200 bg-slate-50 p-3">
            <Link
              dir="auto"
              href={activeRegion.href}
              className="mb-2 block rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:text-red-700 focus:text-red-700 focus:outline-none"
            >
              {activeRegion.label}
            </Link>
            <ul className="grid gap-1">
              {activeRegion.children.map((province) => (
                <li key={province.id}>
                  <Link
                    aria-expanded={activeProvince?.id === province.id}
                    aria-haspopup={province.children.length > 0 ? "menu" : undefined}
                    dir="auto"
                    href={province.href}
                    onFocus={() => setActiveProvinceId(province.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") closeMenu();
                      if (event.key === "ArrowRight") {
                        event.preventDefault();
                        setActiveProvinceId(province.id);
                      }
                    }}
                    className={`flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-bold transition focus:outline-none ${
                      activeProvince?.id === province.id
                        ? "bg-red-700 text-white"
                        : "text-slate-700 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                    }`}
                  >
                    <span>{province.label}</span>
                    {province.children.length > 0 ? <span aria-hidden="true">&gt;</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="max-h-[78vh] overflow-y-auto p-5">
            <div className="grid gap-5 xl:grid-cols-2">
              {activeRegion.children.map((province) => (
                <section
                  key={province.id}
                  className={`rounded-xl border p-4 ${activeProvince?.id === province.id ? "border-red-200 bg-red-50/60" : "border-slate-200 bg-white"}`}
                >
                  <Link
                    dir="auto"
                    href={province.href}
                    className="block text-base font-black text-slate-950 transition hover:text-red-700 focus:text-red-700 focus:outline-none"
                  >
                    {province.label}
                  </Link>
                  <div className="mt-3 grid gap-1 sm:grid-cols-2">
                    {province.children.map((commune) => (
                      <Link
                        key={commune.id}
                        dir="auto"
                        href={commune.href}
                        className="rounded-lg px-2 py-1.5 text-sm font-bold leading-5 text-slate-700 transition hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 focus:outline-none"
                      >
                        {commune.label}
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Mobile Navigation: Ultra-slim single-line bar */}
      <nav className="w-full lg:hidden" aria-label="Mobile navigation" dir="rtl">
        <div className="flex h-9 items-center justify-between gap-2">
          {/* Quick Category Drawer Trigger */}
          <button
            type="button"
            onClick={() => {
              setCategoriesOpen((prev) => !prev);
              setMobileOpen(false);
            }}
            className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-black transition ${
              categoriesOpen ? "bg-red-700 text-white" : "text-red-700 hover:bg-red-50"
            }`}
          >
            <Newspaper className="size-3.5 shrink-0" />
            <span>الأقسام</span>
            <ChevronDown className={`size-3 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
          </button>

          <span className="h-3.5 w-px shrink-0 bg-slate-200" />

          {/* Fluid Single-Line Quick Links */}
          <div className="no-scrollbar flex flex-1 items-center gap-3 overflow-x-auto whitespace-nowrap px-1 text-[11px] font-bold text-slate-600">
            {ARABIC_CATEGORIES.slice(0, 5).map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${encodeURIComponent(cat.slug)}`}
                className="shrink-0 transition hover:text-red-700"
              >
                {cat.name.split(" ")[0]}
              </Link>
            ))}
          </div>

          <span className="h-3.5 w-px shrink-0 bg-slate-200" />

          {/* Compact Regions Trigger */}
          <button
            type="button"
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen((current) => !current);
              setCategoriesOpen(false);
            }}
            className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-black transition ${
              mobileOpen ? "bg-slate-900 text-white" : "text-slate-800 hover:bg-slate-100"
            }`}
          >
            <MapPin className="size-3.5 shrink-0 text-red-700" />
            <span>الجهات</span>
            <ChevronDown className={`size-3 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Mobile Categories Dropdown */}
        {categoriesOpen && (
          <div className="mb-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg">
            <div className="grid grid-cols-2 gap-1.5">
              {ARABIC_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${encodeURIComponent(cat.slug)}`}
                  onClick={() => setCategoriesOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs font-bold text-slate-800 transition hover:bg-red-50 hover:text-red-700"
                >
                  <span className="size-1.5 rounded-full bg-red-600 shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {mobileOpen ? (
          <ul
            className="-mx-3.5 grid max-h-[65dvh] gap-0.5 overflow-y-auto overscroll-contain border-y border-slate-200 bg-white px-3.5 py-1.5 shadow-lg sm:-mx-6 sm:px-6"
            role="menu"
          >
            {regionItems.map((item) => (
              <MobileBranch key={item.id} node={item} depth={0} />
            ))}
          </ul>
        ) : null}
      </nav>
    </div>
  );
}
