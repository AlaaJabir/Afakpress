import Link from "next/link";
import type { MoroccoRegion } from "@/data/morocco-regions";

export function MegaMenu({ regions }: { regions: MoroccoRegion[] }) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-2 text-sm font-bold transition hover:text-red-700" type="button">
        Regions
        <span aria-hidden="true">+</span>
      </button>
      <div className="invisible absolute right-0 top-full w-[720px] translate-y-3 border border-slate-200 bg-white p-6 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="grid grid-cols-3 gap-5">
          {regions.map((region) => (
            <div key={region.slug}>
              <Link href={`/region/${region.slug}`} className="font-black text-slate-950 hover:text-red-700">
                {region.name}
              </Link>
              <div className="mt-2 space-y-2">
                {region.provinces.slice(0, 2).map((province) => (
                  <div key={province.slug} className="text-xs text-slate-600">
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
  );
}

