import Link from "next/link";
import { categories } from "@/data/articles";
import { moroccoRegions } from "@/data/morocco-regions";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="text-3xl font-black uppercase text-white">Afakpress</p>
          <p className="mt-4 max-w-md text-sm leading-7">Moroccan press and regional news platform covering national affairs, local development, economy, culture, and civic life.</p>
        </div>
        <div>
          <h3 className="font-black uppercase text-white">Categories</h3>
          <div className="mt-4 grid gap-2 text-sm">
            {categories.map((category) => (
              <Link key={category.slug} href={`/category/${category.slug}`} className="hover:text-white">
                {category.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-black uppercase text-white">Regions</h3>
          <div className="mt-4 grid gap-2 text-sm">
            {moroccoRegions.slice(0, 6).map((region) => (
              <Link key={region.slug} href={`/region/${region.slug}`} className="hover:text-white">
                {region.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

