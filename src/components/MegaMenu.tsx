"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

function buildRegionNodes(regions: RegionSource[]): MenuNode[] {
  return regions.map((region) => ({
    id: sourceId("region", region.slug, "id" in region ? region.id : undefined),
    label: region.name,
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
  leadingItems = [],
}: {
  regions: RegionSource[];
  leadingItems?: MenuNode[];
}) {
  const regionItems = useMemo(() => buildRegionNodes(regions), [regions]);
  const mobileItems = useMemo(() => [...leadingItems, ...regionItems], [leadingItems, regionItems]);
  const [activeRegionId, setActiveRegionId] = useState("");
  const [activeProvinceId, setActiveProvinceId] = useState("");

  const activeRegion = regionItems.find((region) => region.id === activeRegionId) ?? null;
  const activeProvince = activeRegion?.children.find((province) => province.id === activeProvinceId) ?? activeRegion?.children[0] ?? null;

  const openRegion = (region: MenuNode) => {
    setActiveRegionId(region.id);
    setActiveProvinceId(region.children[0]?.id ?? "");
  };

  const closeMenu = () => {
    setActiveRegionId("");
    setActiveProvinceId("");
  };

  return (
    <div className="relative z-[100] min-w-0 flex-1" onMouseLeave={closeMenu}>
      <nav className="hidden min-w-0 items-center gap-1 lg:flex" aria-label="Primary navigation">
        <div className="flex shrink-0 items-center gap-1">
          {leadingItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex min-h-12 items-center whitespace-nowrap border-b-2 border-transparent px-3 text-sm font-black uppercase text-slate-800 transition hover:border-red-700 hover:text-red-700 focus:border-red-700 focus:text-red-700 focus:outline-none"
              onFocus={closeMenu}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
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
              className={`flex min-h-12 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-black uppercase transition focus:outline-none ${
                activeRegionId === region.id
                  ? "border-red-700 text-red-700"
                  : "border-transparent text-slate-800 hover:border-red-700 hover:text-red-700 focus:border-red-700 focus:text-red-700"
              }`}
            >
              <span>{region.label}</span>
              <span aria-hidden="true" className="text-red-700">+</span>
            </Link>
          ))}
        </div>
      </nav>

      {activeRegion ? (
        <div
          className="absolute left-0 top-full z-[1000] hidden w-[min(860px,calc(100vw-2rem))] translate-y-0 overflow-hidden border border-slate-200 bg-white opacity-100 shadow-2xl ring-1 ring-slate-950/5 transition duration-150 ease-out lg:grid lg:grid-cols-[300px_minmax(0,1fr)]"
          onMouseEnter={() => {
            setActiveRegionId(activeRegion.id);
            setActiveProvinceId(activeProvince?.id ?? activeRegion.children[0]?.id ?? "");
          }}
          role="menu"
        >
          <div className="max-h-[72vh] overflow-y-auto border-r border-slate-200 bg-slate-50 p-2">
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

          <div className="max-h-[72vh] overflow-y-auto p-5">
            {activeProvince ? (
              <>
                <Link
                  dir="auto"
                  href={activeProvince.href}
                  className="text-xl font-black text-slate-950 transition hover:text-red-700 focus:text-red-700 focus:outline-none"
                >
                  {activeProvince.label}
                </Link>
                <div className="mt-4 grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
                  {activeProvince.children.map((commune) => (
                    <Link
                      key={commune.id}
                      dir="auto"
                      href={commune.href}
                      className="rounded-md px-3 py-2 text-sm font-bold leading-5 text-slate-700 transition hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 focus:outline-none"
                    >
                      {commune.label}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm font-bold text-slate-500">No provinces are available for this region.</p>
            )}
          </div>
        </div>
      ) : null}

      <nav className="w-full lg:hidden" aria-label="Mobile primary navigation">
        <ul className="grid gap-1 py-2">
          {mobileItems.map((item) => (
            <MobileBranch key={item.id} node={item} depth={0} />
          ))}
        </ul>
      </nav>
    </div>
  );
}
