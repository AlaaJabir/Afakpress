import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsRoleFromAdmin } from "@/lib/admin-roles";
import { canAccess } from "@/lib/cms";
import {
  getAllMinistryPageContents,
  saveMinistryPageContent,
} from "@/lib/ministries-db";

export const dynamic = "force-dynamic";

function canManageMinistries(role: ReturnType<typeof cmsRoleFromAdmin>) {
  return (
    canAccess(role, "regions") ||
    canAccess(role, "homepage") ||
    canAccess(role, "pages")
  );
}

export async function GET() {
  const contents = await getAllMinistryPageContents();
  return NextResponse.json({ contents });
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManageMinistries(cmsRoleFromAdmin(session.role))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const slug = String(body.slug || "").trim();
    if (!slug) {
      return NextResponse.json({ error: "Slug du ministère manquant." }, { status: 400 });
    }

    const saved = await saveMinistryPageContent({
      slug,
      overview: typeof body.overview === "string" ? body.overview : undefined,
      mission: typeof body.mission === "string" ? body.mission : undefined,
      headquarters: typeof body.headquarters === "string" ? body.headquarters : undefined,
      officialWebsite: typeof body.officialWebsite === "string" ? body.officialWebsite : undefined,
      emblemUrl: typeof body.emblemUrl === "string" ? body.emblemUrl : undefined,
    });

    try {
      revalidatePath("/");
      revalidatePath("/admin/ministeres");
      revalidatePath(`/ministere/${slug}`);
      revalidatePath(`/ministere/${encodeURIComponent(slug)}`);
    } catch {
      // Ignore revalidation errors outside request context
    }

    return NextResponse.json({ success: true, content: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
