import type { Metadata } from "next";
import Link from "next/link";
import { TerritoriesHeader } from "@/components/territories/TerritoriesHeader";
import { TerritoriesFooter } from "@/components/territories/TerritoriesFooter";
import { TerritoryMapTile } from "@/components/territories/TerritoryMapTile";
import { getOfficialsForTerritory } from "@/lib/territories-db";

import { searchTerritories } from "@/lib/territories-data";

export const metadata: Metadata = {
  title: "Territoires du Maroc — Régions, Provinces et Communes | Afakpress",
  description: "Découvrez les 12 régions du Maroc, leurs provinces, leurs communes, leurs élus et leur actualité locale.",
};

interface HomePageProps {
  searchParams?: Promise<{ q?: string }>;
}

export default async function TerritoiresHomePage({ searchParams }: HomePageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams?.q?.trim() || "";
  const searchResults = query ? searchTerritories(query) : [];
  const officials = await getOfficialsForTerritory({ territoryType: "region" });

  const levels = [
    {
      n: "01",
      title: "Région",
      elus: "Élus : le ou les présidents du Conseil de la région et le Wali.",
      next: "Puis : actualités de la région et liste de ses provinces et préfectures.",
      href: "/territoires/rabat-sale-kenitra",
    },
    {
      n: "02",
      title: "Province",
      elus: "Élus : le gouverneur, le président du Conseil provincial, et les parlementaires.",
      next: "Puis : liste des communes et actualités de la province.",
      href: "/territoires/rabat-sale-kenitra/kenitra",
    },
    {
      n: "03",
      title: "Commune",
      elus: "Élus : le président du Conseil communal et l’équipe municipale.",
      next: "Puis : actualités de la commune, services et informations pratiques.",
      href: "/territoires/rabat-sale-kenitra/kenitra/kenitra",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#1B2A41] font-sans">
      <TerritoriesHeader />

      {/* Hero Section */}
      <section className="px-4 pt-12 pb-8 sm:px-8 lg:px-20 max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-widest text-[#A8472F] mb-3">
          12 régions · provinces · communes
        </p>
        <h1 className="font-serif text-4xl sm:text-6xl font-medium tracking-tight text-[#1B2A41] leading-[1.08]">
          Choisissez un territoire.
          <br />
          Rencontrez ceux qui le dirigent.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#5B6472] leading-relaxed max-w-2xl">
          Pour chaque région, province et commune du Royaume : les élus en place et l’actualité locale, au même endroit.
        </p>

        {/* Global Quick Search across regions */}
        <div className="mt-8">
          <form
            action="/territoires"
            method="get"
            className="flex flex-wrap items-center gap-3"
          >
            <div className="relative flex-1 min-w-[280px]">
              <label htmlFor="search-territory" className="sr-only">
                Rechercher une région, province ou commune
              </label>
              <input
                id="search-territory"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Rechercher une région, province ou commune..."
                className="w-full min-h-13 rounded-xl border border-[#CFC5B1] bg-white px-5 text-sm sm:text-base text-[#1B2A41] shadow-2xs placeholder:text-[#5B6472]/60 focus:border-[#A8472F] focus:outline-none focus:ring-2 focus:ring-[#A8472F]/20"
              />
            </div>
            <button
              type="submit"
              className="min-h-13 rounded-xl bg-[#A8472F] px-7 text-sm sm:text-base font-semibold text-white transition hover:bg-[#7E3220] cursor-pointer"
            >
              Rechercher
            </button>
          </form>

          {query ? (
            <div className="mt-5 rounded-2xl border border-[#E0D8C8] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between gap-4 border-b border-[#E0D8C8] pb-3 mb-3">
                <p className="text-sm font-semibold text-[#1B2A41]">
                  Résultats pour « {query} » ({searchResults.length})
                </p>
                <Link href="/territoires" className="text-xs font-bold text-[#A8472F] hover:underline">
                  Réinitialiser
                </Link>
              </div>
              {searchResults.length === 0 ? (
                <p className="text-sm text-[#5B6472]">Aucun territoire trouvé pour cette recherche.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {searchResults.map((res) => (
                    <Link
                      key={res.href}
                      href={res.href}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#E0D8C8] p-3 hover:border-[#A8472F] transition"
                    >
                      <div className="min-w-0">
                        <p className="font-serif font-bold text-base text-[#1B2A41] truncate">{res.label}</p>
                        <p className="text-xs text-[#5B6472] truncate">{res.sublabel}</p>
                      </div>
                      <span className="text-xs font-bold uppercase text-[#A8472F] shrink-0">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {/* Interactive Schematic Tile-Map + Aside Preview */}
      <TerritoryMapTile initialRegionId="rsk" officials={officials} />

      {/* Three Levels Explainer Section */}
      <section id="niveaux" className="px-4 py-16 sm:px-8 lg:px-20 border-t border-[#E0D8C8]">
        <div className="max-w-3xl mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1B2A41]">
            Trois niveaux, une même logique
          </h2>
          <p className="mt-2 text-base text-[#5B6472]">
            À chaque échelon administratif, la page s’ouvre sur les élus en fonction, puis détaille le territoire et son actualité.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map((lvl) => (
            <Link
              key={lvl.n}
              href={lvl.href}
              className="group flex flex-col justify-between rounded-2xl border border-[#E0D8C8] bg-white p-7 transition duration-200 hover:border-[#A8472F] hover:shadow-md cursor-pointer"
            >
              <div>
                <span className="font-serif text-3xl font-bold text-[#A8472F]/50 group-hover:text-[#A8472F] transition">
                  {lvl.n}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1B2A41] mt-2 group-hover:text-[#A8472F] transition">
                  {lvl.title}
                </h3>
                <p className="mt-3 text-sm text-[#1B2A41] font-semibold leading-relaxed">
                  {lvl.elus}
                </p>
                <p className="mt-2 text-xs sm:text-sm text-[#5B6472] leading-relaxed">
                  {lvl.next}
                </p>
              </div>
              <span className="mt-6 inline-flex items-center text-sm font-bold text-[#A8472F] group-hover:translate-x-1 transition-transform">
                Explorer l’exemple →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <TerritoriesFooter />
    </div>
  );
}
