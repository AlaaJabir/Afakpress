import { createServerSupabaseClient, createServiceSupabaseAdminClient } from "@/lib/supabase";
import {
  REGIONS_12_METADATA,
  INITIAL_OFFICIALS,
  normalizeTerritorySlug,
  getProvincesForRegion,
  getCommunesForProvince,
  type TerritoryRegion,
  type TerritoryProvince,
  type TerritoryCommune,
  type OfficialProfile,
  type TerritoryArticle,
  type TerritoryType,
} from "./territories-data";

// Fallback in-memory store for newly added officials during session if Supabase table is not yet migrated
let memoryOfficials: OfficialProfile[] = [...INITIAL_OFFICIALS];

interface OfficialDbRecord {
  id: string;
  territory_type: TerritoryType;
  region_id?: string | null;
  province_id?: string | null;
  commune_id?: string | null;
  region_slug?: string | null;
  province_slug?: string | null;
  commune_slug?: string | null;
  full_name: string;
  full_name_ar?: string | null;
  role: string;
  house?: "conseil" | "chambre_representants" | "chambre_conseillers" | null;
  party?: string | null;
  mandate_start?: string | null;
  mandate_end?: string | null;
  bio?: string | null;
  photo_path?: string | null;
  display_order?: number | null;
  is_published?: boolean | null;
}

async function resolveSupabaseTerritoryIds(
  client: NonNullable<ReturnType<typeof createServerSupabaseClient>>,
  params: { regionSlug?: string; provinceSlug?: string; communeSlug?: string }
): Promise<{ regionId?: string; provinceId?: string; communeId?: string }> {
  const result: { regionId?: string; provinceId?: string; communeId?: string } = {};
  try {
    if (params.regionSlug) {
      const regMeta = REGIONS_12_METADATA.find(
        (r) => r.slug === normalizeTerritorySlug(params.regionSlug || "")
      );
      const { data: regionsData } = await client.from("regions").select("id,name,slug");
      const regionsRows = (regionsData ?? []) as Array<{ id: string; name: string | null; slug: string | null }>;
      const matchedRegion = regionsRows.find(
        (r) =>
          (r.slug && normalizeTerritorySlug(r.slug) === normalizeTerritorySlug(params.regionSlug || "")) ||
          (regMeta && r.name && r.name.includes(regMeta.nameAr.split(" ")[0]))
      );
      if (matchedRegion) {
        result.regionId = matchedRegion.id;
      }
    }

    if (params.provinceSlug && result.regionId) {
      const { data: provData } = await client
        .from("provinces")
        .select("id,name,slug")
        .eq("region_id", result.regionId);
      const provRows = (provData ?? []) as Array<{ id: string; name: string | null; slug: string | null }>;
      const normP = normalizeTerritorySlug(params.provinceSlug);
      const matchedProv = provRows.find(
        (p) =>
          p.slug === params.provinceSlug ||
          (p.slug && normalizeTerritorySlug(p.slug) === normP)
      );
      if (matchedProv) {
        result.provinceId = matchedProv.id;
      }
    }

    if (params.communeSlug && result.provinceId) {
      const { data: commData } = await client
        .from("communes")
        .select("id,name,slug")
        .eq("province_id", result.provinceId);
      const commRows = (commData ?? []) as Array<{ id: string; name: string | null; slug: string | null }>;
      const normC = normalizeTerritorySlug(params.communeSlug);
      const matchedComm = commRows.find(
        (c) =>
          c.slug === params.communeSlug ||
          (c.slug && normalizeTerritorySlug(c.slug) === normC)
      );
      if (matchedComm) {
        result.communeId = matchedComm.id;
      }
    }
  } catch {
    // Ignore resolution errors if tables are empty
  }
  return result;
}

function matchesMemoryOfficial(
  o: OfficialProfile,
  territoryType: TerritoryType,
  normR?: string,
  normP?: string,
  normC?: string
): boolean {
  if (o.territoryType !== territoryType || !o.isPublished) return false;
  if (territoryType === "region") {
    return !normR || normalizeTerritorySlug(o.regionSlug || "") === normR;
  }
  if (territoryType === "province") {
    return !normP || normalizeTerritorySlug(o.provinceSlug || "") === normP;
  }
  if (territoryType === "commune") {
    return !normC || normalizeTerritorySlug(o.communeSlug || "") === normC;
  }
  return true;
}

