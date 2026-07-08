import Link from "next/link";
import { moroccoRegions } from "@/data/morocco-regions";
import { MegaMenu } from "./MegaMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex min-h-24 flex-col justify-center gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex flex-col">
            <span className="text-4xl font-black uppercase tracking-normal text-slate-950 md:text-5xl">Afakpress</span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-[0.28em] text-red-700">Journal regional marocain</span>
          </Link>
          <div className="flex flex-wrap items-center gap-1 text-xs font-black uppercase tracking-[0.08em] text-slate-600 md:gap-2">
            <Link href="/category/national" className="border border-transparent px-3 py-2 transition hover:border-red-200 hover:text-red-700">À la une</Link>
            <Link href="/#newsletter" className="border border-transparent px-3 py-2 transition hover:border-red-200 hover:text-red-700">Newsletter</Link>
            <Link href="/admin" className="border border-slate-300 px-3 py-2 text-slate-900 transition hover:border-red-700 hover:text-red-700">Espace rédaction</Link>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <MegaMenu regions={moroccoRegions} />
        </div>
      </div>
    </header>
  );
}
