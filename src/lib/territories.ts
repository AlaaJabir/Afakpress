import { unstable_cache } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase";

export type TerritoryKind = "region" | "province" | "commune";
export type TerritoryEntity = {
  id: string;
  name: string | null;
  name_fr: string | null;
  name_ar: string | null;
  slug: string;
  population: number | null;
  kind?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  region_id?: string | null;
  province_id?: string | null;
};
export type TerritoryOfficial = {
  id: string;
  territory_type: TerritoryKind;
  region_id: string | null;
  province_id: string | null;
  commune_id: string | null;
  full_name: string;
  full_name_ar: string | null;
  role: string;
  house: "conseil" | "chambre_representants" | "chambre_conseillers" | null;
  party: string | null;
  mandate_start: string | null;
  mandate_end: string | null;
  bio: string | null;
  photo_path: string | null;
  display_order: number;
};
export type TerritoryArticle = {
  id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  created_at: string | null;
  category?: { name: string | null; slug: string | null } | null;
};
export type TerritoryChild = TerritoryEntity & { href: string };
export type TerritoryPageData = {
  type: TerritoryKind;
  entity: TerritoryEntity;
  region: TerritoryEntity;
  province?: TerritoryEntity;
  children: TerritoryChild[];
  relatedCommunes: TerritoryChild[];
  officials: TerritoryOfficial[];
  articles: TerritoryArticle[];
};

export type TerritoryResult<T> =
  | { status: "ok"; data: T }
  | { status: "not-found" }
  | { status: "unconfigured" }
  | { status: "error" };

function displayName(item: TerritoryEntity) {
  return item.name_fr || item.name || item.slug;
}

async function fetchAll<T>(queryFactory: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await queryFactory(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) return rows;
  }
}

