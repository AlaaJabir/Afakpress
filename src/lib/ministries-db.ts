import { unstable_cache } from "next/cache";
import { createServerSupabaseClient, createServiceSupabaseAdminClient } from "@/lib/supabase";
import type { Json } from "@/lib/supabase-types";
import type { PublicArticle } from "@/lib/public-content";
import { getMinistryBySlug, MOROCCAN_MINISTRIES, type MinistryItem } from "@/lib/ministries-data";

export interface MinistryProfile {
  id: string;
  ministrySlug: string;
  fullName: string;
  fullNameAr?: string;
  role: string;
  party?: string;
  mandateStart: string;
  mandateEnd: string;
  bio?: string;
  photoUrl?: string;
  displayOrder: number;
  isPublished: boolean;
}

export interface MinistryPageContent {
  slug: string;
  overview?: string;
  mission?: string;
  headquarters?: string;
  officialWebsite?: string;
  emblemUrl?: string;
  updatedAt?: string;
}

const MINISTRY_PROFILE_KEY_PREFIX = "ministry_profile:";
const MINISTRY_CONTENT_KEY_PREFIX = "ministry_content:";

let memoryMinistryProfiles: MinistryProfile[] = [];
const memoryMinistryContents: MinistryPageContent[] = [];

type DbErrorResult = { error: { code?: string; message?: string } | null };

interface DbMutationClient {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (k: string, v: string) => {
        maybeSingle: () => Promise<{ data: { id: string } | null; error: { code?: string; message?: string } | null }>;
      };
    };
    upsert: (payload: Record<string, unknown>, options?: { onConflict?: string }) => Promise<DbErrorResult>;
    insert: (payload: Record<string, unknown>) => Promise<DbErrorResult>;
    update: (payload: Record<string, unknown>) => { eq: (k: string, v: string) => Promise<DbErrorResult> };
    delete: () => { eq: (k: string, v: string) => Promise<DbErrorResult> };
  };
}

function isSafeImageUrl(url: string): boolean {
  const trimmed = url.trim();
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/")
  );
}

function isSafeHttpUrl(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.startsWith("https://") || trimmed.startsWith("http://");
}

function isMissingRelationError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /does not exist|schema cache/i.test(error.message || "")
  );
}

interface MinistryProfileDbRow {
  id: string;
  ministry_slug: string;
  full_name: string;
  full_name_ar: string | null;
  role: string;
  party: string | null;
  mandate_start: string | null;
  mandate_end: string | null;
  bio: string | null;
  photo_path: string | null;
  display_order: number | null;
  is_published: boolean | null;
}

function mapProfileRow(row: MinistryProfileDbRow): MinistryProfile {
  return {
    id: row.id,
    ministrySlug: row.ministry_slug,
    fullName: row.full_name,
    fullNameAr: row.full_name_ar || undefined,
    role: row.role,
    party: row.party || undefined,
    mandateStart: row.mandate_start || "2021",
    mandateEnd: row.mandate_end || "2026",
    bio: row.bio || undefined,
    photoUrl: row.photo_path || undefined,
    displayOrder: row.display_order ?? 1,
    isPublished: row.is_published !== false,
  };
}

function parseProfileSetting(row: { id: string; value: Json | null }): MinistryProfile | null {
  if (!row.value || typeof row.value !== "object" || Array.isArray(row.value)) return null;
  const val = row.value as Record<string, unknown>;
  const ministrySlug = typeof val.ministrySlug === "string" ? val.ministrySlug.trim() : "";
  const fullName = typeof val.fullName === "string" ? val.fullName.trim() : "";
  const role = typeof val.role === "string" ? val.role.trim() : "";
  if (!ministrySlug || !fullName || !role) return null;
  const photoUrl = typeof val.photoUrl === "string" && isSafeImageUrl(val.photoUrl) ? val.photoUrl.trim() : undefined;

  return {
    id: typeof val.id === "string" && val.id ? val.id : row.id,
    ministrySlug,
    fullName,
    fullNameAr: typeof val.fullNameAr === "string" && val.fullNameAr.trim() ? val.fullNameAr.trim() : undefined,
    role,
    party: typeof val.party === "string" && val.party.trim() ? val.party.trim() : undefined,
    mandateStart: typeof val.mandateStart === "string" && val.mandateStart.trim() ? val.mandateStart.trim() : "2021",
    mandateEnd: typeof val.mandateEnd === "string" && val.mandateEnd.trim() ? val.mandateEnd.trim() : "2026",
    bio: typeof val.bio === "string" && val.bio.trim() ? val.bio.trim() : undefined,
    photoUrl,
    displayOrder: typeof val.displayOrder === "number" ? val.displayOrder : 1,
    isPublished: val.isPublished !== false,
  };
}

