"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CmsRegion } from "@/lib/cms";
import type { MoroccoRegion } from "@/data/morocco-regions";

type RegionSource = CmsRegion | MoroccoRegion;

type MenuNode = {
  id: string;
  label: string;
  href: string;
  children: MenuNode[];
};

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeRegion = regionItems.find((region) => region.id === activeRegionId) ?? null;
  const activeProvince = activeRegion?.children.find((province) => province.id === activeProvinceId) ?? activeRegion?.children[0] ?? null;

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const openRegion = (region: MenuNode) => {
    setActiveRegionId(region.id);
    setActiveProvinceId(region.children[0]?.id ?? "");
  };

  const closeMenu = () => {
    setActiveRegionId("");
    setActiveProvinceId("");
  };

  return (
    <div className="relative z-[100] w-full" onMouseLeave={closeMenu}>
      <nav className="hidden w-full lg:block" aria-label="Primary regional navigation">
        <div className="grid w-full grid-cols-12 items-stretch divide-x divide-slate-100 border-x border-slate-100">
          {regionItems.map((region) => (
            <Link
              key={region.id}
              aria-expanded={activeRegionId === region.id}
              aria-haspopup="menu"
              dir="auto"
              href={region.href}
              onFocus={() => openRegion(region)}
              onMouseEnter={() => openRegion(region)}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeMenu();
                if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                  event.preventDefault();
                  openRegion(region);
                }
              }}
              className={`flex min-h-[52px] items-center justify-center border-b-2 px-1.5 text-center text-[11px] font-black leading-4 text-slate-800 transition focus:outline-none xl:px-2 xl:text-xs ${
                activeRegionId === region.id
                  ? "border-red-700 bg-red-50 text-red-700"
                  : "border-transparent hover:border-red-700 hover:bg-slate-50 hover:text-red-700 focus:border-red-700 focus:text-red-700"
              }`}
            >
              <span dir="auto">{region.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {activeRegion ? (
        <div
          className="absolute left-0 right-0 top-full z-[1000] hidden overflow-hidden border border-slate-200 bg-white opacity-100 shadow-2xl ring-1 ring-slate-950/5 transition duration-150 ease-out lg:grid lg:grid-cols-[340px_minmax(0,1fr)]"
          onMouseEnter={() => {
            setActiveRegionId(activeRegion.id);
            setActiveProvinceId(activeProvince?.id ?? activeRegion.children[0]?.id ?? "");
          }}
          role="menu"
        >
          <div className="max-h-[78vh] overflow-y-auto border-r border-slate-200 bg-slate-50 p-2">
            <Link
              dir="auto"
              href={activeRegion.href}
              className="mb-2 block rounded-md bg-white px-3 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:text-red-700 focus:text-red-700 focus:outline-none"
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
                    onMouseEnter={() => setActiveProvinceId(province.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") closeMenu();
                      if (event.key === "ArrowRight") {
                        event.preventDefault();
                        setActiveProvinceId(province.id);
                      }
                    }}
                    className={`flex min-h-11 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-bold transition focus:outline-none ${
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
                  className={`rounded-md border p-3 ${activeProvince?.id === province.id ? "border-red-200 bg-red-50/60" : "border-slate-200 bg-white"}`}
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
                        className="rounded-md px-2 py-1.5 text-sm font-bold leading-5 text-slate-700 transition hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 focus:outline-none"
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

      <nav className="w-full lg:hidden" aria-label="Mobile regional navigation">
        <button
          aria-expanded={mobileOpen}
          className="flex min-h-12 w-full items-center justify-between border-y border-slate-200 px-1 text-sm font-black uppercase text-slate-900"
          onClick={() => setMobileOpen((current) => !current)}
          type="button"
        >
          <span>المناطق</span>
          <span aria-hidden="true" className="text-xl text-red-700">{mobileOpen ? "-" : "+"}</span>
        </button>
        {mobileOpen ? (
          <ul
            className="-mx-4 grid max-h-[calc(100dvh-12rem)] gap-1 overflow-y-auto overscroll-contain border-b border-slate-200 bg-white px-4 py-2 shadow-lg sm:-mx-6 sm:px-6"
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
