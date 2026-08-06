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
  author_id: string | null;
  region_id: string | null;
  province_id: string | null;
  commune_id: string | null;
  published_at: string | null;
  created_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  category?: PublicEntity | null;
  author?: PublicEntity | null;
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
  category_id,author_id,region_id,province_id,commune_id,
  published_at,created_at,seo_title,seo_description,
  category:categories(id,name,slug),
  author:profiles(id,name,slug)
`;

const articleDetailSelect = `
  id,title,slug,excerpt,content,featured_image,
  category_id,author_id,region_id,province_id,commune_id,
  published_at,created_at,seo_title,seo_description
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
  const requestedSlug = normalizedSlug(slug);

  const { data, error } = await supabase
    .from("articles")
    .select(articleDetailSelect)
    .eq("slug", requestedSlug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Article fetch error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        slug: requestedSlug,
      });
    }
    return { status: "error" };
  }
  if (!data) return { status: "not-found" };
  const article = data as unknown as PublicArticle;

  if (process.env.NODE_ENV !== "production") {
    console.info("Article slug match:", { requestedSlug, storedSlug: article.slug });
  }

  const [categoryResult, regionResult, provinceResult, communeResult] = await Promise.all([
    article.category_id
      ? supabase.from("categories").select("id,name,slug").eq("id", article.category_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    article.region_id
      ? supabase.from("regions").select("id,name,slug").eq("id", article.region_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    article.province_id
      ? supabase.from("provinces").select("id,name,slug").eq("id", article.province_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    article.commune_id
      ? supabase.from("communes").select("id,name,slug").eq("id", article.commune_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  for (const [relation, relationError] of [
    ["category", categoryResult.error],
    ["region", regionResult.error],
    ["province", provinceResult.error],
    ["commune", communeResult.error],
  ] as const) {
    if (relationError) logQueryError(`article/${relation}`, relationError);
  }

  return {
    status: "ok",
    data: {
      ...article,
      category: categoryResult.data as PublicEntity | null,
      region: regionResult.data as PublicEntity | null,
      province: provinceResult.data as PublicEntity | null,
      commune: communeResult.data as PublicEntity | null,
    },
  };
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

type GeographicTable = "regions" | "provinces" | "communes";
type GeographicForeignKey = "region_id" | "province_id" | "commune_id";

async function geographicEntity(
  table: GeographicTable,
  slug: string,
): Promise<PublicQueryResult<PublicEntity>> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return { status: "unconfigured" };

  const { data, error } = await supabase
    .from(table)
    .select("id,name,slug")
    .eq("slug", normalizedSlug(slug))
    .maybeSingle();

  if (error) {
    logQueryError(`${table}/slug`, error);
    return { status: "error" };
  }
  if (!data) return { status: "not-found" };
  return { status: "ok", data: data as PublicEntity };
}

async function geographicArticles(
  foreignKey: GeographicForeignKey,
  entityId: string,
): Promise<PublicQueryResult<PublicArticle[]>> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return { status: "unconfigured" };

  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("status", "published")
    .eq(foreignKey, entityId)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false });

  if (error) {
    logQueryError(`articles/${foreignKey}`, error);
    return { status: "error" };
  }

  const articles = (data ?? []) as unknown as PublicArticle[];
  const uniqueArticles = articles.filter(
    (article, index) =>
      articles.findIndex((candidate) => candidate.id === article.id || candidate.slug === article.slug) === index,
  );
  return { status: "ok", data: uniqueArticles };
}

export async function getRegionPageData(slug: string): Promise<PublicQueryResult<{ location: PublicLocation; articles: PublicArticle[] }>> {
  const entityResult = await geographicEntity("regions", slug);
  if (entityResult.status !== "ok") return entityResult;
  const entity = entityResult.data;
  const locations = await locationRows();
  if (locations.status !== "ok") return locations;

  const provinces = locations.provinces
    .filter((province) => province.region_id === entity.id)
    .map((province) => ({
      ...province,
      communes: locations.communes.filter((commune) => commune.province_id === province.id),
    }));
  const articles = await geographicArticles("region_id", entity.id);
  if (articles.status !== "ok") return articles;

  return {
    status: "ok",
    data: {
      location: { entity, provinces },
      articles: articles.data,
    },
  };
}

export async function getProvincePageData(slug: string): Promise<PublicQueryResult<{ location: PublicLocation; articles: PublicArticle[] }>> {
  const entityResult = await geographicEntity("provinces", slug);
  if (entityResult.status !== "ok") return entityResult;
  const entity = entityResult.data;
  const locations = await locationRows();
  if (locations.status !== "ok") return locations;
  const provinceRow = locations.provinces.find((province) => province.id === entity.id);
  const region = locations.regions.find((item) => item.id === provinceRow?.region_id);
  const communes = locations.communes.filter((commune) => commune.province_id === entity.id);
  const articles = await geographicArticles("province_id", entity.id);
  if (articles.status !== "ok") return articles;

  return {
    status: "ok",
    data: {
      location: { entity, region, communes },
      articles: articles.data,
    },
  };
}

export async function getCommunePageData(slug: string): Promise<PublicQueryResult<{ location: PublicLocation; articles: PublicArticle[] }>> {
  const entityResult = await geographicEntity("communes", slug);
  if (entityResult.status !== "ok") return entityResult;
  const entity = entityResult.data;
  const locations = await locationRows();
  if (locations.status !== "ok") return locations;
  const communeRow = locations.communes.find((commune) => commune.id === entity.id);
  const province = locations.provinces.find((item) => item.id === communeRow?.province_id);
  const region = locations.regions.find((item) => item.id === province?.region_id);
  const articles = await geographicArticles("commune_id", entity.id);
  if (articles.status !== "ok") return articles;

  return {
    status: "ok",
    data: {
      location: { entity, province, region },
      articles: articles.data,
    },
  };
}
