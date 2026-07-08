import Link from "next/link";
import Image from "next/image";
import { moroccoRegions } from "@/data/morocco-regions";
import { MegaMenu } from "./MegaMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex min-h-24 flex-col justify-center gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="block h-[180px] w-[260px]" aria-label="Afakpress">
            <Image src="/afakpress-logo.png" alt="Afakpress" width={260} height={180} priority className="h-full w-full object-contain" />
          </Link>
          <div className="flex flex-wrap items-center gap-1 text-xs font-black uppercase tracking-[0.08em] text-slate-600 md:gap-2">
            <Link href="/category/national" className="border border-transparent px-3 py-2 transition hover:border-red-200 hover:text-red-700">À la une</Link>
            <Link href="/#newsletter" className="border border-transparent px-3 py-2 transition hover:border-red-200 hover:text-red-700">Newsletter</Link>
            <Link href="/admin/dashboard" className="border border-slate-300 px-3 py-2 text-slate-900 transition hover:border-red-700 hover:text-red-700">Espace rédaction</Link>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <MegaMenu regions={moroccoRegions} />
        </div>
      </div>
    </header>
  );
}
