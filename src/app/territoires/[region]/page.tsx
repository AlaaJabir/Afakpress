import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TerritoriesHeader } from "@/components/territories/TerritoriesHeader";
import { TerritoriesFooter } from "@/components/territories/TerritoriesFooter";
import { OfficialsList } from "@/components/territories/OfficialsList";
import { TerritoryNews } from "@/components/territories/TerritoryNews";
import {
  getRegionBySlug,
  getProvincesForRegion,
  REGIONS_12_METADATA,
} from "@/lib/territories-data";
import { getOfficialsForTerritory, getNewsForTerritory } from "@/lib/territories-db";

interface PageProps {
  params: Promise<{ region: string }>;
}

export async function generateStaticParams() {
  return REGIONS_12_METADATA.map((r) => ({ region: r.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region } = await params;
  const data = getRegionBySlug(region);
  if (!data) return { title: "Région non trouvée | Afakpress" };

  return {
    title: `Région ${data.nameFr} (${data.nameAr}) — Élus, Provinces et Actualités | Afakpress`,
    description: `Découvrez les élus, les provinces et préfectures, et l'actualité de la région ${data.nameFr} au Maroc.`,
  };
}

export default async function RegionDetailPage({ params }: PageProps) {
  const { region: regionSlug } = await params;
  const region = getRegionBySlug(regionSlug);
  if (!region) notFound();

  const [officials, news] = await Promise.all([
    getOfficialsForTerritory({ territoryType: "region", regionSlug: region.slug }),
    getNewsForTerritory({ territoryType: "region", regionSlug: region.slug, limit: 6 }),
  ]);

  const provinces = getProvincesForRegion(region.slug);

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#1B2A41] font-sans">
      <TerritoriesHeader />

      {/* Breadcrumb */}
      <nav aria-label="Fil d’Ariane" className="px-4 pt-6 sm:px-8 lg:px-20 text-sm text-[#5B6472]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/territoires" className="hover:text-[#A8472F] transition">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true" className="text-[#CFC5B1]">›</li>
          <li aria-current="page" className="font-semibold text-[#1B2A41]">
            {region.nameFr}
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-8 sm:px-8 lg:px-20">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[#E0D8C8] pb-10">
          <div className="flex-1 min-w-[300px]">
            <p className="text-xs font-bold uppercase tracking-widest text-[#A8472F]">
              Région du Royaume du Maroc
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#1B2A41] mt-2">
              {region.nameFr}
            </h1>
            <p dir="rtl" className="font-sans text-2xl sm:text-3xl text-[#5B6472] mt-2 text-right sm:text-left">
              {region.nameAr}
            </p>
          </div>

          {/* Key Figures Badges */}
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="rounded-2xl border border-[#E0D8C8] bg-white px-5 py-4 min-w-[130px] text-center shadow-2xs">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A41] tabular-nums block">
                {provinces.length || region.provincesCount}
              </span>
              <span className="text-xs font-semibold text-[#5B6472] uppercase tracking-wider mt-1 block">
                Provinces & préfectures
              </span>
            </div>

            <div className="rounded-2xl border border-[#E0D8C8] bg-white px-5 py-4 min-w-[130px] text-center shadow-2xs">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A41] tabular-nums block">
                {region.communesCount}
              </span>
              <span className="text-xs font-semibold text-[#5B6472] uppercase tracking-wider mt-1 block">
                Communes
              </span>
            </div>

            <div className="rounded-2xl border border-[#E0D8C8] bg-white px-5 py-4 min-w-[130px] text-center shadow-2xs">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A41] tabular-nums block">
                {(region.population / 1000000).toFixed(2)} M
              </span>
              <span className="text-xs font-semibold text-[#5B6472] uppercase tracking-wider mt-1 block">
                Population estimée
              </span>
            </div>
          </div>
        </div>

        {/* In-page anchors */}
        <div className="flex gap-6 pt-5 text-sm font-semibold">
          <a href="#elus" className="text-[#1B2A41] hover:text-[#A8472F] transition">
            Élus de la région ↓
          </a>
          <a href="#provinces" className="text-[#1B2A41] hover:text-[#A8472F] transition">
            Provinces & préfectures ↓
          </a>
          <a href="#actus" className="text-[#1B2A41] hover:text-[#A8472F] transition">
            Actualités ↓
          </a>
        </div>
      </section>

      {/* 1. Officials Section */}
      <OfficialsList
        title="À la tête de la région"
        subtitle="Présidence du Conseil Régional et Représentation de l’État"
        officials={officials}
        territoryTitle={region.nameFr}
      />

      {/* 2. Provinces and Prefectures Grid */}
      <section id="provinces" className="px-4 py-12 sm:px-8 lg:px-20 border-t border-[#E0D8C8]">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-semibold text-[#1B2A41]">
            Provinces et préfectures
          </h2>
          <p className="mt-1 text-sm text-[#5B6472]">
            Choisissez un territoire pour découvrir ses élus, ses communes et son actualité.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {provinces.map((p) => {
            const kindLabel = p.kind === "prefecture" ? "Préfecture" : "Province";
            return (
              <Link
                key={p.slug}
                href={`/territoires/${region.slug}/${p.slug}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-[#E0D8C8] bg-white p-5 transition duration-200 hover:border-[#A8472F] hover:shadow-md cursor-pointer"
              >
                <div className="min-w-0">
                  <h3 className="font-serif text-xl font-bold text-[#1B2A41] group-hover:text-[#A8472F] transition line-clamp-1">
                    {p.nameFr}
                  </h3>
                  <p className="text-xs text-[#5B6472] mt-1 font-medium">
                    {kindLabel} · {p.communesCount} communes
                  </p>
                </div>
                <span className="text-[#A8472F] group-hover:translate-x-1 transition-transform text-lg" aria-hidden="true">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. News Section */}
      <TerritoryNews
        title={`Actualités de la région ${region.nameFr}`}
        articles={news}
        territoryName={region.nameFr}
      />

      <TerritoriesFooter />
    </div>
  );
}
