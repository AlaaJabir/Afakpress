import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsRoleFromAdmin } from "@/lib/admin-roles";
import { canAccess } from "@/lib/cms";
import { createServiceSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const mediaBucket = "media";
const maxFeaturedImageSize = 2 * 1024 * 1024;

function extensionFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  return "";
}

export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccess(cmsRoleFromAdmin(session.role), "media")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Upload a PNG or JPEG image." }, { status: 400 });
  if (!["image/png", "image/jpeg"].includes(file.type)) return Response.json({ error: "Featured image must be a PNG or JPEG file." }, { status: 400 });
  if (file.size > maxFeaturedImageSize) return Response.json({ error: "Featured image must be 2MB or smaller." }, { status: 400 });

  const extension = extensionFor(file.type);
  const path = `articles/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(mediaBucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return Response.json({ error: error.message }, { status: 400 });

  const { data } = supabase.storage.from(mediaBucket).getPublicUrl(path);
  return Response.json({ url: data.publicUrl, path });
}
