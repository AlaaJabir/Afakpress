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

function nodeId(prefix: string, fallback: string, id?: string) {
  return `${prefix}-${id || fallback}`;
}

function regionNodes(regions: RegionSource[]): MenuNode[] {
  return regions.map((region) => ({
    id: nodeId("region", region.slug, "id" in region ? region.id : undefined),
    label: region.name,
    href: `/region/${region.slug}`,
    children: region.provinces.map((province) => ({
      id: nodeId("province", `${region.slug}-${province.slug}`, "id" in province ? province.id : undefined),
      label: province.name,
      href: `/province/${province.slug}`,
      children: province.communes.map((commune) => ({
        id: nodeId("commune", `${region.slug}-${province.slug}-${commune.slug}`, "id" in commune ? commune.id : undefined),
        label: commune.name,
        href: `/commune/${commune.slug}`,
        children: [],
      })),
    })),
  }));
}

function trimPath(path: string[], depth: number, id: string) {
  return [...path.slice(0, depth), id];
}

function DesktopBranch({
  node,
  depth,
  openPath,
  setOpenPath,
}: {
  node: MenuNode;
  depth: number;
  openPath: string[];
  setOpenPath: (path: string[]) => void;
}) {
  const isOpen = openPath[depth] === node.id;
  const hasChildren = node.children.length > 0;

  const open = () => setOpenPath(trimPath(openPath, depth, node.id));
  const closeFromRoot = () => {
    if (depth === 0) setOpenPath([]);
  };

  return (
    <li
      className={depth === 0 ? "relative" : "relative"}
      onMouseEnter={open}
      onMouseLeave={closeFromRoot}
    >
      <Link
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-haspopup={hasChildren ? "menu" : undefined}
        dir="auto"
        href={node.href}
        onFocus={open}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpenPath([]);
            event.currentTarget.blur();
          }
          if ((event.key === "ArrowDown" || event.key === "ArrowRight") && hasChildren) {
            event.preventDefault();
            open();
          }
        }}
        className={
          depth === 0
            ? "flex min-h-12 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 text-sm font-black uppercase text-slate-800 transition hover:border-red-700 hover:text-red-700 focus:border-red-700 focus:text-red-700 focus:outline-none"
            : "flex min-h-10 items-center justify-between gap-4 rounded-md px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 focus:outline-none"
        }
      >
        <span>{node.label}</span>
        {hasChildren ? <span aria-hidden="true" className="text-red-700">{depth === 0 ? "+" : ">"}</span> : null}
      </Link>
      {hasChildren ? (
        <div
          className={[
            "absolute z-50 border border-slate-200 bg-white opacity-0 shadow-2xl transition duration-150 ease-out",
            isOpen ? "pointer-events-auto visible translate-x-0 translate-y-0 opacity-100" : "pointer-events-none invisible",
            depth === 0
              ? "left-0 top-full max-h-[76vh] w-[min(360px,calc(100vw-2rem))] translate-y-2 overflow-y-auto p-2"
              : "left-full top-0 max-h-[70vh] w-[min(320px,calc(100vw-2rem))] translate-x-2 overflow-y-auto p-2",
          ].join(" ")}
          onMouseEnter={open}
        >
          <ul className="grid gap-1" role="menu">
            {node.children.map((child) => (
              <DesktopBranch key={child.id} node={child} depth={depth + 1} openPath={openPath} setOpenPath={setOpenPath} />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
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
  const [openPath, setOpenPath] = useState<string[]>([]);
  const items = useMemo(() => [...leadingItems, ...regionNodes(regions)], [leadingItems, regions]);

  return (
    <>
      <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex" aria-label="Primary navigation" onMouseLeave={() => setOpenPath([])}>
        <ul className="flex min-w-0 items-center gap-1">
          {items.map((item) => (
            <DesktopBranch key={item.id} node={item} depth={0} openPath={openPath} setOpenPath={setOpenPath} />
          ))}
        </ul>
      </nav>
      <nav className="w-full lg:hidden" aria-label="Mobile primary navigation">
        <ul className="grid gap-1 py-2">
          {items.map((item) => (
            <MobileBranch key={item.id} node={item} depth={0} />
          ))}
        </ul>
      </nav>
    </>
  );
}
