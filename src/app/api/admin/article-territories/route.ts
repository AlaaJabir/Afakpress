import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { createServiceSupabaseAdminClient } from "@/lib/supabase";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

async function authorized(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  return Boolean(session && (session.role === "super_admin" || session.role === "admin"));
}

function linkPayload(input: Record<string, unknown>) {
  if (!["region", "province", "commune"].includes(String(input.territory_type))) return null;
  const type = input.territory_type as "region" | "province" | "commune";
  const regionId = typeof input.region_id === "string" ? input.region_id : null;
  const provinceId = typeof input.province_id === "string" ? input.province_id : null;
  const communeId = typeof input.commune_id === "string" ? input.commune_id : null;
  const valid =
    (type === "region" && !!regionId && !provinceId && !communeId) ||
    (type === "province" && !regionId && !!provinceId && !communeId) ||
    (type === "commune" && !regionId && !provinceId && !!communeId);
  if (!valid || typeof input.article_id !== "string") return null;
  return { article_id: input.article_id, territory_type: type, region_id: regionId, province_id: provinceId, commune_id: communeId };
}

function revalidateTerritoryContent() {
  revalidatePath("/territoires");
  revalidateTag("territories", { expire: 0 });
  revalidateTag("articles", { expire: 0 });
}

export async function GET(request: Request) {
  if (!await authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  const { data, error } = await supabase.from("article_territories")
    .select("id,article_id,territory_type,region_id,province_id,commune_id,created_at")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 503 });
  return Response.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  if (!await authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  const payload = linkPayload(await request.json() as Record<string, unknown>);
  if (!payload) return Response.json({ error: "Select one article and exactly one territory." }, { status: 400 });
  const { data, error } = await supabase.from("article_territories").insert(payload)
    .select("id,article_id,territory_type,region_id,province_id,commune_id,created_at").single();
  if (error) return Response.json({ error: error.code === "23505" ? "This article is already linked to that territory." : error.message }, { status: error.code === "23505" ? 409 : 400 });
  revalidateTerritoryContent();
  return Response.json({ data }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!await authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing link id." }, { status: 400 });
  const { error } = await supabase.from("article_territories").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidateTerritoryContent();
  return Response.json({ ok: true });
}
