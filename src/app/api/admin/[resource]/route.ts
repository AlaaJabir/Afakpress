import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsRoleFromAdmin } from "@/lib/admin-roles";
import { canAccess } from "@/lib/cms";
import { articlePayloadSchema, formatZodError } from "@/lib/article-validation";
import { resolveArticleReferences, seedDefaultCmsReferences } from "@/lib/cms-reference-data";
import { createServiceSupabaseAdminClient, createServiceSupabaseClient } from "@/lib/supabase";
import type { AdminResource } from "@/lib/supabase-cms";
import { isValidUuid } from "@/lib/uuid";

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

async function prepareArticlePayload(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  session: NonNullable<Awaited<ReturnType<typeof getAdminSessionFromRequest>>>,
  payload: Record<string, unknown>,
) {
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
  });
  if (seedError) return seedError;

  const relationError = await resolveArticleReferences(supabase, payload);
  if (relationError) return relationError;

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
  const typedSupabase = createServiceSupabaseClient();
  if (!supabase || !typedSupabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const { resource } = await context.params;
  const table = tableName(resource);
  if (!table) return Response.json({ error: "Unknown admin resource." }, { status: 404 });
  const authorization = await authorizeResource(request, table);
  if (authorization.response) return authorization.response;

  const payload = await request.json();
  if (table === "articles") {
    const error = await prepareArticlePayload(typedSupabase, authorization.session, payload);
    if (error) return Response.json({ error }, { status: 400 });

    const { data: existing } = await supabase.from(table).select("id").eq("slug", payload.slug).maybeSingle();
    if (existing) return Response.json({ error: "Article slug already exists." }, { status: 409 });
  }

  const { data, error } = await supabase.from(table).insert(payload).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}

export async function PATCH(request: Request, context: { params: Promise<{ resource: string }> }) {
  const supabase = createServiceSupabaseAdminClient();
  const typedSupabase = createServiceSupabaseClient();
  if (!supabase || !typedSupabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const { resource } = await context.params;
  const table = tableName(resource);
  if (!table) return Response.json({ error: "Unknown admin resource." }, { status: 404 });
  const authorization = await authorizeResource(request, table);
  if (authorization.response) return authorization.response;

  const { id, ...payload } = await request.json();
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });
  if (table === "articles") {
    if (!isValidUuid(id)) return Response.json({ error: "Article id must be a valid UUID." }, { status: 400 });

    const error = await prepareArticlePayload(typedSupabase, authorization.session, payload);
    if (error) return Response.json({ error }, { status: 400 });

    const { data: existing } = await supabase.from(table).select("id").eq("slug", payload.slug).neq("id", id).maybeSingle();
    if (existing) return Response.json({ error: "Article slug already exists." }, { status: 409 });
  }

  const { data, error } = await supabase.from(table).update(payload).eq("id", id).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
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

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
