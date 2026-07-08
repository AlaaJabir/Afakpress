import { cmsCredentials } from "@/lib/cms";
import { createServiceSupabaseAdminClient } from "@/lib/supabase";
import type { AdminResource } from "@/lib/supabase-cms";

export const dynamic = "force-dynamic";

const resources: AdminResource[] = ["articles", "categories", "menus", "media", "breaking_news", "pages", "settings"];

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function isAuthorized(request: Request) {
  const email = request.headers.get("x-afakpress-admin-email")?.toLowerCase();
  const password = request.headers.get("x-afakpress-admin-password");
  const account = email ? cmsCredentials[email] : null;
  return Boolean(account && password && account.password === password);
}

function tableName(resource: string): AdminResource | null {
  return resources.includes(resource as AdminResource) ? (resource as AdminResource) : null;
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  if (!isAuthorized(request)) return unauthorized();
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const { resource } = await context.params;
  const table = tableName(resource);
  if (!table) return Response.json({ error: "Unknown admin resource." }, { status: 404 });

  const payload = await request.json();
  const { data, error } = await supabase.from(table).insert(payload).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}

export async function PATCH(request: Request, context: { params: Promise<{ resource: string }> }) {
  if (!isAuthorized(request)) return unauthorized();
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const { resource } = await context.params;
  const table = tableName(resource);
  if (!table) return Response.json({ error: "Unknown admin resource." }, { status: 404 });

  const { id, ...payload } = await request.json();
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });

  const { data, error } = await supabase.from(table).update(payload).eq("id", id).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string }> }) {
  if (!isAuthorized(request)) return unauthorized();
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const { resource } = await context.params;
  const table = tableName(resource);
  if (!table) return Response.json({ error: "Unknown admin resource." }, { status: 404 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
