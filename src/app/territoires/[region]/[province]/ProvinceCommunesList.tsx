"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TerritoryCommune } from "@/lib/territories-data";

interface ProvinceCommunesListProps {
  communes: TerritoryCommune[];
  regionSlug: string;
  provinceSlug: string;
}

export function ProvinceCommunesList({
  communes,
  regionSlug,
  provinceSlug,
}: ProvinceCommunesListProps) {
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "urbaine" | "rurale">("all");

  const filtered = useMemo(() => {
    return communes.filter((c) => {
      const matchKind = kindFilter === "all" || c.kind === kindFilter;
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.nameFr.toLowerCase().includes(search.toLowerCase()) ||
        c.nameAr.includes(search);
      return matchKind && matchSearch;
    });
  }, [communes, search, kindFilter]);

  return (
    <section id="communes" className="px-4 py-12 sm:px-8 lg:px-20 border-t border-[#E0D8C8]">
      {/* Header and Search */}
      <div className="flex flex-wrap items-end justify-between gap-6 mb-6">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-[#1B2A41]">
            Communes de la province
          </h2>
          <p className="mt-1 text-sm text-[#5B6472]">
            Trouvez une commune par son nom, son statut urbain ou rural.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex-1 min-w-[260px] max-w-sm">
          <label htmlFor="filter-communes" className="sr-only">
            Filtrer les communes
          </label>
          <input
            id="filter-communes"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer les communes..."
            className="w-full min-h-12 rounded-xl border border-[#CFC5B1] bg-white px-4 text-sm text-[#1B2A41] shadow-2xs placeholder:text-[#5B6472]/60 focus:border-[#A8472F] focus:outline-none focus:ring-2 focus:ring-[#A8472F]/20"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Type de commune">
        <button
          type="button"
          onClick={() => setKindFilter("all")}
          className={`min-h-10 px-4 py-1.5 rounded-full text-sm font-semibold transition cursor-pointer ${
            kindFilter === "all"
              ? "bg-[#1B2A41] text-[#F6F2EA]"
              : "bg-transparent text-[#1B2A41] border border-[#CFC5B1] hover:bg-black/5"
          }`}
        >
          Toutes ({communes.length})
        </button>
        <button
          type="button"
          onClick={() => setKindFilter("urbaine")}
          className={`min-h-10 px-4 py-1.5 rounded-full text-sm font-semibold transition cursor-pointer ${
            kindFilter === "urbaine"
              ? "bg-[#1B2A41] text-[#F6F2EA]"
              : "bg-transparent text-[#1B2A41] border border-[#CFC5B1] hover:bg-black/5"
          }`}
        >
          Urbaines ({communes.filter((c) => c.kind === "urbaine").length})
        </button>
        <button
          type="button"
          onClick={() => setKindFilter("rurale")}
          className={`min-h-10 px-4 py-1.5 rounded-full text-sm font-semibold transition cursor-pointer ${
            kindFilter === "rurale"
              ? "bg-[#1B2A41] text-[#F6F2EA]"
              : "bg-transparent text-[#1B2A41] border border-[#CFC5B1] hover:bg-black/5"
          }`}
        >
          Rurales ({communes.filter((c) => c.kind === "rurale").length})
        </button>
      </div>

      {/* Communes Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#CFC5B1] bg-white/70 p-8 text-center text-[#5B6472]">
          Aucune commune ne correspond à votre recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((c) => (
            <Link
              key={c.slug}
              href={`/territoires/${regionSlug}/${provinceSlug}/${encodeURIComponent(c.slug)}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-[#E0D8C8] bg-white p-4 transition duration-200 hover:border-[#A8472F] hover:shadow-xs"
            >
              <div className="min-w-0">
                <h4 className="font-serif text-lg font-bold text-[#1B2A41] group-hover:text-[#A8472F] transition line-clamp-1">
                  {c.nameFr}
                </h4>
                <p className="text-xs text-[#5B6472] mt-0.5 capitalize">
                  {c.kind === "urbaine" ? "Commune urbaine" : "Commune rurale"}
                </p>
              </div>
              <span className="text-[#A8472F] group-hover:translate-x-1 transition-transform" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