export async function getOfficialsForTerritory(params: {
  territoryType: TerritoryType;
  regionSlug?: string;
  provinceSlug?: string;
  communeSlug?: string;
}): Promise<OfficialProfile[]> {
  const normR = params.regionSlug ? normalizeTerritorySlug(params.regionSlug) : undefined;
  const normP = params.provinceSlug ? normalizeTerritorySlug(params.provinceSlug) : undefined;
  const normC = params.communeSlug ? normalizeTerritorySlug(params.communeSlug) : undefined;

  let dbMatched: OfficialProfile[] = [];
  const client = createServerSupabaseClient();
  if (client) {
    try {
      const ids = await resolveSupabaseTerritoryIds(client, {
        regionSlug: normR,
        provinceSlug: normP,
        communeSlug: normC,
      });

      let query = client
        .from("officials")
        .select("*")
        .eq("territory_type", params.territoryType)
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (params.territoryType === "region" && ids.regionId) {
        query = query.eq("region_id", ids.regionId);
      } else if (params.territoryType === "province" && ids.provinceId) {
        query = query.eq("province_id", ids.provinceId);
      } else if (params.territoryType === "commune" && ids.communeId) {
        query = query.eq("commune_id", ids.communeId);
      }

      const { data, error } = await query;
      const rows = data as unknown as OfficialDbRecord[];
      if (!error && Array.isArray(rows) && rows.length > 0) {
        dbMatched = rows
          .filter((item) => {
            if (params.territoryType === "region" && normR && item.region_slug) {
              return normalizeTerritorySlug(item.region_slug) === normR;
            }
            if (params.territoryType === "province" && normP && item.province_slug) {
              return normalizeTerritorySlug(item.province_slug) === normP;
            }
            if (params.territoryType === "commune" && normC && item.commune_slug) {
              return normalizeTerritorySlug(item.commune_slug) === normC;
            }
            if (params.territoryType === "region" && normR && !ids.regionId && !item.region_slug) {
              return false;
            }
            if (params.territoryType === "province" && normP && !ids.provinceId && !item.province_slug) {
              return false;
            }
            if (params.territoryType === "commune" && normC && !ids.communeId && !item.commune_slug) {
              return false;
            }
            return true;
          })
          .map((item) => ({
            id: item.id,
            territoryType: item.territory_type,
            regionSlug: item.region_slug || normR,
            provinceSlug: item.province_slug || normP,
            communeSlug: item.commune_slug || normC,
            fullName: item.full_name,
            fullNameAr: item.full_name_ar || undefined,
            role: item.role,
            house: item.house || "conseil",
            party: item.party || undefined,
            mandateStart: item.mandate_start || "2021",
            mandateEnd: item.mandate_end || "2026",
            bio: item.bio || undefined,
            photoUrl: item.photo_path || undefined,
            displayOrder: item.display_order ?? 0,
            isPublished: Boolean(item.is_published),
          }));
      }
    } catch {
      // Fall through to memory / reference data
    }
  }

  if (dbMatched.length > 0) {
    return dbMatched;
  }

  const matched = memoryOfficials.filter((o) =>
    matchesMemoryOfficial(o, params.territoryType, normR, normP, normC)
  );

  return matched.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getAllOfficials(): Promise<OfficialProfile[]> {
  const client = createServerSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("officials")
        .select("*")
        .order("created_at", { ascending: false });
      const rows = data as unknown as OfficialDbRecord[];
      if (!error && Array.isArray(rows) && rows.length > 0) {
        return rows.map((item) => ({
          id: item.id,
          territoryType: item.territory_type,
          regionSlug: item.region_slug || undefined,
          provinceSlug: item.province_slug || undefined,
          communeSlug: item.commune_slug || undefined,
          fullName: item.full_name,
          fullNameAr: item.full_name_ar || undefined,
          role: item.role,
          house: item.house || "conseil",
          party: item.party || undefined,
          mandateStart: item.mandate_start || "2021",
          mandateEnd: item.mandate_end || "2026",
          bio: item.bio || undefined,
          photoUrl: item.photo_path || undefined,
          displayOrder: item.display_order ?? 0,
          isPublished: Boolean(item.is_published),
        }));
      }
    } catch {
      // Fallback
    }
  }
  return memoryOfficials;
}

export async function saveOfficial(official: Omit<OfficialProfile, "id"> & { id?: string }): Promise<OfficialProfile> {
  const id = official.id || crypto.randomUUID();
  const record: OfficialProfile = {
    ...official,
    id,
    displayOrder: official.displayOrder ?? 0,
    isPublished: official.isPublished ?? true,
  };

  const adminClient = createServiceSupabaseAdminClient() || createServerSupabaseClient();
  if (adminClient) {
    try {
      const ids = await resolveSupabaseTerritoryIds(
        adminClient as NonNullable<ReturnType<typeof createServerSupabaseClient>>,
        {
          regionSlug: record.regionSlug,
          provinceSlug: record.provinceSlug,
          communeSlug: record.communeSlug,
        }
      );

      const payload: Record<string, unknown> = {
        id,
        territory_type: record.territoryType,
        region_id: record.territoryType === "region" ? ids.regionId || null : null,
        province_id: record.territoryType === "province" ? ids.provinceId || null : null,
        commune_id: record.territoryType === "commune" ? ids.communeId || null : null,
        full_name: record.fullName,
        full_name_ar: record.fullNameAr || null,
        role: record.role,
        house: record.house || "conseil",
        party: record.party || null,
        mandate_start: record.mandateStart,
        mandate_end: record.mandateEnd,
        bio: record.bio || null,
        photo_path: record.photoUrl || null,
        display_order: record.displayOrder,
        is_published: record.isPublished,
      };

      await (adminClient as unknown as { from: (table: string) => { upsert: (p: unknown) => Promise<unknown> } })
        .from("officials")
        .upsert(payload);
    } catch {
      // Fall through to memory
    }
  }

  // Update memory store
  const existingIdx = memoryOfficials.findIndex((o) => o.id === id);
  if (existingIdx >= 0) {
    memoryOfficials[existingIdx] = record;
  } else {
    memoryOfficials.push(record);
  }

  return record;
}

