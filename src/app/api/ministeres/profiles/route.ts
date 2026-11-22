import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsRoleFromAdmin } from "@/lib/admin-roles";
import { canAccess } from "@/lib/cms";
import {
  deleteMinistryProfile,
  getAllMinistryProfiles,
  saveMinistryProfile,
} from "@/lib/ministries-db";

export const dynamic = "force-dynamic";

function canManageMinistries(role: ReturnType<typeof cmsRoleFromAdmin>) {
  return (
    canAccess(role, "regions") ||
    canAccess(role, "homepage") ||
    canAccess(role, "articles")
  );
}

function revalidateMinistryPaths(slug?: string) {
  try {
    revalidatePath("/");
    revalidatePath("/admin/ministeres");
    if (slug) {
      revalidatePath(`/ministere/${slug}`);
      revalidatePath(`/ministere/${encodeURIComponent(slug)}`);
    }
  } catch {
    // Ignore revalidation errors outside request context
  }
}

export async function GET() {
  const profiles = await getAllMinistryProfiles();
  return NextResponse.json({ profiles });
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
    const ministrySlug = String(body.ministrySlug || "").trim();
    const fullName = String(body.fullName || body.fullNameAr || "").trim();
    const roleTitle = String(body.role || "").trim();

    if (!ministrySlug || !fullName || !roleTitle) {
      return NextResponse.json(
        { error: "Veuillez sélectionner le ministère et renseigner le nom ainsi que la fonction du ministre." },
        { status: 400 }
      );
    }

    const saved = await saveMinistryProfile({
      id: typeof body.id === "string" && body.id ? body.id : undefined,
      ministrySlug,
      fullName,
      fullNameAr: typeof body.fullNameAr === "string" ? body.fullNameAr : undefined,
      role: roleTitle,
      party: typeof body.party === "string" ? body.party : undefined,
      mandateStart: typeof body.mandateStart === "string" ? body.mandateStart : "2021",
      mandateEnd: typeof body.mandateEnd === "string" ? body.mandateEnd : "2026",
      bio: typeof body.bio === "string" ? body.bio : undefined,
      photoUrl: typeof body.photoUrl === "string" ? body.photoUrl : undefined,
      displayOrder: typeof body.displayOrder === "number" ? body.displayOrder : 1,
      isPublished: body.isPublished !== false,
    });

    revalidateMinistryPaths(saved.ministrySlug);
    return NextResponse.json({ success: true, profile: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManageMinistries(cmsRoleFromAdmin(session.role))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const { profile } = await deleteMinistryProfile(id);
    revalidateMinistryPaths(profile?.ministrySlug);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