async function loadTerritoriesHomeData(): Promise<TerritoryResult<{
  regions: Array<TerritoryEntity & { href: string; officialCount: number }>;
  searchItems: Array<{ name: string; nameAr: string; href: string; type: TerritoryKind }>;
  officials: TerritoryOfficial[];
}>> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return { status: "unconfigured" };
  try {
    const [regions, provinces, communes, officialsResult] = await Promise.all([
      supabase.from("regions").select("id,name,name_fr,name_ar,slug,population,sort_order").order("sort_order").order("name"),
      fetchAll((from, to) => supabase.from("provinces").select("id,name,name_fr,name_ar,slug,region_id,population,kind,sort_order").order("name").range(from, to)),
      fetchAll((from, to) => supabase.from("communes").select("id,name,name_fr,name_ar,slug,province_id,population,kind,sort_order").order("name").range(from, to)),
      supabase.from("officials").select("id,territory_type,region_id,province_id,commune_id,full_name,full_name_ar,role,house,party,mandate_start,mandate_end,bio,photo_path,display_order").eq("is_published", true).eq("territory_type", "region").order("display_order"),
    ]);
    if (officialsResult.error && process.env.NODE_ENV !== "production") {
      console.warn("[territories/home] officials table unavailable; run the Territories migration to enable profile previews.");
    }
    const regionRows = (regions.data ?? []) as TerritoryEntity[];
    const provinceRows = provinces as TerritoryEntity[];
    const communeRows = communes as TerritoryEntity[];
    const officials = (officialsResult.data ?? []) as TerritoryOfficial[];
    const searchItems = [
      ...regionRows.map((item) => ({ name: displayName(item), nameAr: item.name_ar ?? "", href: `/territoires/${encodeURIComponent(item.slug)}`, type: "region" as const })),
      ...provinceRows.map((item) => ({ name: displayName(item), nameAr: item.name_ar ?? "", href: `/territoires/${encodeURIComponent(regionRows.find((region) => region.id === item.region_id)?.slug ?? "")}/${encodeURIComponent(item.slug)}`, type: "province" as const })),
      ...communeRows.map((item) => {
        const parentProvince = provinceRows.find((province) => province.id === item.province_id);
        const parentRegion = regionRows.find((region) => region.id === parentProvince?.region_id);
        return { name: displayName(item), nameAr: item.name_ar ?? "", href: `/territoires/${encodeURIComponent(parentRegion?.slug ?? "")}/${encodeURIComponent(parentProvince?.slug ?? "")}/${encodeURIComponent(item.slug)}`, type: "commune" as const };
      }),
    ].filter((item) => !item.href.includes("/territoires//"));
    return {
      status: "ok",
      data: {
        regions: regionRows.map((region) => ({
          ...region,
          href: `/territoires/${encodeURIComponent(region.slug)}`,
          officialCount: officials.filter((official) => official.region_id === region.id).length,
        })),
        searchItems,
        officials,
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("[territories/home]", error);
    return { status: "error" };
  }
}

async function loadTerritoryPageData(input: {
  type: TerritoryKind;
  regionSlug: string;
  provinceSlug?: string;
  communeSlug?: string;
}): Promise<TerritoryResult<TerritoryPageData>> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return { status: "unconfigured" };
  try {
    const { data: regionRow, error: regionError } = await supabase
      .from("regions").select("id,name,name_fr,name_ar,slug,population").eq("slug", input.regionSlug).maybeSingle();
    if (regionError) throw new Error(regionError.message);
    if (!regionRow) return { status: "not-found" };
    const region = regionRow as TerritoryEntity;
    let entity: TerritoryEntity = region;
    let province: TerritoryEntity | undefined;

    if (input.type !== "region") {
      if (!input.provinceSlug) return { status: "not-found" };
      const { data, error } = await supabase.from("provinces")
        .select("id,name,name_fr,name_ar,slug,region_id,population,kind")
        .eq("region_id", region.id).eq("slug", input.provinceSlug).maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return { status: "not-found" };
      province = data as TerritoryEntity;
      entity = province;
    }

    if (input.type === "commune") {
      if (!input.communeSlug || !province) return { status: "not-found" };
      const { data, error } = await supabase.from("communes")
        .select("id,name,name_fr,name_ar,slug,province_id,population,kind,address,phone,website")
        .eq("province_id", province.id).eq("slug", input.communeSlug).maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return { status: "not-found" };
      entity = data as TerritoryEntity;
    }

    const targetColumn = input.type === "region" ? "region_id" : input.type === "province" ? "province_id" : "commune_id";
    const targetId = entity.id;
    const officialQuery = supabase.from("officials")
      .select("id,territory_type,region_id,province_id,commune_id,full_name,full_name_ar,role,house,party,mandate_start,mandate_end,bio,photo_path,display_order")
      .eq("is_published", true).eq(targetColumn, targetId).order("display_order");
    const legacyArticleQuery = supabase.from("articles")
      .select("id,title,slug,excerpt,featured_image,published_at,created_at,category:categories(name,slug)")
      .eq("status", "published").eq(targetColumn, targetId)
      .order("published_at", { ascending: false, nullsFirst: false }).limit(500);
    const linkedRowsQuery = supabase.from("article_territories")
      .select("article_id").eq(targetColumn, targetId);
    const [officialsResult, legacyArticlesResult, linkedRowsResult] = await Promise.all([officialQuery, legacyArticleQuery, linkedRowsQuery]);
    if (officialsResult.error) throw new Error(officialsResult.error.message);
    if (legacyArticlesResult.error) throw new Error(legacyArticlesResult.error.message);
    if (linkedRowsResult.error) throw new Error(linkedRowsResult.error.message);
    const linkedIds = [...new Set((linkedRowsResult.data ?? []).map((row) => row.article_id))];
    let linkedArticles: TerritoryArticle[] = [];
    if (linkedIds.length) {
      const { data, error } = await supabase.from("articles")
        .select("id,title,slug,excerpt,featured_image,published_at,created_at,category:categories(name,slug)")
        .eq("status", "published").in("id", linkedIds).order("published_at", { ascending: false, nullsFirst: false }).limit(500);
      if (error) throw new Error(error.message);
      linkedArticles = (data ?? []) as unknown as TerritoryArticle[];
    }
    const articleMap = new Map<string, TerritoryArticle>();
    for (const article of [...(legacyArticlesResult.data ?? []), ...linkedArticles] as unknown as TerritoryArticle[]) articleMap.set(article.id, article);
    const articles = [...articleMap.values()].sort((a, b) => (b.published_at ?? b.created_at ?? "").localeCompare(a.published_at ?? a.created_at ?? ""));

    let children: TerritoryChild[] = [];
    let relatedCommunes: TerritoryChild[] = [];
    if (input.type === "region") {
      const { data, error } = await supabase.from("provinces")
        .select("id,name,name_fr,name_ar,slug,region_id,population,kind")
        .eq("region_id", entity.id).order("sort_order").order("name");
      if (error) throw new Error(error.message);
      children = (data ?? []).map((item) => ({ ...(item as TerritoryEntity), href: `/territoires/${encodeURIComponent(region.slug)}/${encodeURIComponent(item.slug)}` }));
    } else if (input.type === "province" && province) {
      const { data, error } = await supabase.from("communes")
        .select("id,name,name_fr,name_ar,slug,province_id,population,kind")
        .eq("province_id", province.id).order("sort_order").order("name");
      if (error) throw new Error(error.message);
      children = (data ?? []).map((item) => ({ ...(item as TerritoryEntity), href: `/territoires/${encodeURIComponent(region.slug)}/${encodeURIComponent(province!.slug)}/${encodeURIComponent(item.slug)}` }));
    } else if (input.type === "commune" && province) {
      const { data, error } = await supabase.from("communes")
        .select("id,name,name_fr,name_ar,slug,province_id,population,kind")
        .eq("province_id", province.id).neq("id", entity.id).order("name").limit(8);
      if (error) throw new Error(error.message);
      relatedCommunes = (data ?? []).map((item) => ({ ...(item as TerritoryEntity), href: `/territoires/${encodeURIComponent(region.slug)}/${encodeURIComponent(province!.slug)}/${encodeURIComponent(item.slug)}` }));
    }

    return {
      status: "ok",
      data: {
        type: input.type,
        entity,
        region,
        province,
        children,
        relatedCommunes,
        officials: (officialsResult.data ?? []) as TerritoryOfficial[],
        articles,
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("[territories/page]", error);
    return { status: "error" };
  }
}

export function getTerritoriesHomeData() {
  return unstable_cache(loadTerritoriesHomeData, ["afakpress-territories-home-v1"], {
    revalidate: 300,
    tags: ["territories", "officials"],
  })();
}

export function getTerritoryPageData(input: {
  type: TerritoryKind;
  regionSlug: string;
  provinceSlug?: string;
  communeSlug?: string;
}) {
  return unstable_cache(loadTerritoryPageData, ["afakpress-territory-page-v1"], {
    revalidate: 300,
    tags: ["territories", "officials", "articles"],
  })(input);
}

export async function getTerritoryStaticParams(type: "region" | "province") {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];
  if (type === "region") {
    const { data, error } = await supabase.from("regions").select("slug").order("sort_order");
    if (error) return [];
    return (data ?? []).filter((item) => item.slug).map((item) => ({ region: item.slug as string }));
  }
  const [provinceResult, regionResult] = await Promise.all([
    supabase.from("provinces").select("slug,region_id").order("name"),
    supabase.from("regions").select("id,slug"),
  ]);
  if (provinceResult.error || regionResult.error) return [];
  const regionSlugs = new Map((regionResult.data ?? []).map((region) => [region.id, region.slug]));
  return (provinceResult.data ?? []).flatMap((item) => {
    const parentSlug = item.region_id ? regionSlugs.get(item.region_id) : null;
    return item.slug && parentSlug ? [{ region: parentSlug, province: item.slug }] : [];
  });
}

export async function getOfficialProfileData(id: string): Promise<TerritoryResult<{
  official: TerritoryOfficial;
  territory: TerritoryEntity;
  region?: TerritoryEntity;
  province?: TerritoryEntity;
}>> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return { status: "unconfigured" };
  const { data, error } = await supabase.from("officials")
    .select("id,territory_type,region_id,province_id,commune_id,full_name,full_name_ar,role,house,party,mandate_start,mandate_end,bio,photo_path,display_order")
    .eq("id", id).eq("is_published", true).maybeSingle();
  if (error) {
    if (process.env.NODE_ENV !== "production") console.error("[territories/official]", error);
    return { status: "error" };
  }
  if (!data) return { status: "not-found" };
  const official = data as TerritoryOfficial;
  let territory: TerritoryEntity | null = null;
  let region: TerritoryEntity | undefined;
  let province: TerritoryEntity | undefined;
  if (official.territory_type === "region" && official.region_id) {
    const result = await supabase.from("regions").select("id,name,name_fr,name_ar,slug,population").eq("id", official.region_id).maybeSingle();
    if (result.error) return { status: "error" };
    territory = result.data as TerritoryEntity | null;
    region = territory ?? undefined;
  } else if (official.territory_type === "province" && official.province_id) {
    const result = await supabase.from("provinces").select("id,name,name_fr,name_ar,slug,region_id,population,kind").eq("id", official.province_id).maybeSingle();
    if (result.error) return { status: "error" };
    territory = result.data as TerritoryEntity | null;
    if (territory?.region_id) {
      const parent = await supabase.from("regions").select("id,name,name_fr,name_ar,slug,population").eq("id", territory.region_id).maybeSingle();
      if (parent.error) return { status: "error" };
      region = parent.data as TerritoryEntity | undefined;
    }
    province = territory ?? undefined;
  } else if (official.territory_type === "commune" && official.commune_id) {
    const result = await supabase.from("communes").select("id,name,name_fr,name_ar,slug,province_id,population,kind,address,phone,website").eq("id", official.commune_id).maybeSingle();
    if (result.error) return { status: "error" };
    territory = result.data as TerritoryEntity | null;
    if (territory?.province_id) {
      const parent = await supabase.from("provinces").select("id,name,name_fr,name_ar,slug,region_id,population,kind").eq("id", territory.province_id).maybeSingle();
      if (parent.error) return { status: "error" };
      province = parent.data as TerritoryEntity | undefined;
      if (province?.region_id) {
        const grandparent = await supabase.from("regions").select("id,name,name_fr,name_ar,slug,population").eq("id", province.region_id).maybeSingle();
        if (grandparent.error) return { status: "error" };
        region = grandparent.data as TerritoryEntity | undefined;
      }
    }
  }
  if (!territory) return { status: "not-found" };
  return { status: "ok", data: { official, territory, region, province } };
}
