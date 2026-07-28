import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsRoleFromAdmin } from "@/lib/admin-roles";
import { canAccess } from "@/lib/cms";
import { createServiceSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const mediaBucket = "media";
const maxFeaturedImageSize = 2 * 1024 * 1024;

type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

function extensionFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  return "";
}

async function ensureMediaBucket(supabase: NonNullable<ReturnType<typeof createServiceSupabaseAdminClient>>) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) return listError.message;
  if (buckets?.some((bucket) => bucket.name === mediaBucket)) return "";

  const { error } = await supabase.storage.createBucket(mediaBucket, {
    public: true,
    allowedMimeTypes: ["image/png", "image/jpeg"],
    fileSizeLimit: maxFeaturedImageSize,
  });
  return error?.message ?? "";
}

function logMediaInsertError(error: SupabaseError, path: string, attempt: "full" | "minimal") {
  console.error(`[admin/upload] Media record ${attempt} insert failed`, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
    path,
  });
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

  const bucketError = await ensureMediaBucket(supabase);
  if (bucketError) return Response.json({ error: bucketError }, { status: 400 });

  const extension = extensionFor(file.type);
  const path = `articles/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(mediaBucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return Response.json({ error: error.message }, { status: 400 });

  const { data } = supabase.storage.from(mediaBucket).getPublicUrl(path);
  const mediaName = file.name.trim() || path.split("/").pop() || "Uploaded image";
  let { data: media, error: mediaError } = await supabase
    .from("media")
    .insert({
      name: mediaName,
      url: data.publicUrl,
      type: "Image",
      folder: "Articles",
      alt: mediaName.replace(/\.[^.]+$/, ""),
      optimized: true,
    })
    .select("*")
    .single();

  if (mediaError) {
    logMediaInsertError(mediaError, path, "full");
    const minimalInsert = await supabase
      .from("media")
      .insert({ name: mediaName, url: data.publicUrl })
      .select("*")
      .single();
    media = minimalInsert.data;
    mediaError = minimalInsert.error;
  }

  if (mediaError) {
    logMediaInsertError(mediaError, path, "minimal");
    return Response.json({
      url: data.publicUrl,
      path,
      media: null,
      warning: "Image uploaded and selected, but the media library table needs its schema migration.",
    });
  }

  return Response.json({ url: data.publicUrl, path, media });
}
