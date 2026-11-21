import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsRoleFromAdmin } from "@/lib/admin-roles";
import { canAccess } from "@/lib/cms";
import { getAllOfficials, saveOfficial, deleteOfficial } from "@/lib/territories-db";
import { REGIONS_12_METADATA, normalizeTerritorySlug } from "@/lib/territories-data";

export const dynamic = "force-dynamic";

function canManageTerritories(role: ReturnType<typeof cmsRoleFromAdmin>) {
  return canAccess(role, "regions") || canAccess(role, "homepage");
}

function revalidateLocationPaths(params: {
  regionSlug?: string;
  provinceSlug?: string;
  communeSlug?: string;
}) {
  try {
    revalidatePath("/");
    revalidatePath("/territoires");

    if (params.regionSlug) {
      const regMeta = REGIONS_12_METADATA.find(
        (r) => r.slug === normalizeTerritorySlug(params.regionSlug || "") || r.arabicSlug === params.regionSlug
      );
      for (const slug of new Set([params.regionSlug, regMeta?.slug, regMeta?.arabicSlug].filter(Boolean) as string[])) {
        revalidatePath(`/region/${slug}`);
        revalidatePath(`/region/${encodeURIComponent(slug)}`);
        revalidatePath(`/territoires/${slug}`);
      }
    }

    if (params.provinceSlug) {
      revalidatePath(`/province/${params.provinceSlug}`);
      revalidatePath(`/province/${encodeURIComponent(params.provinceSlug)}`);
      if (params.regionSlug) {
        revalidatePath(`/territoires/${params.regionSlug}/${params.provinceSlug}`);
      }
    }

    if (params.communeSlug) {
      revalidatePath(`/commune/${params.communeSlug}`);
      revalidatePath(`/commune/${encodeURIComponent(params.communeSlug)}`);
      if (params.regionSlug && params.provinceSlug) {
        revalidatePath(`/territoires/${params.regionSlug}/${params.provinceSlug}/${params.communeSlug}`);
      }
    }
  } catch {
    // Ignore revalidation errors in local/non-request contexts
  }
}

export async function GET() {
  const officials = await getAllOfficials();
  return NextResponse.json({ officials });
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManageTerritories(cmsRoleFromAdmin(session.role))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.fullName || !body.role || !body.territoryType) {
      return NextResponse.json(
        { error: "Veuillez renseigner le nom complet, le rôle et le niveau de territoire." },
        { status: 400 }
      );
    }

    const saved = await saveOfficial(body);
    revalidateLocationPaths({
      regionSlug: saved.regionSlug || body.regionSlug,
      provinceSlug: saved.provinceSlug || body.provinceSlug,
      communeSlug: saved.communeSlug || body.communeSlug,
    });

    return NextResponse.json({ success: true, official: saved });
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
    if (!canManageTerritories(cmsRoleFromAdmin(session.role))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const { official } = await deleteOfficial(id);
    if (official) {
      revalidateLocationPaths({
        regionSlug: official.regionSlug,
        provinceSlug: official.provinceSlug,
        communeSlug: official.communeSlug,
      });
    } else {
      revalidateLocationPaths({});
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
