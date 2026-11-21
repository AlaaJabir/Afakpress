import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TerritoriesHeader } from "@/components/territories/TerritoriesHeader";
import { TerritoriesFooter } from "@/components/territories/TerritoriesFooter";
import { OfficialsList, ParliamentariansRow } from "@/components/territories/OfficialsList";
import { TerritoryNews } from "@/components/territories/TerritoryNews";
import {
  getRegionBySlug,
  getProvinceBySlug,
  getCommunesForProvince,
} from "@/lib/territories-data";
import { getOfficialsForTerritory, getNewsForTerritory } from "@/lib/territories-db";
import { ProvinceCommunesList } from "./ProvinceCommunesList";

interface PageProps {
  params: Promise<{ region: string; province: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: regionSlug, province: provinceSlug } = await params;
  const region = getRegionBySlug(regionSlug);
  const province = region ? getProvinceBySlug(region.slug, provinceSlug) : null;
  if (!region || !province) return { title: "Province non trouvée | Afakpress" };

  const kindLabel = province.kind === "prefecture" ? "Préfecture" : "Province";
  return {
    title: `${kindLabel} de ${province.nameFr} (${province.nameAr}) — Élus, Communes et Actualités | Afakpress`,
    description: `Découvrez les élus, les parlementaires, les communes et l'actualité de la ${kindLabel.toLowerCase()} de ${province.nameFr} dans la région ${region.nameFr}.`,
  };
}

export default async function ProvinceDetailPage({ params }: PageProps) {
  const { region: regionSlug, province: provinceSlug } = await params;
  const region = getRegionBySlug(regionSlug);
  if (!region) notFound();

  const province = getProvinceBySlug(region.slug, provinceSlug);
  if (!province) notFound();

  const [officials, news] = await Promise.all([
    getOfficialsForTerritory({
      territoryType: "province",
      regionSlug: region.slug,
      provinceSlug: province.slug,
    }),
    getNewsForTerritory({
      territoryType: "province",
      regionSlug: region.slug,
      provinceSlug: province.slug,
      limit: 6,
    }),
  ]);

  const communes = getCommunesForProvince(region.slug, province.slug);
  const kindLabel = province.kind === "prefecture" ? "Préfecture" : "Province";

  // Separate council executive officials from parliamentary members
  const executiveOfficials = officials.filter((o) => o.house !== "chambre_representants" && o.house !== "chambre_conseillers");
  const parliamentarians = officials.filter((o) => o.house === "chambre_representants" || o.house === "chambre_conseillers");

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
          <li>
            <Link href={`/territoires/${region.slug}`} className="hover:text-[#A8472F] transition">
              {region.nameFr}
            </Link>
          </li>
          <li aria-hidden="true" className="text-[#CFC5B1]">›</li>
          <li aria-current="page" className="font-semibold text-[#1B2A41]">
            {province.nameFr}
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-8 sm:px-8 lg:px-20">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[#E0D8C8] pb-10">
          <div className="flex-1 min-w-[300px]">
            <p className="text-xs font-bold uppercase tracking-widest text-[#A8472F]">
              {kindLabel} · Région {region.nameFr}
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#1B2A41] mt-2">
              {province.nameFr}
            </h1>
            <p dir="rtl" className="font-sans text-2xl sm:text-3xl text-[#5B6472] mt-2 text-right sm:text-left">
              {province.nameAr}
            </p>
          </div>

          {/* Key Figures Badges */}
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="rounded-2xl border border-[#E0D8C8] bg-white px-5 py-4 min-w-[130px] text-center shadow-2xs">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A41] tabular-nums block">
                {communes.length || province.communesCount}
              </span>
              <span className="text-xs font-semibold text-[#5B6472] uppercase tracking-wider mt-1 block">
                Communes
              </span>
            </div>

            <div className="rounded-2xl border border-[#E0D8C8] bg-white px-5 py-4 min-w-[130px] text-center shadow-2xs">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A41] tabular-nums block">
                {(province.population / 1000).toLocaleString("fr-FR")}
              </span>
              <span className="text-xs font-semibold text-[#5B6472] uppercase tracking-wider mt-1 block">
                Habitants
              </span>
            </div>
          </div>
        </div>

        {/* In-page anchors */}
        <div className="flex gap-6 pt-5 text-sm font-semibold">
          <a href="#elus" className="text-[#1B2A41] hover:text-[#A8472F] transition">
            Élus de la province ↓
          </a>
          <a href="#communes" className="text-[#1B2A41] hover:text-[#A8472F] transition">
            Communes ↓
          </a>
          <a href="#actus" className="text-[#1B2A41] hover:text-[#A8472F] transition">
            Actualités ↓
          </a>
        </div>
      </section>

      {/* 1. Officials Section */}
      <OfficialsList
        title={`À la tête de la ${kindLabel.toLowerCase()}`}
        subtitle={`Gouverneur et Présidence du Conseil de la ${kindLabel.toLowerCase()}`}
        officials={executiveOfficials.length > 0 ? executiveOfficials : officials}
        territoryTitle={province.nameFr}
      />

      {/* Parliamentarians Row */}
      {parliamentarians.length > 0 ? (
        <ParliamentariansRow officials={parliamentarians} />
      ) : null}

      {/* 2. Interactive Communes List (Client filter / search) */}
      <ProvinceCommunesList
        communes={communes}
        regionSlug={region.slug}
        provinceSlug={province.slug}
      />

      {/* 3. News Section */}
      <TerritoryNews
        title={`Actualités de la ${kindLabel.toLowerCase()} de ${province.nameFr}`}
        articles={news}
        territoryName={province.nameFr}
      />

      <TerritoriesFooter />
    </div>
  );
}