export async function deleteOfficial(id: string): Promise<boolean> {
  const adminClient = createServiceSupabaseAdminClient() || createServerSupabaseClient();
  if (adminClient) {
    try {
      await (adminClient as unknown as { from: (table: string) => { delete: () => { eq: (k: string, v: string) => Promise<unknown> } } })
        .from("officials")
        .delete()
        .eq("id", id);
    } catch {
      // Ignore
    }
  }
  memoryOfficials = memoryOfficials.filter((o) => o.id !== id);
  return true;
}

export async function getNewsForTerritory(params: {
  territoryType: TerritoryType;
  regionSlug?: string;
  provinceSlug?: string;
  communeSlug?: string;
  limit?: number;
}): Promise<TerritoryArticle[]> {
  const limit = params.limit || 6;
  const client = createServerSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from("articles")
        .select("id, title, slug, excerpt, featured_image, published_at, category_id")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit);

      interface ArticleDbRow {
        id: string;
        slug: string | null;
        title: string | null;
        excerpt: string | null;
        featured_image: string | null;
        published_at: string | null;
      }
      const rows = data as unknown as ArticleDbRow[];
      if (!error && Array.isArray(rows) && rows.length > 0) {
        return rows.map((item, idx) => ({
          id: item.id,
          slug: item.slug || `article-${item.id}`,
          title: item.title || "Actualité",
          excerpt: item.excerpt || "",
          category: idx % 3 === 0 ? "Politique" : idx % 3 === 1 ? "Économie" : "Société",
          publishedAt: item.published_at || new Date().toISOString(),
          image: item.featured_image || undefined,
        }));
      }
    } catch {
      // Fall through
    }
  }

  // Fallback realistic news
  const regionLabel = params.regionSlug ? normalizeTerritorySlug(params.regionSlug) : "Région";
  return [
    {
      id: "art-1",
      slug: "conseil-regional-session-budget-investissements",
      title: `Session ordinaire du Conseil (${regionLabel}) : adoption d’un plan d’investissement record`,
      excerpt: "Les élus ont approuvé à l’unanimité les priorités de développement territorial et le soutien aux zones rurales pour l’exercice en cours.",
      category: "Politique",
      publishedAt: "2026-11-18",
      image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "art-2",
      slug: "nouvelles-zones-activites-economiques",
      title: `Création de deux nouvelles zones d’activités économiques pour stimuler l’emploi local`,
      excerpt: "Le partenariat public-privé permettra d’attirer plus de 50 entreprises industrielles et de services dans les deux prochaines années.",
      category: "Économie",
      publishedAt: "2026-11-15",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "art-3",
      slug: "programme-eau-potable-irrigation-durable",
      title: `Lancement d’un vaste programme de sécurisation en eau potable et d’irrigation raisonnée`,
      excerpt: "Une enveloppe budgétaire dédiée au désenclavement hydrique des communes les plus vulnérables a été déployée avec succès.",
      category: "Société",
      publishedAt: "2026-11-10",
      image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80",
    },
  ];
}

export function getRegionBySlug(slug: string): TerritoryRegion | null {
  const norm = normalizeTerritorySlug(slug);
  return REGIONS_12_METADATA.find((r) => r.slug === norm || r.id === norm || r.code === norm) || null;
}

export function getProvinceBySlug(regionSlug: string, provinceSlug: string): TerritoryProvince | null {
  const provinces = getProvincesForRegion(regionSlug);
  const normP = normalizeTerritorySlug(provinceSlug);
  return provinces.find((p) => p.slug === normP || normalizeTerritorySlug(p.slug) === normP) || null;
}

export function getCommuneBySlug(regionSlug: string, provinceSlug: string, communeSlug: string): TerritoryCommune | null {
  const communes = getCommunesForProvince(regionSlug, provinceSlug);
  const normC = normalizeTerritorySlug(communeSlug);
  return communes.find((c) => c.slug === normC || c.slug === communeSlug) || null;
}
