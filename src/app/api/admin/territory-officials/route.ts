import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { createServiceSupabaseAdminClient } from "@/lib/supabase";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

const columns = "id,territory_type,region_id,province_id,commune_id,full_name,full_name_ar,role,house,party,mandate_start,mandate_end,bio,photo_path,display_order,is_published,created_at,updated_at";

async function authorize(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) return null;
  if (session.role !== "super_admin" && session.role !== "admin") return null;
  return session;
}

function validPayload(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (!["region", "province", "commune"].includes(String(input.territory_type))) return null;
  const territoryType = input.territory_type as "region" | "province" | "commune";
  const regionId = typeof input.region_id === "string" ? input.region_id : null;
  const provinceId = typeof input.province_id === "string" ? input.province_id : null;
  const communeId = typeof input.commune_id === "string" ? input.commune_id : null;
  const validTarget =
    (territoryType === "region" && !!regionId && !provinceId && !communeId) ||
    (territoryType === "province" && !regionId && !!provinceId && !communeId) ||
    (territoryType === "commune" && !regionId && !provinceId && !!communeId);
  if (!validTarget) return null;
  const fullName = typeof input.full_name === "string" ? input.full_name.trim() : "";
  const role = typeof input.role === "string" ? input.role.trim() : "";
  if (!fullName || !role || fullName.length > 180 || role.length > 180) return null;
  const house = input.house === "conseil" || input.house === "chambre_representants" || input.house === "chambre_conseillers" ? input.house : null;
  const photoPath = typeof input.photo_path === "string" && /^officials\/[0-9a-f-]+\.(webp|png|jpg)$/i.test(input.photo_path) ? input.photo_path : null;
  return {
    territory_type: territoryType,
    region_id: regionId,
    province_id: provinceId,
    commune_id: communeId,
    full_name: fullName,
    full_name_ar: typeof input.full_name_ar === "string" ? input.full_name_ar.trim() || null : null,
    role,
    house,
    party: typeof input.party === "string" ? input.party.trim() || null : null,
    mandate_start: typeof input.mandate_start === "string" && input.mandate_start ? input.mandate_start : null,
    mandate_end: typeof input.mandate_end === "string" && input.mandate_end ? input.mandate_end : null,
    bio: typeof input.bio === "string" ? input.bio.trim() || null : null,
    photo_path: photoPath,
    display_order: Number.isInteger(input.display_order) ? Number(input.display_order) : 0,
    is_published: input.is_published === true,
  };
}

function revalidateTerritories() {
  revalidatePath("/territoires");
  revalidateTag("territories", { expire: 0 });
  revalidateTag("officials", { expire: 0 });
}

export async function GET(request: Request) {
  if (!await authorize(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  const { data, error } = await supabase.from("officials").select(columns).order("display_order", { ascending: true }).order("full_name", { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 503 });
  return Response.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  if (!await authorize(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  const payload = validPayload(await request.json());
  if (!payload) return Response.json({ error: "Invalid official data or territory selection." }, { status: 400 });
  const { data, error } = await supabase.from("officials").insert(payload).select(columns).single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidateTerritories();
  return Response.json({ data }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!await authorize(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  const body = await request.json() as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  const payload = validPayload(body);
  if (!id || !payload) return Response.json({ error: "Invalid official id or data." }, { status: 400 });
  const { data: previous, error: previousError } = await supabase.from("officials").select("photo_path").eq("id", id).maybeSingle();
  if (previousError) return Response.json({ error: previousError.message }, { status: 400 });
  const { data, error } = await supabase.from("officials").update(payload).eq("id", id).select(columns).single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (previous?.photo_path && previous.photo_path !== payload.photo_path) {
    const { error: storageError } = await supabase.storage.from("territory-media").remove([previous.photo_path]);
    if (storageError) console.error("[territory-officials] old photo cleanup failed", storageError.message);
  }
  revalidateTerritories();
  return Response.json({ data });
}

export async function DELETE(request: Request) {
  if (!await authorize(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing official id." }, { status: 400 });
  const { data: previous, error: previousError } = await supabase.from("officials").select("photo_path").eq("id", id).maybeSingle();
  if (previousError) return Response.json({ error: previousError.message }, { status: 400 });
  const { error } = await supabase.from("officials").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (previous?.photo_path) {
    const { error: storageError } = await supabase.storage.from("territory-media").remove([previous.photo_path]);
    if (storageError) console.error("[territory-officials] deleted official photo cleanup failed", storageError.message);
  }
  revalidateTerritories();
  return Response.json({ ok: true });
}
