import { NextResponse } from "next/server";
import { createServiceSupabaseAdminClient, createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "officials";

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Validate size (max 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "L'image ne doit pas dépasser 2 Mo" }, { status: 400 });
    }

    // Validate format
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté. Utilisez JPG, PNG ou WebP." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const client = createServiceSupabaseAdminClient() || createServerSupabaseClient();
    if (client) {
      const { data, error } = await client.storage
        .from("territory-media")
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!error && data?.path) {
        const { data: publicUrlData } = client.storage
          .from("territory-media")
          .getPublicUrl(data.path);

        return NextResponse.json({
          success: true,
          url: publicUrlData.publicUrl,
          path: data.path,
        });
      }
    }

    // Fallback: data URL for immediate rendering if storage bucket is not yet provisioned
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
