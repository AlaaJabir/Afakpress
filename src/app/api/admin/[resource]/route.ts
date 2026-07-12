import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsRoleFromAdmin } from "@/lib/admin-roles";
import { canAccess } from "@/lib/cms";
import { createServiceSupabaseAdminClient } from "@/lib/supabase";
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

function normalizeNullableUuid(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  if (value === "" || value === null || value === undefined) {
    payload[key] = null;
    return "";
  }
  if (!isValidUuid(value)) return `${key} must be a valid UUID or null.`;
  return "";
}

function normalizeArticlePayload(payload: Record<string, unknown>) {
  const uuidFields = ["category_id", "author_id", "region_id", "province_id", "commune_id"];
  for (const field of uuidFields) {
    const error = normalizeNullableUuid(payload, field);
    if (error) return error;
  }

  const allowedStatuses = new Set(["draft", "pending_review", "scheduled", "published"]);
  if (typeof payload.status === "string" && !allowedStatuses.has(payload.status)) {
    return "status must be draft, pending_review, scheduled, or published.";
  }

  if (payload.published_at !== null && payload.published_at !== undefined && payload.published_at !== "") {
    if (typeof payload.published_at !== "string" || Number.isNaN(Date.parse(payload.published_at))) {
      return "published_at must be a valid timestamp or null.";
    }
  } else {
    payload.published_at = null;
  }

  if (typeof payload.slug !== "string" || !payload.slug.trim()) return "slug is required.";
  if (typeof payload.title !== "string" || !payload.title.trim()) return "title is required.";

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
    const error = normalizeArticlePayload(payload);
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
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const { resource } = await context.params;
  const table = tableName(resource);
  if (!table) return Response.json({ error: "Unknown admin resource." }, { status: 404 });
  const authorization = await authorizeResource(request, table);
  if (authorization.response) return authorization.response;

  const { id, ...payload } = await request.json();
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });
  if (table === "articles") {
    if (!isValidUuid(id)) return Response.json({ error: "Article id must be a valid UUID." }, { status: 400 });

    const error = normalizeArticlePayload(payload);
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
