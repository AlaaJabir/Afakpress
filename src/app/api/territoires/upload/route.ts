import { NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsRoleFromAdmin } from "@/lib/admin-roles";
import { canAccess } from "@/lib/cms";
import { createServiceSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const maxPhotoSize = 5 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

async function ensureBucket(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseAdminClient>>,
  bucketName: string,
) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) return false;
  if (buckets?.some((b) => b.name === bucketName)) return true;

  const { error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    allowedMimeTypes: allowedTypes,
    fileSizeLimit: maxPhotoSize,
  });
  return !error;
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = cmsRoleFromAdmin(session.role);
    if (!canAccess(role, "media") && !canAccess(role, "regions")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "officials").replace(/[^a-zA-Z0-9_-]/g, "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (file.size > maxPhotoSize) {
      return NextResponse.json({ error: "L'image ne doit pas dépasser 5 Mo" }, { status: 400 });
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté. Utilisez JPG, PNG ou WebP." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const serviceClient = createServiceSupabaseAdminClient();
    if (serviceClient) {
      for (const bucket of ["territory-media", "media"]) {
        const ready = await ensureBucket(serviceClient, bucket);
        if (!ready) continue;

        const { data, error } = await serviceClient.storage
          .from(bucket)
          .upload(filename, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!error && data?.path) {
          const { data: publicUrlData } = serviceClient.storage
            .from(bucket)
            .getPublicUrl(data.path);

          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            path: data.path,
            bucket,
          });
        }
      }

      return NextResponse.json(
        { error: "Impossible de téléverser l'image dans Supabase Storage." },
        { status: 500 }
      );
    }

    // Fallback when SUPABASE_SERVICE_ROLE_KEY is absent locally
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      path: filename,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur de téléversement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