function parseContentSetting(row: { value: Json | null; updated_at: string | null }): MinistryPageContent | null {
  if (!row.value || typeof row.value !== "object" || Array.isArray(row.value)) return null;
  const val = row.value as Record<string, unknown>;
  const slug = typeof val.slug === "string" ? val.slug.trim() : "";
  if (!slug) return null;
  return {
    slug,
    overview: typeof val.overview === "string" && val.overview.trim() ? val.overview.trim() : undefined,
    mission: typeof val.mission === "string" && val.mission.trim() ? val.mission.trim() : undefined,
    headquarters: typeof val.headquarters === "string" && val.headquarters.trim() ? val.headquarters.trim() : undefined,
    officialWebsite:
      typeof val.officialWebsite === "string" && isSafeHttpUrl(val.officialWebsite)
        ? val.officialWebsite.trim()
        : undefined,
    emblemUrl:
      typeof val.emblemUrl === "string" && isSafeImageUrl(val.emblemUrl) ? val.emblemUrl.trim() : undefined,
    updatedAt: (typeof val.updatedAt === "string" ? val.updatedAt : row.updated_at) || undefined,
  };
}

async function getProfilesForMinistryUncached(ministrySlug: string): Promise<MinistryProfile[]> {
  const client = (createServiceSupabaseAdminClient() ||
    createServerSupabaseClient()) as ReturnType<typeof createServerSupabaseClient>;

  if (client) {
    try {
      const { data, error } = await client
        .from("ministry_profiles")
        .select("*")
        .eq("ministry_slug", ministrySlug)
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!error && Array.isArray(data)) {
        return (data as unknown as MinistryProfileDbRow[]).map(mapProfileRow);
      }

      if (isMissingRelationError(error)) {
        const { data: settingsRows } = await client
          .from("settings")
          .select("id,value")
          .like("key", `${MINISTRY_PROFILE_KEY_PREFIX}${ministrySlug}:%`);

        if (Array.isArray(settingsRows)) {
          return settingsRows
            .map((r) => parseProfileSetting(r as { id: string; value: Json | null }))
            .filter((p): p is MinistryProfile => Boolean(p && p.isPublished))
            .sort((a, b) => a.displayOrder - b.displayOrder);
        }
      }
    } catch {
      // Fall through to memory
    }
  }

  return memoryMinistryProfiles
    .filter((p) => p.ministrySlug === ministrySlug && p.isPublished)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export const getProfilesForMinistry = unstable_cache(
  getProfilesForMinistryUncached,
  ["afakpress-ministry-profiles-v1"],
  { revalidate: 60, tags: ["ministries"] }
);

