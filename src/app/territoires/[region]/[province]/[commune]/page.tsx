import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TerritoriesHeader } from "@/components/territories/TerritoriesHeader";
import { TerritoriesFooter } from "@/components/territories/TerritoriesFooter";
import { OfficialsList } from "@/components/territories/OfficialsList";
import { TerritoryNews } from "@/components/territories/TerritoryNews";
import {
  getRegionBySlug,
  getProvinceBySlug,
  getCommuneBySlug,
  getCommunesForProvince,
} from "@/lib/territories-data";
import { getOfficialsForTerritory, getNewsForTerritory } from "@/lib/territories-db";

interface PageProps {
  params: Promise<{ region: string; province: string; commune: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: regionSlug, province: provinceSlug, commune: communeSlug } = await params;
  const region = getRegionBySlug(regionSlug);
  const province = region ? getProvinceBySlug(region.slug, provinceSlug) : null;
  const commune = province ? getCommuneBySlug(region!.slug, province.slug, communeSlug) : null;

  if (!region || !province || !commune) return { title: "Commune non trouvée | Afakpress" };

  return {
    title: `Commune de ${commune.nameFr} (${commune.nameAr}) — Province de ${province.nameFr} | Afakpress`,
    description: `Découvrez la commune de ${commune.nameFr}, ses élus municipaux, ses coordonnées et son actualité locale dans la province de ${province.nameFr}.`,
  };
}

export default async function CommuneDetailPage({ params }: PageProps) {
  const { region: regionSlug, province: provinceSlug, commune: communeSlug } = await params;
  const region = getRegionBySlug(regionSlug);
  if (!region) notFound();

  const province = getProvinceBySlug(region.slug, provinceSlug);
  if (!province) notFound();

  const commune = getCommuneBySlug(region.slug, province.slug, communeSlug);
  if (!commune) notFound();

  const [officials, news] = await Promise.all([
    getOfficialsForTerritory({
      territoryType: "commune",
      regionSlug: region.slug,
      provinceSlug: province.slug,
      communeSlug: commune.slug,
    }),
    getNewsForTerritory({
      territoryType: "commune",
      regionSlug: region.slug,
      provinceSlug: province.slug,
      communeSlug: commune.slug,
      limit: 4,
    }),
  ]);

  const allCommunes = getCommunesForProvince(region.slug, province.slug);
  const otherCommunes = allCommunes.filter((c) => c.slug !== commune.slug).slice(0, 5);
  const kindLabel = commune.kind === "urbaine" ? "Commune urbaine" : "Commune rurale";

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
          <li>
            <Link href={`/territoires/${region.slug}/${province.slug}`} className="hover:text-[#A8472F] transition">
              {province.nameFr}
            </Link>
          </li>
          <li aria-hidden="true" className="text-[#CFC5B1]">›</li>
          <li aria-current="page" className="font-semibold text-[#1B2A41]">
            Commune de {commune.nameFr}
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-8 sm:px-8 lg:px-20">
        <div className="border-b border-[#E0D8C8] pb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#A8472F]">
            {kindLabel} · Province de {province.nameFr}
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#1B2A41] mt-2">
            {commune.nameFr}
          </h1>
          <p dir="rtl" className="font-sans text-2xl sm:text-3xl text-[#5B6472] mt-2 text-right sm:text-left">
            {commune.nameAr}
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-xl border border-[#E0D8C8] bg-white px-5 py-3 text-sm">
              <span className="text-xs font-semibold text-[#5B6472] uppercase block">Population</span>
              <span className="font-serif text-xl font-bold text-[#1B2A41] tabular-nums">
                {commune.population.toLocaleString("fr-FR")} habitants
              </span>
            </div>
            <div className="rounded-xl border border-[#E0D8C8] bg-white px-5 py-3 text-sm">
              <span className="text-xs font-semibold text-[#5B6472] uppercase block">Type de commune</span>
              <span className="font-serif text-xl font-bold text-[#1B2A41] capitalize">
                {commune.kind}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Officials Section */}
      <OfficialsList
        title="À la tête de la commune"
        subtitle="Présidence du Conseil communal"
        officials={officials}
        territoryTitle={commune.nameFr}
      />

      {/* 2-Column: Left News & Right Practical Info */}
      <div className="px-4 py-12 sm:px-8 lg:px-20 border-t border-[#E0D8C8] flex flex-wrap gap-10 items-start">
        {/* Left Column: News */}
        <div className="flex-1 min-w-[320px]">
          <TerritoryNews
            title={`Actualités de la commune de ${commune.nameFr}`}
            articles={news}
            territoryName={commune.nameFr}
          />
        </div>

        {/* Right Sidebar: Practical Info & In the same province */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          {/* Practical Info Card */}
          <div className="rounded-2xl border border-[#E0D8C8] bg-white p-6 shadow-2xs">
            <h3 className="font-serif text-xl font-bold text-[#1B2A41] mb-4">
              Informations pratiques
            </h3>
            <dl className="flex flex-col gap-4 text-sm">
              <div>
                <dt className="text-xs text-[#5B6472] uppercase tracking-wider font-semibold">
                  Siège de la commune
                </dt>
                <dd className="mt-1 font-medium text-[#1B2A41]">
                  {commune.address || `Hôtel de Ville / Siège communal, ${commune.nameFr}`}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#5B6472] uppercase tracking-wider font-semibold">
                  Téléphone
                </dt>
                <dd className="mt-1 font-medium text-[#1B2A41] tabular-nums">
                  {commune.phone || "+212 5 37 00 00 00"}
                </dd>
              </div>
              {commune.website ? (
                <div>
                  <dt className="text-xs text-[#5B6472] uppercase tracking-wider font-semibold">
                    Site officiel
                  </dt>
                  <dd className="mt-1 font-medium text-[#A8472F] truncate">
                    <a href={commune.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {commune.website}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          {/* In the same province card */}
          {otherCommunes.length > 0 ? (
            <div className="rounded-2xl bg-[#EFE9DB] p-6 shadow-2xs">
              <h3 className="font-serif text-xl font-bold text-[#1B2A41] mb-3">
                Dans la même province
              </h3>
              <div className="divide-y divide-[#E0D8C8]/80">
                {otherCommunes.map((other) => (
                  <Link
                    key={other.slug}
                    href={`/territoires/${region.slug}/${province.slug}/${encodeURIComponent(other.slug)}`}
                    className="flex items-center justify-between py-2.5 text-sm font-semibold text-[#1B2A41] hover:text-[#A8472F] transition"
                  >
                    <span>{other.nameFr}</span>
                    <span className="text-[#A8472F]" aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
              <Link
                href={`/territoires/${region.slug}/${province.slug}#communes`}
                className="mt-4 inline-flex items-center text-xs font-bold text-[#A8472F] hover:underline"
              >
                Toutes les communes de {province.nameFr} →
              </Link>
            </div>
          ) : null}
        </aside>
      </div>

      <TerritoriesFooter />
    </div>
  );
}
