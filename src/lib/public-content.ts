import { createServerSupabaseClient } from "@/lib/supabase";

export type PublicEntity = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type PublicArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category_id: string | null;
  region_id: string | null;
  province_id: string | null;
  commune_id: string | null;
  published_at: string | null;
  created_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  category?: PublicEntity | null;
  region?: PublicEntity | null;
  province?: PublicEntity | null;
  commune?: PublicEntity | null;
};

export type PublicLocation = {
  entity: PublicEntity;
  region?: PublicEntity;
  province?: PublicEntity;
  provinces?: Array<PublicEntity & { communes: PublicEntity[] }>;
  communes?: PublicEntity[];
};

export type PublicQueryResult<T> =
  | { status: "ok"; data: T }
  | { status: "not-found" }
  | { status: "unconfigured" }
  | { status: "error" };

const articleSelect = `
  id,title,slug,excerpt,content,featured_image,
  category_id,region_id,province_id,commune_id,
  published_at,created_at,seo_title,seo_description,
  category:categories(id,name,slug),
  region:regions(id,name,slug),
  province:provinces(id,name,slug),
  commune:communes(id,name,slug)
`;

function normalizedSlug(value: string) {
  try {
    return decodeURIComponent(value).normalize("NFC").trim();
  } catch {
    return value.normalize("NFC").trim();
  }
}

function logQueryError(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[public-content/${scope}] Supabase query failed`, error);
  }
}

async function publishedArticles(): Promise<PublicQueryResult<PublicArticle[]>> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return { status: "unconfigured" };

  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    logQueryError("articles", error);
    return { status: "error" };
  }
  return { status: "ok", data: (data ?? []) as unknown as PublicArticle[] };
}

export async function getPublishedArticleBySlug(slug: string): Promise<PublicQueryResult<PublicArticle>> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return { status: "unconfigured" };

  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("slug", normalizedSlug(slug))
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    logQueryError("article", error);
    return { status: "error" };
  }
  if (!data) return { status: "not-found" };
  return { status: "ok", data: data as unknown as PublicArticle };
}

export async function getCategoryPageData(slug: string): Promise<PublicQueryResult<{ entity: PublicEntity; articles: PublicArticle[] }>> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return { status: "unconfigured" };

  const { data: entity, error } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .eq("slug", normalizedSlug(slug))
    .maybeSingle();

  if (error) {
    logQueryError("category", error);
    return { status: "error" };
  }
  if (!entity) return { status: "not-found" };
  const category = entity as unknown as PublicEntity;

  const articles = await publishedArticles();
  if (articles.status !== "ok") return articles;
  return {
    status: "ok",
    data: {
      entity: category,
      articles: articles.data.filter((article) => article.category_id === category.id),
    },
  };
}

async function locationRows() {
  const supabase = createServerSupabaseClient();
  if (!supabase) return { status: "unconfigured" } as const;
  const [regions, provinces, communes] = await Promise.all([
    supabase.from("regions").select("id,name,slug"),
    supabase.from("provinces").select("id,region_id,name,slug"),
    supabase.from("communes").select("id,province_id,name,slug"),
  ]);
  const error = regions.error ?? provinces.error ?? communes.error;
  if (error) {
    logQueryError("locations", error);
    return { status: "error" } as const;
  }
  return {
    status: "ok" as const,
    regions: (regions.data ?? []) as PublicEntity[],
    provinces: (provinces.data ?? []) as Array<PublicEntity & { region_id: string | null }>,
    communes: (communes.data ?? []) as Array<PublicEntity & { province_id: string | null }>,
  };
}

export async function getRegionPageData(slug: string): Promise<PublicQueryResult<{ location: PublicLocation; articles: PublicArticle[] }>> {
  const locations = await locationRows();
  if (locations.status !== "ok") return locations;
  const entity = locations.regions.find((region) => region.slug === normalizedSlug(slug));
  if (!entity) return { status: "not-found" };

  const provinces = locations.provinces
    .filter((province) => province.region_id === entity.id)
    .map((province) => ({
      ...province,
      communes: locations.communes.filter((commune) => commune.province_id === province.id),
    }));
  const provinceIds = new Set(provinces.map((province) => province.id));
  const communeIds = new Set(provinces.flatMap((province) => province.communes.map((commune) => commune.id)));
  const articles = await publishedArticles();
  if (articles.status !== "ok") return articles;

  return {
    status: "ok",
    data: {
      location: { entity, provinces },
      articles: articles.data.filter((article) =>
        article.region_id === entity.id ||
        (article.province_id ? provinceIds.has(article.province_id) : false) ||
        (article.commune_id ? communeIds.has(article.commune_id) : false)),
    },
  };
}

export async function getProvincePageData(slug: string): Promise<PublicQueryResult<{ location: PublicLocation; articles: PublicArticle[] }>> {
  const locations = await locationRows();
  if (locations.status !== "ok") return locations;
  const entity = locations.provinces.find((province) => province.slug === normalizedSlug(slug));
  if (!entity) return { status: "not-found" };
  const region = locations.regions.find((item) => item.id === entity.region_id);
  const communes = locations.communes.filter((commune) => commune.province_id === entity.id);
  const communeIds = new Set(communes.map((commune) => commune.id));
  const articles = await publishedArticles();
  if (articles.status !== "ok") return articles;

  return {
    status: "ok",
    data: {
      location: { entity, region, communes },
      articles: articles.data.filter((article) =>
        article.province_id === entity.id ||
        (article.commune_id ? communeIds.has(article.commune_id) : false)),
    },
  };
}

export async function getCommunePageData(slug: string): Promise<PublicQueryResult<{ location: PublicLocation; articles: PublicArticle[] }>> {
  const locations = await locationRows();
  if (locations.status !== "ok") return locations;
  const entity = locations.communes.find((commune) => commune.slug === normalizedSlug(slug));
  if (!entity) return { status: "not-found" };
  const province = locations.provinces.find((item) => item.id === entity.province_id);
  const region = locations.regions.find((item) => item.id === province?.region_id);
  const articles = await publishedArticles();
  if (articles.status !== "ok") return articles;

  return {
    status: "ok",
    data: {
      location: { entity, province, region },
      articles: articles.data.filter((article) => article.commune_id === entity.id),
    },
  };
}
