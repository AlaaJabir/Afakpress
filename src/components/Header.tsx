import Link from "next/link";
import { categories } from "@/data/articles";
import { moroccoRegions } from "@/data/morocco-regions";
import { MegaMenu } from "./MegaMenu";

const navItems = [
  { label: "National", href: "/category/national" },
  { label: "Economy", href: "/category/economy" },
  { label: "Culture", href: "/category/culture" },
  { label: "Opinion", href: "/category/opinion" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-6">
          <Link href="/" className="flex flex-col">
            <span className="text-3xl font-black uppercase tracking-normal text-slate-950">Afakpress</span>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-red-700">Moroccan newsroom</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-700 lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-red-700">
                {item.label}
              </Link>
            ))}
            <MegaMenu regions={moroccoRegions} />
          </nav>
          <Link href="/admin" className="rounded-sm border border-slate-300 px-4 py-2 text-sm font-bold text-slate-900 transition hover:border-red-700 hover:text-red-700">
            Admin
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto border-t border-slate-100 py-3 text-sm font-semibold text-slate-600 lg:hidden">
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} className="shrink-0">
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

