import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { createServiceSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function isAdmin(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  return Boolean(session && (session.role === "super_admin" || session.role === "admin"));
}

export async function POST(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  const body = await request.json() as { contentType?: unknown };
  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
    return Response.json({ error: "Only JPEG, PNG, or WebP images are accepted." }, { status: 400 });
  }
  const extension = contentType === "image/jpeg" ? "jpg" : contentType === "image/png" ? "png" : "webp";
  const path = `officials/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage.from("territory-media").createSignedUploadUrl(path, { upsert: false });
  if (error || !data) return Response.json({ error: error?.message ?? "Could not create upload URL. Apply the Territories migration first." }, { status: 503 });
  return Response.json({ path: data.path, token: data.token });
}

export async function DELETE(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  const body = await request.json() as { path?: unknown };
  const path = typeof body.path === "string" ? body.path : "";
  if (!/^officials\\/[0-9a-f-]+\\.(webp|png|jpg)$/i.test(path)) return Response.json({ error: "Invalid storage path." }, { status: 400 });
  const { error } = await supabase.storage.from("territory-media").remove([path]);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
