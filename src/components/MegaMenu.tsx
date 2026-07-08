import Link from "next/link";
import type { MoroccoRegion } from "@/data/morocco-regions";

export function MegaMenu({ regions }: { regions: MoroccoRegion[] }) {
  return (
    <>
      {regions.map((region) => (
        <div key={region.slug} className="group relative">
          <Link href={`/region/${region.slug}`} dir="auto" className="flex items-center gap-2 text-sm font-bold transition hover:text-red-700">
            {region.name}
            <span aria-hidden="true">+</span>
          </Link>
          <div className="invisible absolute right-0 top-full z-50 max-h-[75vh] w-[min(920px,calc(100vw-2rem))] translate-y-3 overflow-y-auto border border-slate-200 bg-white p-6 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
              {region.provinces.map((province) => (
                <div key={province.slug} dir="auto">
                  <Link href={`/region/${region.slug}`} className="font-black text-slate-950 hover:text-red-700">
                    {province.name}
                  </Link>
                  <div className="mt-2 grid gap-1">
                    {province.communes.map((commune) => (
                      <Link key={commune.slug} href={`/region/${region.slug}`} className="text-xs font-bold leading-5 text-slate-600 hover:text-red-700">
                        {commune.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
