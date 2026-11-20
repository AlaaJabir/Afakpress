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
  const [regionsOpen, setRegionsOpen] = useState(false);
  const [activeRegionId, setActiveRegionId] = useState("");
  const [activeProvinceId, setActiveProvinceId] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeRegion =
    regionItems.find((region) => region.id === activeRegionId) ?? regionItems[0] ?? null;
  const activeProvince =
    activeRegion?.children.find((province) => province.id === activeProvinceId) ??
    activeRegion?.children[0] ??
    null;

  const closeMenu = useCallback(() => {
    setRegionsOpen(false);
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

  const selectRegion = (region: MenuNode) => {
    setActiveRegionId(region.id);
    setActiveProvinceId(region.children[0]?.id ?? "");
  };

  const toggleRegionsMenu = () => {
    setCategoriesOpen(false);
    setRegionsOpen((prev) => {
      const next = !prev;
      if (next && !activeRegionId && regionItems[0]) {
        setActiveRegionId(regionItems[0].id);
        setActiveProvinceId(regionItems[0].children[0]?.id ?? "");
      }
      return next;
    });
  };

  return (
    <div ref={menuRef} className="relative z-[100] w-full">
      {/* Desktop Navigation: Centered Dual Editorial Buttons */}
      <nav className="hidden w-full lg:block" aria-label="Primary navigation" dir="rtl">
        <div className="flex w-full items-center justify-center gap-3 py-2.5">
          {/* 1. National News & Categories Button */}
          <div className="relative shrink-0">
            <button
              id="national-news-categories-btn"
              type="button"
              aria-expanded={categoriesOpen}
              aria-haspopup="menu"
              onClick={() => {
                setRegionsOpen(false);
                setCategoriesOpen((prev) => !prev);
              }}
              className={`inline-flex items-center gap-2.5 rounded-lg px-5 py-2.5 text-xs font-black tracking-wide transition-all duration-200 cursor-pointer ${
                categoriesOpen
                  ? "bg-[#991b1b] text-white shadow-md ring-2 ring-red-600/25 ring-offset-1"
                  : "bg-[#b91c1c] text-white shadow-xs hover:bg-[#991b1b] hover:shadow-sm"
              }`}
            >
              <Newspaper className="size-4 shrink-0" />
              <span className="whitespace-nowrap">أخبار وطنية</span>
              <ChevronDown
                className={`size-3.5 shrink-0 opacity-85 transition-transform duration-200 ${
                  categoriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Elegant Categories Dropdown */}
            {categoriesOpen && (
              <div
                className="absolute right-1/2 translate-x-1/2 top-[calc(100%+10px)] z-[1100] w-[500px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_60px_-15px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/5"
                role="menu"
                dir="rtl"
              >
                <div className="h-[3px] w-full bg-gradient-to-l from-[#b91c1c] via-[#d99b1e] to-[#0b1930]" />
                <div className="p-5">
                  <div className="mb-3.5 flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-700">
                        <Layers className="size-4" />
                      </span>
                      <div>
                        <h3 className="text-xs font-black text-slate-950">
                          الأقسام والتغطيات الإخبارية
                        </h3>
                        <p className="text-[10px] font-medium text-slate-400">
                          تصفح جميع ملفات وأبواب آفاق بريس
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 tabular-nums">
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
                          onClick={closeMenu}
                          className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-all duration-150 hover:border-red-200/80 hover:bg-white hover:shadow-sm"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cat.color} transition-transform duration-150 group-hover:scale-105`}
                          >
                            <IconComponent className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1 text-right">
                            <p className="text-xs font-black text-slate-900 transition group-hover:text-red-700">
                              {cat.name}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                              {cat.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subtle Divider */}
          <span className="h-5 w-px bg-slate-200/90 shrink-0" aria-hidden="true" />

          {/* 2. Single "أخبار الجهات" Mega-Menu Trigger Button */}
          <div className="shrink-0">
            <button
              id="regional-news-menu-btn"
              type="button"
              aria-expanded={regionsOpen}
              aria-haspopup="menu"
              onClick={toggleRegionsMenu}
              className={`group inline-flex items-center gap-2.5 rounded-lg px-5 py-2.5 text-xs font-black tracking-wide transition-all duration-200 cursor-pointer ${
                regionsOpen
                  ? "bg-[#0b1930] text-white shadow-md ring-2 ring-[#0b1930]/20 ring-offset-1"
                  : "border border-slate-200 bg-slate-50 text-slate-900 shadow-xs hover:border-[#0b1930] hover:bg-[#0b1930] hover:text-white"
              }`}
            >
              <MapPin
                className={`size-4 shrink-0 transition-colors ${
                  regionsOpen ? "text-[#d99b1e]" : "text-[#b91c1c] group-hover:text-white"
                }`}
              />
              <span className="whitespace-nowrap">أخبار الجهات</span>
              <ChevronDown
                className={`size-3.5 shrink-0 opacity-80 transition-transform duration-200 ${
                  regionsOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Elegant Centered 3-Column Regions Mega Menu */}
      {regionsOpen && activeRegion ? (
        <div
          className="absolute inset-x-0 top-[calc(100%+6px)] z-[1050] hidden lg:block"
          role="menu"
          dir="rtl"
        >
          <div className="mx-auto max-w-[1140px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_28px_70px_-15px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/5">
            {/* Top Accent Ribbon & Header */}
            <div className="h-[3px] w-full bg-gradient-to-l from-[#0b1930] via-[#b91c1c] to-[#d99b1e]" />
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0b1930] text-[#d99b1e]">
                  <MapPin className="size-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-slate-950">
                    التغطية الجهوية — المغرب بجهاته الاثنتي عشرة
                  </h3>
                  <p className="text-[10px] font-medium text-slate-500">
                    اختر الجهة ثم الإقليم أو الجماعة للانتقال إلى صفحة الأخبار المحلية
                  </p>
                </div>
              </div>
              <Link
                href={activeRegion.href}
                onClick={closeMenu}
                className="text-xs font-black text-[#b91c1c] hover:text-slate-950 transition"
              >
                عرض أخبار جهة {activeRegion.label} ←
              </Link>
            </div>

            {/* 3-Column Master -> Sub-Menu -> Communes */}
            <div className="grid grid-cols-[260px_270px_minmax(0,1fr)] divide-x divide-x-reverse divide-slate-100">
              {/* Column 1: 12 Regions */}
              <div className="max-h-[68vh] overflow-y-auto bg-slate-50/50 p-3">
                <p className="px-2.5 pb-2 text-[10px] font-black text-slate-400">
                  الجهات ({regionItems.length})
                </p>
                <ul className="space-y-0.5">
                  {regionItems.map((region) => {
                    const isSelected = activeRegion.id === region.id;
                    return (
                      <li key={region.id}>
                        <button
                          type="button"
                          onClick={() => selectRegion(region)}
                          onMouseEnter={() => selectRegion(region)}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-right text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#0b1930] text-white shadow-xs font-black"
                              : "text-slate-700 hover:bg-white hover:text-[#b91c1c]"
                          }`}
                        >
                          <span className="truncate">{region.label}</span>
                          <span
                            className={`text-[10px] tabular-nums shrink-0 ${
                              isSelected ? "text-[#d99b1e]" : "text-slate-400"
                            }`}
                          >
                            {region.children.length}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Column 2: Provinces / Prefectures */}
              <div className="max-h-[68vh] overflow-y-auto bg-white p-3">
                <div className="flex items-center justify-between px-2.5 pb-2">
                  <p className="text-[10px] font-black text-slate-400">
                    الأقاليم والعمالات
                  </p>
                  <Link
                    href={activeRegion.href}
                    onClick={closeMenu}
                    className="text-[10px] font-bold text-[#b91c1c] hover:underline"
                  >
                    كل الجهة
                  </Link>
                </div>
                <ul className="space-y-0.5">
                  {activeRegion.children.map((province) => {
                    const isSelected = activeProvince?.id === province.id;
                    return (
                      <li key={province.id}>
                        <Link
                          href={province.href}
                          onClick={closeMenu}
                          onMouseEnter={() => setActiveProvinceId(province.id)}
                          onFocus={() => setActiveProvinceId(province.id)}
                          className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-right text-xs font-bold transition ${
                            isSelected
                              ? "bg-red-50 text-[#b91c1c] font-black ring-1 ring-red-200/70"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                          }`}
                        >
                          <span className="truncate">{province.label}</span>
                          <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                            {province.children.length > 0 ? province.children.length : ""}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Column 3: Communes for Selected Province */}
              <div className="max-h-[68vh] overflow-y-auto bg-white p-5">
                {activeProvince ? (
                  <>
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400">
                          الجماعات التابعة لـ
                        </p>
                        <h4 className="text-sm font-black text-slate-950">
                          {activeProvince.label}
                        </h4>
                      </div>
                      <Link
                        href={activeProvince.href}
                        onClick={closeMenu}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-800 transition hover:bg-[#b91c1c] hover:text-white"
                      >
                        تصفح الإقليم ←
                      </Link>
                    </div>

                    {activeProvince.children.length > 0 ? (
                      <div className="grid grid-cols-2 xl:grid-cols-3 gap-1.5">
                        {activeProvince.children.map((commune) => (
                          <Link
                            key={commune.id}
                            href={commune.href}
                            onClick={closeMenu}
                            className="rounded-lg border border-transparent px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-red-100 hover:bg-red-50/70 hover:text-[#b91c1c] truncate"
                          >
                            {commune.label}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        اضغط على «تصفح الإقليم» لمتابعة جميع أخبار {activeProvince.label}.
                      </p>
                    )}
                  </>
                ) : null}
              </div>
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
            <span>أخبار وطنية</span>
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
            <span>أخبار الجهات</span>
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
