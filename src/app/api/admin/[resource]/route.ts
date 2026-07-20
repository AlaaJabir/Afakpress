import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsRoleFromAdmin } from "@/lib/admin-roles";
import { canAccess } from "@/lib/cms";
import { articlePayloadSchema, formatZodError } from "@/lib/article-validation";
import { resolveArticleReferences, seedDefaultCmsReferences } from "@/lib/cms-reference-data";
import { createServiceSupabaseAdminClient } from "@/lib/supabase";
import type { AdminResource } from "@/lib/supabase-cms";
import { isValidUuid } from "@/lib/uuid";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

const resources: AdminResource[] = ["articles", "categories", "menus", "media", "breaking_news", "pages", "settings", "profiles", "regions", "provinces", "communes", "comments"];
const resourcePermission: Record<AdminResource, string> = {
  articles: "articles",
  categories: "categories",
  menus: "menus",
  media: "media",
  breaking_news: "breaking",
  pages: "pages",
  settings: "settings",
  profiles: "authors",
  regions: "regions",
  provinces: "regions",
  communes: "regions",
  comments: "comments",
};

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

async function isAuthorized(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  return session;
}

async function authorizeResource(request: Request, table: AdminResource) {
  const session = await isAuthorized(request);
  if (!session) return { response: unauthorized() };
  if (!canAccess(cmsRoleFromAdmin(session.role), resourcePermission[table])) {
    return { response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

function tableName(resource: string): AdminResource | null {
  return resources.includes(resource as AdminResource) ? (resource as AdminResource) : null;
}

type ArticleCacheRow = {
  slug?: string | null;
  status?: string | null;
  category_id?: string | null;
  region_id?: string | null;
  province_id?: string | null;
  commune_id?: string | null;
};

type ArticleCacheRefs = {
  categorySlug?: string;
  regionSlug?: string;
  provinceSlug?: string;
  communeSlug?: string;
};

type LocationReference = {
  id?: string;
  name?: string;
  slug?: string;
};

type ArticleLocationReferences = {
  region?: LocationReference | null;
  province?: LocationReference | null;
  commune?: LocationReference | null;
};

async function resolveArticleCacheRefs(supabase: NonNullable<ReturnType<typeof createServiceSupabaseAdminClient>>, article: ArticleCacheRow): Promise<ArticleCacheRefs> {
  const [category, region, province, commune] = await Promise.all([
    article.category_id ? supabase.from("categories").select("slug").eq("id", article.category_id).maybeSingle() : Promise.resolve({ data: null }),
    article.region_id ? supabase.from("regions").select("slug").eq("id", article.region_id).maybeSingle() : Promise.resolve({ data: null }),
    article.province_id ? supabase.from("provinces").select("slug").eq("id", article.province_id).maybeSingle() : Promise.resolve({ data: null }),
    article.commune_id ? supabase.from("communes").select("slug").eq("id", article.commune_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  return {
    categorySlug: category.data?.slug ?? undefined,
    regionSlug: region.data?.slug ?? undefined,
    provinceSlug: province.data?.slug ?? undefined,
    communeSlug: commune.data?.slug ?? undefined,
  };
}

async function validateArticleHierarchy(supabase: NonNullable<ReturnType<typeof createServiceSupabaseAdminClient>>, payload: Record<string, unknown>) {
  const regionId = typeof payload.region_id === "string" ? payload.region_id : null;
  const provinceId = typeof payload.province_id === "string" ? payload.province_id : null;
  const communeId = typeof payload.commune_id === "string" ? payload.commune_id : null;

  if (provinceId) {
    if (!regionId) return "Selected province requires a selected region.";
    const { data, error } = await supabase.from("provinces").select("id").eq("id", provinceId).eq("region_id", regionId).maybeSingle();
    if (error) return error.message;
    if (!data) return "Selected province must belong to the selected region.";
  }

  if (communeId) {
    if (!provinceId) return "Selected commune requires a selected province.";
    const { data, error } = await supabase.from("communes").select("id").eq("id", communeId).eq("province_id", provinceId).maybeSingle();
    if (error) return error.message;
    if (!data) return "Selected commune must belong to the selected province.";
  }

  return "";
}

function readLocationReferences(value: unknown): ArticleLocationReferences {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  const read = (key: "region" | "province" | "commune") => {
    const item = record[key];
    if (!item || typeof item !== "object") return null;
    const location = item as Record<string, unknown>;
    return {
      id: typeof location.id === "string" ? location.id : undefined,
      name: typeof location.name === "string" ? location.name : undefined,
      slug: typeof location.slug === "string" ? location.slug : undefined,
    };
  };

  return {
    region: read("region"),
    province: read("province"),
    commune: read("commune"),
  };
}

async function ensureLocationRow(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseAdminClient>>,
  table: "regions" | "provinces" | "communes",
  row: Record<string, string>,
) {
  const { data, error } = await supabase.from(table).select("id").eq("id", row.id).maybeSingle();
  if (error) return error.message;
  if (data) return "";

  const { error: insertError } = table === "regions"
    ? await supabase.from("regions").insert({ id: row.id, name: row.name, slug: row.slug })
    : table === "provinces"
      ? await supabase.from("provinces").insert({ id: row.id, region_id: row.region_id, name: row.name, slug: row.slug })
      : await supabase.from("communes").insert({ id: row.id, province_id: row.province_id, name: row.name, slug: row.slug });
  if (!insertError) return "";
  if (insertError.message.toLowerCase().includes("duplicate key")) return "";
  return insertError.message;
}

async function ensureArticleLocationReferences(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseAdminClient>>,
  payload: Record<string, unknown>,
  references: ArticleLocationReferences,
) {
  const regionId = typeof payload.region_id === "string" ? payload.region_id : "";
  const provinceId = typeof payload.province_id === "string" ? payload.province_id : "";
  const communeId = typeof payload.commune_id === "string" ? payload.commune_id : "";

  if (regionId && references.region?.id === regionId && references.region.name && references.region.slug) {
    const error = await ensureLocationRow(supabase, "regions", { id: regionId, name: references.region.name, slug: references.region.slug });
    if (error) return error;
  }

  if (provinceId && regionId && references.province?.id === provinceId && references.province.name && references.province.slug) {
    const error = await ensureLocationRow(supabase, "provinces", { id: provinceId, region_id: regionId, name: references.province.name, slug: references.province.slug });
    if (error) return error;
  }

  if (communeId && provinceId && references.commune?.id === communeId && references.commune.name && references.commune.slug) {
    const error = await ensureLocationRow(supabase, "communes", { id: communeId, province_id: provinceId, name: references.commune.name, slug: references.commune.slug });
    if (error) return error;
  }

  return "";
}

function articlePaths(article: ArticleCacheRow, refs: ArticleCacheRefs) {
  const paths = new Set<string>(["/"]);
  if (article.slug) paths.add(`/article/${article.slug}`);
  if (refs.categorySlug) paths.add(`/category/${refs.categorySlug}`);
  if (refs.regionSlug) paths.add(`/region/${refs.regionSlug}`);
  if (refs.provinceSlug) paths.add(`/province/${refs.provinceSlug}`);
  if (refs.communeSlug) paths.add(`/commune/${refs.communeSlug}`);
  return paths;
}

async function revalidateArticlePublishScope(supabase: NonNullable<ReturnType<typeof createServiceSupabaseAdminClient>>, ...articles: (ArticleCacheRow | null | undefined)[]) {
  const publishedArticles = articles.filter((article): article is ArticleCacheRow => article?.status === "published");
  if (!publishedArticles.length) return [];

  const paths = new Set<string>();
  for (const article of publishedArticles) {
    const refs = await resolveArticleCacheRefs(supabase, article);
    for (const path of articlePaths(article, refs)) paths.add(path);
  }

  for (const path of paths) revalidatePath(path);
  revalidateTag("cms:articles", { expire: 0 });
  return [...paths];
}

async function validateProfileAuthUser(supabase: NonNullable<ReturnType<typeof createServiceSupabaseAdminClient>>, id: unknown) {
  if (!isValidUuid(id)) return "Profile id must be an existing Supabase Auth user UUID.";
  const { data, error } = await supabase.auth.admin.getUserById(id);
  if (error || !data?.user) return "Create the user in Supabase Auth before saving an author profile.";
  return "";
}

async function prepareArticlePayload(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseAdminClient>>,
  session: NonNullable<Awaited<ReturnType<typeof getAdminSessionFromRequest>>>,
  payload: Record<string, unknown>,
) {
  const locationReferences = readLocationReferences(payload.__location);
  delete payload.__location;

  const parsed = articlePayloadSchema.safeParse(payload);
  if (!parsed.success) return formatZodError(parsed.error);

  Object.assign(payload, parsed.data);
  console.info("[admin/articles] payload before FK validation", {
    category_id: payload.category_id,
    region_id: payload.region_id,
    province_id: payload.province_id,
    commune_id: payload.commune_id,
    author_id: payload.author_id,
  });

  const seedError = await seedDefaultCmsReferences(supabase, {
    id: session.userId,
    name: session.email,
    email: session.email,
    role: cmsRoleFromAdmin(session.role),
    avatar: null,
  }, { includeLocations: false });
  if (seedError) return seedError;

  const locationError = await ensureArticleLocationReferences(supabase, payload, locationReferences);
  if (locationError) return locationError;

  const relationError = await resolveArticleReferences(supabase, payload);
  if (relationError) return relationError;

  const hierarchyError = await validateArticleHierarchy(supabase, payload);
  if (hierarchyError) return hierarchyError;

  console.info("[admin/articles] payload after FK validation", {
    category_id: payload.category_id,
    region_id: payload.region_id,
    province_id: payload.province_id,
    commune_id: payload.commune_id,
    author_id: payload.author_id,
  });

  return "";
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const { resource } = await context.params;
  const table = tableName(resource);
  if (!table) return Response.json({ error: "Unknown admin resource." }, { status: 404 });
  const authorization = await authorizeResource(request, table);
  if (authorization.response) return authorization.response;

  const payload = await request.json();
  if (table === "articles") {
    const error = await prepareArticlePayload(supabase, authorization.session, payload);
    if (error) return Response.json({ error }, { status: 400 });

    const { data: existing } = await supabase.from(table).select("id").eq("slug", payload.slug).maybeSingle();
    if (existing) return Response.json({ error: "Article slug already exists." }, { status: 409 });
  }
  if (table === "profiles") {
    const error = await validateProfileAuthUser(supabase, payload.id);
    if (error) return Response.json({ error }, { status: 400 });
  }

  const { data, error } = await supabase.from(table).insert(payload).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const revalidatedPaths = table === "articles" ? await revalidateArticlePublishScope(supabase, data as ArticleCacheRow) : [];
  return Response.json({ data, revalidatedPaths });
}

export async function PATCH(request: Request, context: { params: Promise<{ resource: string }> }) {
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const { resource } = await context.params;
  const table = tableName(resource);
  if (!table) return Response.json({ error: "Unknown admin resource." }, { status: 404 });
  const authorization = await authorizeResource(request, table);
  if (authorization.response) return authorization.response;

  const { id, ...payload } = await request.json();
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });
  if (table === "profiles") {
    const error = await validateProfileAuthUser(supabase, id);
    if (error) return Response.json({ error }, { status: 400 });
  }
  let previousArticle: ArticleCacheRow | null = null;
  if (table === "articles") {
    if (!isValidUuid(id)) return Response.json({ error: "Article id must be a valid UUID." }, { status: 400 });

    const { data: existingArticle, error: existingArticleError } = await supabase
      .from(table)
      .select("slug,status,category_id,region_id,province_id,commune_id")
      .eq("id", id)
      .maybeSingle();
    if (existingArticleError) return Response.json({ error: existingArticleError.message }, { status: 400 });
    previousArticle = existingArticle as ArticleCacheRow | null;

    const error = await prepareArticlePayload(supabase, authorization.session, payload);
    if (error) return Response.json({ error }, { status: 400 });

    const { data: existing } = await supabase.from(table).select("id").eq("slug", payload.slug).neq("id", id).maybeSingle();
    if (existing) return Response.json({ error: "Article slug already exists." }, { status: 409 });
  }

  const { data, error } = await supabase.from(table).update(payload).eq("id", id).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const revalidatedPaths = table === "articles" ? await revalidateArticlePublishScope(supabase, previousArticle, data as ArticleCacheRow) : [];
  return Response.json({ data, revalidatedPaths });
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string }> }) {
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const { resource } = await context.params;
  const table = tableName(resource);
  if (!table) return Response.json({ error: "Unknown admin resource." }, { status: 404 });
  const authorization = await authorizeResource(request, table);
  if (authorization.response) return authorization.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });

  const { data: previousArticle } = table === "articles"
    ? await supabase.from(table).select("slug,status,category_id,region_id,province_id,commune_id").eq("id", id).maybeSingle()
    : { data: null };

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const revalidatedPaths = table === "articles" ? await revalidateArticlePublishScope(supabase, previousArticle as ArticleCacheRow | null) : [];
  return Response.json({ ok: true, revalidatedPaths });
}