export async function getAllMinistryProfiles(): Promise<MinistryProfile[]> {
  const client = (createServiceSupabaseAdminClient() ||
    createServerSupabaseClient()) as ReturnType<typeof createServerSupabaseClient>;

  if (client) {
    try {
      const { data, error } = await client
        .from("ministry_profiles")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return (data as unknown as MinistryProfileDbRow[]).map(mapProfileRow);
      }

      if (isMissingRelationError(error)) {
        const { data: settingsRows } = await client
          .from("settings")
          .select("id,value")
          .like("key", `${MINISTRY_PROFILE_KEY_PREFIX}%`);

        if (Array.isArray(settingsRows)) {
          return settingsRows
            .map((r) => parseProfileSetting(r as { id: string; value: Json | null }))
            .filter((p): p is MinistryProfile => Boolean(p))
            .sort((a, b) => a.displayOrder - b.displayOrder);
        }
      }
    } catch {
      // Fall through to memory
    }
  }

  return [...memoryMinistryProfiles].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveMinistryProfile(
  input: Omit<MinistryProfile, "id"> & { id?: string }
): Promise<MinistryProfile> {
  const ministry = getMinistryBySlug(input.ministrySlug);
  if (!ministry) {
    throw new Error("Ministère introuvable.");
  }

  if (input.photoUrl && !isSafeImageUrl(input.photoUrl)) {
    throw new Error("URL de photo invalide.");
  }

  const id = input.id || crypto.randomUUID();
  const record: MinistryProfile = {
    id,
    ministrySlug: ministry.slug,
    fullName: input.fullName.trim(),
    fullNameAr: input.fullNameAr?.trim() || undefined,
    role: input.role.trim(),
    party: input.party?.trim() || undefined,
    mandateStart: input.mandateStart?.trim() || "2021",
    mandateEnd: input.mandateEnd?.trim() || "2026",
    bio: input.bio?.trim() || undefined,
    photoUrl: input.photoUrl?.trim() || undefined,
    displayOrder: Number(input.displayOrder) || 1,
    isPublished: input.isPublished !== false,
  };

  const serviceClient = createServiceSupabaseAdminClient();
  const adminClient = serviceClient || createServerSupabaseClient();

  if (adminClient) {
    const db = adminClient as unknown as DbMutationClient;

    // Ensure parent ministry row exists before inserting into ministry_profiles (FK)
    const { error: parentError } = await db.from("ministries").upsert(
      {
        number: ministry.number,
        slug: ministry.slug,
        name_ar: ministry.nameAr,
        group_id: ministry.groupId,
        group_name_ar: ministry.groupNameAr,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );

    if (!parentError) {
      const { error } = await db.from("ministry_profiles").upsert({
        id: record.id,
        ministry_slug: record.ministrySlug,
        full_name: record.fullName,
        full_name_ar: record.fullNameAr || null,
        role: record.role,
        party: record.party || null,
        mandate_start: record.mandateStart,
        mandate_end: record.mandateEnd,
        bio: record.bio || null,
        photo_path: record.photoUrl || null,
        display_order: record.displayOrder,
        is_published: record.isPublished,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        if (!isMissingRelationError(error) && serviceClient) {
          throw new Error(error.message || "Erreur lors de l'enregistrement du profil dans Supabase");
        }
      } else {
        syncMemoryProfile(record);
        return record;
      }
    }

    // Fallback persistence in public.settings if SQL migration hasn't been applied yet
    if (isMissingRelationError(parentError) || !parentError) {
      const settingKey = `${MINISTRY_PROFILE_KEY_PREFIX}${record.ministrySlug}:${record.id}`;
      const { data: existing } = await db
        .from("settings")
        .select("id")
        .eq("key", settingKey)
        .maybeSingle();

      const mutation = existing?.id
        ? await db
            .from("settings")
            .update({ value: record as unknown as Json, updated_at: new Date().toISOString() })
            .eq("id", existing.id)
        : await db.from("settings").insert({
            id: record.id,
            key: settingKey,
            value: record as unknown as Json,
            updated_at: new Date().toISOString(),
          });

      if (mutation.error && serviceClient) {
        throw new Error(mutation.error.message || "Erreur lors de l'enregistrement dans Supabase");
      }
    }
  }

  syncMemoryProfile(record);
  return record;
}

function syncMemoryProfile(record: MinistryProfile) {
  const idx = memoryMinistryProfiles.findIndex((p) => p.id === record.id);
  if (idx >= 0) {
    memoryMinistryProfiles[idx] = record;
  } else {
    memoryMinistryProfiles.unshift(record);
  }
}

export async function deleteMinistryProfile(
  id: string
): Promise<{ deleted: boolean; profile?: MinistryProfile }> {
  const all = await getAllMinistryProfiles();
  const target = all.find((p) => p.id === id);

  const serviceClient = createServiceSupabaseAdminClient();
  const adminClient = serviceClient || createServerSupabaseClient();

  if (adminClient) {
    const db = adminClient as unknown as DbMutationClient;
    const { error } = await db.from("ministry_profiles").delete().eq("id", id);
    if (error && !isMissingRelationError(error) && serviceClient) {
      throw new Error(error.message || "Erreur lors de la suppression dans Supabase");
    }

    await db.from("settings").delete().eq("id", id);
  }

  memoryMinistryProfiles = memoryMinistryProfiles.filter((p) => p.id !== id);
  return { deleted: true, profile: target };
}

interface MinistryDbRow {
  slug: string;
  overview: string | null;
  mission: string | null;
  headquarters: string | null;
  official_website: string | null;
  emblem_url: string | null;
  updated_at: string | null;
}

async function getMinistryPageDetailsUncached(slug: string): Promise<MinistryPageContent | null> {
  const client = (createServiceSupabaseAdminClient() ||
    createServerSupabaseClient()) as ReturnType<typeof createServerSupabaseClient>;

  if (client) {
    try {
      const { data, error } = await client
        .from("ministries")
        .select("slug,overview,mission,headquarters,official_website,emblem_url,updated_at")
        .eq("slug", slug)
        .maybeSingle();

      const row = data as unknown as MinistryDbRow | null;
      if (!error && row) {
        return {
          slug: row.slug,
          overview: row.overview || undefined,
          mission: row.mission || undefined,
          headquarters: row.headquarters || undefined,
          officialWebsite: row.official_website || undefined,
          emblemUrl: row.emblem_url || undefined,
          updatedAt: row.updated_at || undefined,
        };
      }

      if (isMissingRelationError(error)) {
        const { data: settingRow } = await client
          .from("settings")
          .select("value,updated_at")
          .eq("key", `${MINISTRY_CONTENT_KEY_PREFIX}${slug}`)
          .maybeSingle();

        if (settingRow) {
          return parseContentSetting(settingRow as { value: Json | null; updated_at: string | null });
        }
      }
    } catch {
      // Fall through to memory
    }
  }

  return memoryMinistryContents.find((c) => c.slug === slug) || null;
}

export const getMinistryPageDetails = unstable_cache(
  getMinistryPageDetailsUncached,
  ["afakpress-ministry-details-v1"],
  { revalidate: 60, tags: ["ministries"] }
);

export async function getAllMinistryPageContents(): Promise<MinistryPageContent[]> {
  const client = (createServiceSupabaseAdminClient() ||
    createServerSupabaseClient()) as ReturnType<typeof createServerSupabaseClient>;

  if (client) {
    try {
      const { data, error } = await client
        .from("ministries")
        .select("slug,overview,mission,headquarters,official_website,emblem_url,updated_at")
        .order("number", { ascending: true });

      const rows = (data ?? []) as unknown as MinistryDbRow[];
      if (!error && Array.isArray(data)) {
        return rows
          .filter((row) => row.overview || row.mission || row.headquarters || row.official_website || row.emblem_url)
          .map((row) => ({
            slug: row.slug,
            overview: row.overview || undefined,
            mission: row.mission || undefined,
            headquarters: row.headquarters || undefined,
            officialWebsite: row.official_website || undefined,
            emblemUrl: row.emblem_url || undefined,
            updatedAt: row.updated_at || undefined,
          }));
      }

      if (isMissingRelationError(error)) {
        const { data: settingsRows } = await client
          .from("settings")
          .select("value,updated_at")
          .like("key", `${MINISTRY_CONTENT_KEY_PREFIX}%`);

        if (Array.isArray(settingsRows)) {
          return settingsRows
            .map((r) => parseContentSetting(r as { value: Json | null; updated_at: string | null }))
            .filter((c): c is MinistryPageContent => Boolean(c));
        }
      }
    } catch {
      // Fall through to memory
    }
  }

  return memoryMinistryContents;
}

export async function saveMinistryPageContent(
  input: MinistryPageContent
): Promise<MinistryPageContent> {
  const ministry = getMinistryBySlug(input.slug);
  if (!ministry) {
    throw new Error("Ministère introuvable.");
  }

  if (input.officialWebsite && !isSafeHttpUrl(input.officialWebsite)) {
    throw new Error("Le site officiel doit commencer par https:// ou http://");
  }
  if (input.emblemUrl && !isSafeImageUrl(input.emblemUrl)) {
    throw new Error("URL de logo / image invalide.");
  }

  const updatedAt = new Date().toISOString();
  const entry: MinistryPageContent = {
    slug: ministry.slug,
    overview: input.overview?.trim() || undefined,
    mission: input.mission?.trim() || undefined,
    headquarters: input.headquarters?.trim() || undefined,
    officialWebsite: input.officialWebsite?.trim() || undefined,
    emblemUrl: input.emblemUrl?.trim() || undefined,
    updatedAt,
  };

  const serviceClient = createServiceSupabaseAdminClient();
  const adminClient = serviceClient || createServerSupabaseClient();

  if (adminClient) {
    const db = adminClient as unknown as DbMutationClient;
    const { error } = await db.from("ministries").upsert(
      {
        number: ministry.number,
        slug: ministry.slug,
        name_ar: ministry.nameAr,
        group_id: ministry.groupId,
        group_name_ar: ministry.groupNameAr,
        overview: entry.overview || null,
        mission: entry.mission || null,
        headquarters: entry.headquarters || null,
        official_website: entry.officialWebsite || null,
        emblem_url: entry.emblemUrl || null,
        is_active: true,
        updated_at: updatedAt,
      },
      { onConflict: "slug" }
    );

    if (!error) {
      syncMemoryContent(entry);
      return entry;
    }

    if (!isMissingRelationError(error) && serviceClient) {
      throw new Error(error.message || "Erreur lors de la mise à jour du ministère dans Supabase");
    }

    // Fallback to settings table if ministries table isn't migrated yet
    const settingKey = `${MINISTRY_CONTENT_KEY_PREFIX}${entry.slug}`;
    const { data: existing } = await db
      .from("settings")
      .select("id")
      .eq("key", settingKey)
      .maybeSingle();

    const mutation = existing?.id
      ? await db
          .from("settings")
          .update({ value: entry as unknown as Json, updated_at: updatedAt })
          .eq("id", existing.id)
      : await db.from("settings").insert({
          id: crypto.randomUUID(),
          key: settingKey,
          value: entry as unknown as Json,
          updated_at: updatedAt,
        });

    if (mutation.error && serviceClient) {
      throw new Error(mutation.error.message || "Erreur lors de l'enregistrement dans Supabase");
    }
  }

  syncMemoryContent(entry);
  return entry;
}

function syncMemoryContent(entry: MinistryPageContent) {
  const idx = memoryMinistryContents.findIndex((c) => c.slug === entry.slug);
  if (idx >= 0) {
    memoryMinistryContents[idx] = entry;
  } else {
    memoryMinistryContents.unshift(entry);
  }
}

const getCachedMinistryArticles = unstable_cache(
  async (ministrySlug: string, ministerTermsKey: string): Promise<PublicArticle[]> => {
    const ministry = getMinistryBySlug(ministrySlug);
    if (!ministry) return [];

    const supabase = createServerSupabaseClient();
    if (!supabase) return [];

    const ministerTerms = ministerTermsKey
      ? ministerTermsKey.split("\n").filter((v) => v.length >= 3)
      : [];

    try {
      const withColSelect =
        "id,title,slug,excerpt,featured_image,ministry_slug,category_id,author_id,region_id,province_id,commune_id,published_at,created_at,seo_title,seo_description,seo_keywords,category:categories(id,name,slug),author:profiles(id,name,slug)";
      const fallbackSelect =
        "id,title,slug,excerpt,featured_image,category_id,author_id,region_id,province_id,commune_id,published_at,created_at,seo_title,seo_description,seo_keywords,category:categories(id,name,slug),author:profiles(id,name,slug)";

      let hasMinistrySlugCol = true;
      let queryRes = await supabase
        .from("articles")
        .select(withColSelect)
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(40);

      if (queryRes.error && isMissingRelationError(queryRes.error)) {
        hasMinistrySlugCol = false;
        queryRes = await supabase
          .from("articles")
          .select(fallbackSelect)
          .eq("status", "published")
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(40);
      }

      if (queryRes.error || !Array.isArray(queryRes.data)) return [];

      type ArticleWithMinistry = PublicArticle & {
        ministry_slug?: string | null;
        seo_keywords?: string | null;
      };

      const allArticles = queryRes.data as unknown as ArticleWithMinistry[];
      const seen = new Set<string>();
      const results: PublicArticle[] = [];

      const pushUnique = (article: ArticleWithMinistry) => {
        if (seen.has(article.id)) return;
        seen.add(article.id);
        results.push(article);
      };

      // 1. Direct ministry_slug match
      if (hasMinistrySlugCol) {
        for (const article of allArticles) {
          if (article.ministry_slug === ministry.slug) {
            pushUnique(article);
          }
        }
      }

      // 2. Minister name mention match (articles about the minister)
      if (ministerTerms.length > 0) {
        for (const article of allArticles) {
          const haystack = `${article.title || ""} ${article.excerpt || ""} ${article.seo_description || ""} ${article.seo_keywords || ""}`.toLowerCase();
          if (ministerTerms.some((term) => haystack.includes(term.toLowerCase()))) {
            pushUnique(article);
          }
        }
      }

      // 3. Ministry keyword match
      for (const article of allArticles) {
        const haystack = `${article.title || ""} ${article.excerpt || ""} ${article.seo_description || ""} ${article.seo_keywords || ""}`;
        if (ministry.keywords.some((kw) => haystack.includes(kw))) {
          pushUnique(article);
        }
      }

      return results;
    } catch {
      return [];
    }
  },
  ["afakpress-ministry-articles-v1"],
  { revalidate: 60, tags: ["ministries", "cms:articles"] }
);

export async function getArticlesForMinistry(
  ministry: MinistryItem,
  profiles: MinistryProfile[] = []
): Promise<PublicArticle[]> {
  const ministerTermsKey = profiles
    .flatMap((p) => [p.fullNameAr, p.fullName])
    .map((v) => (v || "").trim())
    .filter((v) => v.length >= 3)
    .join("\n");

  return getCachedMinistryArticles(ministry.slug, ministerTermsKey);
}

export function getAllMinistriesStatic(): MinistryItem[] {
  return MOROCCAN_MINISTRIES;
}
