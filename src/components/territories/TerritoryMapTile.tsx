"use client";

import Link from "next/link";
import { useState } from "react";
import { REGIONS_12_METADATA, type OfficialProfile } from "@/lib/territories-data";

interface TerritoryMapTileProps {
  initialRegionId?: string;
  officials?: OfficialProfile[];
}

export function TerritoryMapTile({ initialRegionId = "rsk", officials = [] }: TerritoryMapTileProps) {
  const [selectedId, setSelectedId] = useState<string>(initialRegionId);

  const selectedRegion =
    REGIONS_12_METADATA.find((r) => r.id === selectedId) || REGIONS_12_METADATA[2];

  const regionOfficials = officials.filter(
    (o) => o.territoryType === "region" && (o.regionSlug === selectedRegion.slug || !o.regionSlug)
  );

  return (
    <section id="carte" className="px-4 py-8 sm:px-8 lg:px-20 bg-[#F6F2EA]">
      <div className="flex flex-wrap items-start justify-between gap-10 lg:gap-14">
        {/* Left: Schematic Grid */}
        <div className="flex-1 min-w-[320px] max-w-2xl">
          <h2 className="font-serif text-3xl font-semibold text-[#1B2A41]">
            Carte des régions
          </h2>
          <p className="mt-1 mb-6 text-sm text-[#5B6472]">
            Carte schématique : une tuile par région, placée selon sa position géographique au Maroc.
          </p>

          <div className="grid grid-cols-5 gap-2 auto-rows-[80px] sm:auto-rows-[86px] w-full max-w-[680px]">
            {REGIONS_12_METADATA.map((r) => {
              const isSelected = r.id === selectedId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  aria-pressed={isSelected}
                  style={{
                    gridColumn: r.col,
                    gridRow: r.row,
                  }}
                  className={`flex items-end p-3 rounded-2xl text-left font-semibold text-xs sm:text-[13px] leading-tight transition-all duration-200 cursor-pointer shadow-2xs ${
                    isSelected
                      ? "bg-[#1B2A41] text-[#F6F2EA] ring-2 ring-[#A8472F] ring-offset-2 ring-offset-[#F6F2EA] scale-[1.02] z-10"
                      : "bg-[#E6DECB] text-[#1B2A41] hover:bg-[#DDD4BF]"
                  }`}
                >
                  <span className="line-clamp-2">{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Preview Aside Panel */}
        <aside
          aria-live="polite"
          className="flex-1 min-w-[300px] max-w-md rounded-3xl border border-[#E0D8C8] bg-white p-7 sm:p-9 shadow-sm flex flex-col gap-6"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#A8472F]">
              Région sélectionnée
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A41] mt-1.5 leading-tight">
              {selectedRegion.name}
            </h3>
            <p dir="rtl" className="font-sans text-xl text-[#5B6472] mt-1.5">
              {selectedRegion.nameAr}
            </p>
          </div>

          {/* Key Figures Strip */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#F6F2EA] p-4 text-center">
            <div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-[#1B2A41] tabular-nums">
                {selectedRegion.provincesCount}
              </p>
              <p className="text-[11px] font-semibold text-[#5B6472] uppercase tracking-wider mt-0.5">
                Provinces
              </p>
            </div>
            <div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-[#1B2A41] tabular-nums">
                {selectedRegion.communesCount}
              </p>
              <p className="text-[11px] font-semibold text-[#5B6472] uppercase tracking-wider mt-0.5">
                Communes
              </p>
            </div>
            <div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-[#1B2A41] tabular-nums">
                {(selectedRegion.population / 1000000).toFixed(1)} M
              </p>
              <p className="text-[11px] font-semibold text-[#5B6472] uppercase tracking-wider mt-0.5">
                Habitants
              </p>
            </div>
          </div>

          {/* Officials snippet if available */}
          <div className="border-t border-[#E0D8C8] pt-4">
            <p className="text-xs font-semibold text-[#5B6472] uppercase tracking-wider mb-2">
              À la tête de la région
            </p>
            <div className="flex items-center gap-3">
              <div
                className="size-11 shrink-0 rounded-full bg-[#E0D8C8] flex items-center justify-center font-serif text-sm font-bold text-[#1B2A41]/60"
                style={{
                  background: "repeating-linear-gradient(135deg, #E0D8C8 0 5px, #EBE4D6 5px 10px)",
                }}
              >
                CR
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1B2A41] line-clamp-1">
                  {regionOfficials[0]?.fullName || "Conseil Régional"}
                </p>
                <p className="text-xs text-[#5B6472] line-clamp-1">
                  {regionOfficials[0]?.role || "Présidence du Conseil de la région"}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Link to Region Page */}
          <Link
            href={`/territoires/${selectedRegion.slug}`}
            className="flex min-h-12 items-center justify-center rounded-xl bg-[#A8472F] px-6 text-sm font-bold text-white shadow-xs transition hover:bg-[#7E3220] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8472F]"
          >
            Découvrir la région {selectedRegion.name} →
          </Link>
        </aside>
      </div>
    </section>
  );
}
