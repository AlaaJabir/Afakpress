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
): Promise<{
  regionId?: string;
  provinceId?: string;
  communeId?: string;
  regionSlug?: string;
  provinceSlug?: string;
  communeSlug?: string;
}> {
  const result: {
    regionId?: string;
    provinceId?: string;
    communeId?: string;
    regionSlug?: string;
    provinceSlug?: string;
    communeSlug?: string;
  } = {};
  try {
    if (params.regionSlug) {
      const regNorm = normalizeTerritorySlug(params.regionSlug);
      const regMeta = REGIONS_12_METADATA.find(
        (r) => r.slug === regNorm || r.arabicSlug === params.regionSlug
      );
      const { data: regionsData } = await client.from("regions").select("id,name,slug");
      const regionsRows = (regionsData ?? []) as Array<{ id: string; name: string | null; slug: string | null }>;
      const matchedRegion = regionsRows.find(
        (r) =>
          r.slug === params.regionSlug ||
          (r.slug && normalizeTerritorySlug(r.slug) === regNorm) ||
          (regMeta && r.name && r.name.includes(regMeta.nameAr.split(" ")[0]))
      );
      if (matchedRegion) {
        result.regionId = matchedRegion.id;
        result.regionSlug = matchedRegion.slug || undefined;
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
        result.provinceSlug = matchedProv.slug || undefined;
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
        result.communeSlug = matchedComm.slug || undefined;
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
        regionSlug: params.regionSlug || normR,
        provinceSlug: params.provinceSlug || normP,
        communeSlug: params.communeSlug || normC,
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
            if (params.territoryType === "region" && normR && !ids.regionId) {
              return Boolean(item.region_slug && normalizeTerritorySlug(item.region_slug) === normR);
            }
            if (params.territoryType === "province" && normP && !ids.provinceId) {
              return Boolean(item.province_slug && normalizeTerritorySlug(item.province_slug) === normP);
            }
            if (params.territoryType === "commune" && normC && !ids.communeId) {
              return Boolean(item.commune_slug && normalizeTerritorySlug(item.commune_slug) === normC);
            }
            return true;
          })
          .map((item) => ({
            id: item.id,
            territoryType: item.territory_type,
            regionId: item.region_id || undefined,
            provinceId: item.province_id || undefined,
            communeId: item.commune_id || undefined,
            regionSlug: item.region_slug || ids.regionSlug || normR,
            provinceSlug: item.province_slug || ids.provinceSlug || normP,
            communeSlug: item.commune_slug || ids.communeSlug || normC,
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

export async function getOfficialsForLocation(params: {
  territoryType: TerritoryType;
  entityId?: string;
  slug?: string;
  regionSlug?: string;
  provinceSlug?: string;
  communeSlug?: string;
}): Promise<OfficialProfile[]> {
  const client = createServerSupabaseClient();
  if (client && params.entityId) {
    try {
      const fkCol =
        params.territoryType === "region"
          ? "region_id"
          : params.territoryType === "province"
          ? "province_id"
          : "commune_id";

      const { data, error } = await client
        .from("officials")
        .select("*")
        .eq("territory_type", params.territoryType)
        .eq(fkCol, params.entityId)
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      const rows = (data ?? []) as unknown as OfficialDbRecord[];
      if (!error && rows.length > 0) {
        return rows.map((item) => ({
          id: item.id,
          territoryType: item.territory_type,
          regionId: item.region_id || undefined,
          provinceId: item.province_id || undefined,
          communeId: item.commune_id || undefined,
          regionSlug: item.region_slug || params.regionSlug,
          provinceSlug: item.province_slug || params.provinceSlug,
          communeSlug: item.commune_slug || params.communeSlug,
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
      // Fall through to slug-based lookup
    }
  }

  return getOfficialsForTerritory({
    territoryType: params.territoryType,
    regionSlug: params.regionSlug ?? (params.territoryType === "region" ? params.slug : undefined),
    provinceSlug: params.provinceSlug ?? (params.territoryType === "province" ? params.slug : undefined),
    communeSlug: params.communeSlug ?? (params.territoryType === "commune" ? params.slug : undefined),
  });
}

export async function getAllOfficials(): Promise<OfficialProfile[]> {
  const client = createServerSupabaseClient();
  if (client) {
    try {
      const [{ data, error }, { data: regData }, { data: provData }, { data: commData }] = await Promise.all([
        client.from("officials").select("*").order("created_at", { ascending: false }),
        client.from("regions").select("id,slug"),
        client.from("provinces").select("id,slug,region_id"),
        client.from("communes").select("id,slug,province_id"),
      ]);

      const regRows = (regData ?? []) as Array<{ id: string; slug: string | null }>;
      const provRows = (provData ?? []) as Array<{ id: string; slug: string | null; region_id: string | null }>;
      const commRows = (commData ?? []) as Array<{ id: string; slug: string | null; province_id: string | null }>;

      const regSlugMap = new Map(regRows.map((r) => [r.id, r.slug || undefined]));
      const provMap = new Map(provRows.map((p) => [p.id, p]));
      const commMap = new Map(commRows.map((c) => [c.id, c]));

      const rows = data as unknown as OfficialDbRecord[];
      if (!error && Array.isArray(rows) && rows.length > 0) {
        return rows.map((item) => {
          const prov = item.province_id ? provMap.get(item.province_id) : undefined;
          const comm = item.commune_id ? commMap.get(item.commune_id) : undefined;
          const commProv = comm?.province_id ? provMap.get(comm.province_id) : undefined;
          const resolvedRegionId = item.region_id || prov?.region_id || commProv?.region_id || undefined;
          const resolvedProvinceId = item.province_id || comm?.province_id || undefined;

          return {
            id: item.id,
            territoryType: item.territory_type,
            regionId: resolvedRegionId,
            provinceId: resolvedProvinceId,
            communeId: item.commune_id || undefined,
            regionSlug: item.region_slug || (resolvedRegionId ? regSlugMap.get(resolvedRegionId) : undefined),
            provinceSlug: item.province_slug || prov?.slug || commProv?.slug || undefined,
            communeSlug: item.commune_slug || comm?.slug || undefined,
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
          };
        });
      }
    } catch {
      // Fallback
    }
  }
  return memoryOfficials;
}

export interface AdminTerritoryNode {
  id: string;
  name: string;
  slug: string;
  provinces: Array<{
    id: string;
    name: string;
    slug: string;
    communes: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  }>;
}

export async function getSupabaseTerritoriesTree(): Promise<AdminTerritoryNode[]> {
  const client = createServerSupabaseClient();
  if (client) {
    try {
      const [{ data: regions }, { data: provinces }, { data: communes }] = await Promise.all([
        client.from("regions").select("id,name,slug").order("name", { ascending: true }),
        client.from("provinces").select("id,region_id,name,slug").order("name", { ascending: true }),
        client.from("communes").select("id,province_id,name,slug").order("name", { ascending: true }),
      ]);

      const regRows = (regions ?? []) as Array<{ id: string; name: string | null; slug: string | null }>;
      const provRows = (provinces ?? []) as Array<{ id: string; region_id: string | null; name: string | null; slug: string | null }>;
      const commRows = (communes ?? []) as Array<{ id: string; province_id: string | null; name: string | null; slug: string | null }>;

      if (regRows.length > 0) {
        return regRows.map((reg) => ({
          id: reg.id,
          name: reg.name || reg.slug || reg.id,
          slug: reg.slug || reg.id,
          provinces: provRows
            .filter((p) => p.region_id === reg.id)
            .map((prov) => ({
              id: prov.id,
              name: prov.name || prov.slug || prov.id,
              slug: prov.slug || prov.id,
              communes: commRows
                .filter((c) => c.province_id === prov.id)
                .map((comm) => ({
                  id: comm.id,
                  name: comm.name || comm.slug || comm.id,
                  slug: comm.slug || comm.id,
                })),
            })),
        }));
      }
    } catch {
      // Fall back to static metadata tree
    }
  }

  return REGIONS_12_METADATA.map((r) => ({
    id: r.id,
    name: r.nameAr,
    slug: r.arabicSlug,
    provinces: getProvincesForRegion(r.slug).map((p) => ({
      id: p.id,
      name: p.nameAr,
      slug: p.slug,
      communes: getCommunesForProvince(r.slug, p.slug).map((c) => ({
        id: c.id,
        name: c.nameAr,
        slug: c.slug,
      })),
    })),
  }));
}

export async function saveOfficial(official: Omit<OfficialProfile, "id"> & { id?: string }): Promise<OfficialProfile> {
  const id = official.id || crypto.randomUUID();
  const record: OfficialProfile = {
    ...official,
    id,
    displayOrder: official.displayOrder ?? 0,
    isPublished: official.isPublished ?? true,
  };

  const serviceClient = createServiceSupabaseAdminClient();
  const adminClient = serviceClient || createServerSupabaseClient();
  if (adminClient) {
    const resolvedIds = await resolveSupabaseTerritoryIds(
      adminClient as NonNullable<ReturnType<typeof createServerSupabaseClient>>,
      {
        regionSlug: record.regionSlug,
        provinceSlug: record.provinceSlug,
        communeSlug: record.communeSlug,
      }
    );

    const regionId = record.regionId || resolvedIds.regionId;
    const provinceId = record.provinceId || resolvedIds.provinceId;
    const communeId = record.communeId || resolvedIds.communeId;

    record.regionSlug = record.regionSlug || resolvedIds.regionSlug;
    record.provinceSlug = record.provinceSlug || resolvedIds.provinceSlug;
    record.communeSlug = record.communeSlug || resolvedIds.communeSlug;

    const fkId =
      record.territoryType === "region"
        ? regionId
        : record.territoryType === "province"
        ? provinceId
        : communeId;

    if (serviceClient && !fkId) {
      throw new Error(
        `Impossible de localiser l'identifiant du territoire (${record.territoryType}) dans Supabase.`
      );
    }

    const payload: Record<string, unknown> = {
      id,
      territory_type: record.territoryType,
      region_id: record.territoryType === "region" ? regionId || null : null,
      province_id: record.territoryType === "province" ? provinceId || null : null,
      commune_id: record.territoryType === "commune" ? communeId || null : null,
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

    const { error } = await (
      adminClient as unknown as {
        from: (table: string) => {
          upsert: (p: unknown) => Promise<{ error: { message?: string } | null }>;
        };
      }
    )
      .from("officials")
      .upsert(payload);

    if (error && serviceClient) {
      throw new Error(error.message || "Erreur lors de l'enregistrement dans Supabase");
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

export async function deleteOfficial(id: string): Promise<{ deleted: boolean; official?: OfficialProfile }> {
  const all = await getAllOfficials();
  const target = all.find((o) => o.id === id);

  const serviceClient = createServiceSupabaseAdminClient();
  const adminClient = serviceClient || createServerSupabaseClient();
  if (adminClient) {
    const { error } = await (
      adminClient as unknown as {
        from: (table: string) => {
          delete: () => { eq: (k: string, v: string) => Promise<{ error: { message?: string } | null }> };
        };
      }
    )
      .from("officials")
      .delete()
      .eq("id", id);

    if (error && serviceClient) {
      throw new Error(error.message || "Erreur lors de la suppression dans Supabase");
    }
  }
  memoryOfficials = memoryOfficials.filter((o) => o.id !== id);
  return { deleted: true, official: target };
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
