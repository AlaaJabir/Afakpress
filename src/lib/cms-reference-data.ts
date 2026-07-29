import type { SupabaseClient } from "@supabase/supabase-js";
import { initialCmsState } from "@/lib/cms";
import { stableUuid } from "@/lib/uuid";

type Db = SupabaseClient;
type ArticleReferencePayload = {
  category_id?: string | null;
  author_id?: string | null;
  region_id?: string | null;
  province_id?: string | null;
  commune_id?: string | null;
};

type LocationRow = {
  id: string;
  name: string | null;
  slug: string | null;
};

type ProvinceRow = LocationRow & {
  region_id: string | null;
};

type CommuneRow = LocationRow & {
  province_id: string | null;
};

type SeedOptions = {
  includeLocations?: boolean;
  syncMissingHierarchy?: boolean;
};

export function defaultProfileRows() {
  return initialCmsState.users.map((user) => ({
    id: user.id,
    name: user.name,
    slug: user.email.split("@")[0] || user.name.toLowerCase().replace(/\s+/g, "-"),
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
  }));
}

export function defaultCategoryRows() {
  return initialCmsState.categories.map((category, index) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parent_id: category.parentId || null,
    order_index: index,
    is_active: true,
  }));
}

export function defaultRegionRows() {
  return initialCmsState.regions.map((region) => ({
    id: region.id,
    name: region.name,
    slug: region.slug,
  }));
}

export function defaultProvinceRows() {
  return initialCmsState.regions.flatMap((region) =>
    region.provinces.map((province) => ({
      id: province.id,
      region_id: region.id,
      name: province.name,
      slug: province.slug,
    })),
  );
}

export function defaultCommuneRows() {
  return initialCmsState.regions.flatMap((region) =>
    region.provinces.flatMap((province) =>
      province.communes.map((commune) => ({
        id: commune.id,
        province_id: province.id,
        name: commune.name,
        slug: commune.slug,
      })),
    ),
  );
}

async function upsertRows<Row extends { id: string }>(supabase: Db, table: "profiles" | "categories" | "regions" | "provinces" | "communes", rows: Row[]) {
  for (const row of rows) {
    const { error } = await supabase.from(table).upsert(row, { onConflict: "id" });
    const message = error?.message.toLowerCase() ?? "";
    const canResolveLater = message.includes("duplicate key") || message.includes("foreign key constraint");
    if (error && !canResolveLater) {
      return error.message;
    }
  }
  return "";
}

function normalizedLocation(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "")
    .toLowerCase();
}

function sameLocation(left: { name?: string | null; slug?: string | null }, right: { name?: string | null; slug?: string | null }) {
  const leftValues = [normalizedLocation(left.name), normalizedLocation(left.slug)].filter(Boolean);
  const rightValues = new Set([normalizedLocation(right.name), normalizedLocation(right.slug)].filter(Boolean));
  return leftValues.some((value) => rightValues.has(value));
}

function matchingRegionRows(rows: LocationRow[], region: { name: string; slug: string; provinces: { name: string; slug: string }[] }, provinceRows: ProvinceRow[]) {
  return rows.filter((row) => {
    if (sameLocation(row, region)) return true;
    return provinceRows.some((province) => province.region_id === row.id && region.provinces.some((item) => sameLocation(item, province)));
  });
}

async function insertMissingRow<Row extends Record<string, unknown>>(supabase: Db, table: "regions" | "provinces" | "communes", row: Row) {
  const { error } = await supabase.from(table).insert(row);
  if (!error) return "";

  const message = error.message.toLowerCase();
  if (message.includes("duplicate key")) return "";
  return error.message;
}

async function syncMissingMoroccoHierarchy(supabase: Db) {
  const [regionsResult, provincesResult, communesResult] = await Promise.all([
    supabase.from("regions").select("id,name,slug"),
    supabase.from("provinces").select("id,region_id,name,slug"),
    supabase.from("communes").select("id,province_id,name,slug"),
  ]);

  if (regionsResult.error) return regionsResult.error.message;
  if (provincesResult.error) return provincesResult.error.message;
  if (communesResult.error) return communesResult.error.message;

  const regionRows = [...((regionsResult.data ?? []) as LocationRow[])];
  const provinceRows = [...((provincesResult.data ?? []) as ProvinceRow[])];
  const communeRows = [...((communesResult.data ?? []) as CommuneRow[])];

  const syncRegionRows = async (region: (typeof initialCmsState.regions)[number], rows: LocationRow[]) => {
    for (const regionRow of rows) {
      for (const province of region.provinces) {
        let provinceRow = provinceRows.find((row) => row.region_id === regionRow.id && sameLocation(row, province));
        if (!provinceRow) {
          const provinceId = provinceRows.some((row) => row.id === province.id) ? stableUuid(`province-${regionRow.id}-${province.slug}`) : province.id;
          const nextProvince = { id: provinceId, region_id: regionRow.id, name: province.name, slug: province.slug };
          const error = await insertMissingRow(supabase, "provinces", nextProvince);
          if (error) return error;
          provinceRow = nextProvince;
          provinceRows.push(provinceRow);
        }

        for (const commune of province.communes) {
          const communeRow = communeRows.find((row) => row.province_id === provinceRow.id && sameLocation(row, commune));
          if (!communeRow) {
            const communeId = communeRows.some((row) => row.id === commune.id) ? stableUuid(`commune-${provinceRow.id}-${commune.slug}`) : commune.id;
            const nextCommune = { id: communeId, province_id: provinceRow.id, name: commune.name, slug: commune.slug };
            const error = await insertMissingRow(supabase, "communes", nextCommune);
            if (error) return error;
            communeRows.push(nextCommune);
          }
        }
      }
    }

    return "";
  };

  for (const region of initialCmsState.regions) {
    let rowsToSync = matchingRegionRows(regionRows, region, provinceRows);
    let regionRow = rowsToSync[0];
    if (!regionRow) {
      const nextRegion = { id: region.id, name: region.name, slug: region.slug };
      const error = await insertMissingRow(supabase, "regions", nextRegion);
      if (error) return error;
      regionRow = nextRegion;
      regionRows.push(regionRow);
      rowsToSync = [regionRow];
    }

    const error = await syncRegionRows(region, rowsToSync);
    if (error) return error;
  }

  return "";
}

export async function seedDefaultCmsReferences(
  supabase: Db,
  sessionProfile?: { id: string; name: string; email: string; role: string; avatar?: string | null },
  options: SeedOptions = {},
) {
  const includeLocations = options.includeLocations ?? true;
  const syncMissingHierarchy = options.syncMissingHierarchy ?? false;

  if (sessionProfile) {
    const { error } = await supabase.from("profiles").upsert(sessionProfile, { onConflict: "id" });
    if (error && !error.message.toLowerCase().includes("duplicate key")) return error.message;
  }

  return (
    (await upsertRows(supabase, "categories", defaultCategoryRows())) ||
    (includeLocations ? (await upsertRows(supabase, "regions", defaultRegionRows())) : "") ||
    (includeLocations ? (await upsertRows(supabase, "provinces", defaultProvinceRows())) : "") ||
    (includeLocations ? (await upsertRows(supabase, "communes", defaultCommuneRows())) : "") ||
    (syncMissingHierarchy ? (await syncMissingMoroccoHierarchy(supabase)) : "")
  );
}

async function existsById(supabase: Db, table: "profiles" | "categories" | "regions" | "provinces" | "communes", id: string) {
  const { data, error } = await supabase.from(table).select("id").eq("id", id).maybeSingle();
  if (error) return { error: error.message, id: "" };
  return { id: data?.id ?? "", error: "" };
}

async function idByColumn(supabase: Db, table: "profiles" | "categories" | "regions" | "provinces" | "communes", column: "email" | "slug", value: string) {
  const { data, error } = await supabase.from(table).select("id").eq(column, value).limit(1).maybeSingle();
  if (error) return { error: error.message, id: "" };
  return { id: data?.id ?? "", error: "" };
}

async function resolveReference(
  supabase: Db,
  table: "profiles" | "categories" | "regions" | "provinces" | "communes",
  id: string | null | undefined,
  defaults: { id: string; slug?: string | null; email?: string | null }[],
  label: string,
) {
  if (!id) return { id: null, error: "" };

  const existing = await existsById(supabase, table, id);
  if (existing.error || existing.id) return existing;

  const fallback = defaults.find((item) => item.id === id);
  if (fallback?.email) {
    const byEmail = await idByColumn(supabase, table, "email", fallback.email);
    if (byEmail.error || byEmail.id) return byEmail;
  }
  if (fallback?.slug) {
    const bySlug = await idByColumn(supabase, table, "slug", fallback.slug);
    if (bySlug.error || bySlug.id) return bySlug;
  }

  return { id: "", error: `${label} does not exist in Supabase. Refresh CMS data or create the missing record first.` };
}

export async function resolveArticleReferences(supabase: Db, payload: ArticleReferencePayload) {
  const category = await resolveReference(supabase, "categories", payload.category_id, defaultCategoryRows(), "Selected category");
  if (category.error) return category.error;
  payload.category_id = category.id;

  const author = await resolveReference(supabase, "profiles", payload.author_id, defaultProfileRows(), "Selected author");
  if (author.error) return author.error;
  payload.author_id = author.id;

  const region = await resolveReference(supabase, "regions", payload.region_id, [], "Selected region");
  if (region.error) return region.error;
  payload.region_id = region.id;

  const province = await resolveReference(supabase, "provinces", payload.province_id, [], "Selected province");
  if (province.error) return province.error;
  payload.province_id = province.id;

  const commune = await resolveReference(supabase, "communes", payload.commune_id, [], "Selected commune");
  if (commune.error) return commune.error;
  payload.commune_id = commune.id;

  return "";
}
