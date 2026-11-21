import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsRoleFromAdmin } from "@/lib/admin-roles";
import { canAccess } from "@/lib/cms";
import {
  getAllTerritoryMaps,
  saveTerritoryMap,
  deleteTerritoryMap,
} from "@/lib/territories-db";
import { REGIONS_12_METADATA, normalizeTerritorySlug } from "@/lib/territories-data";

export const dynamic = "force-dynamic";

function canManageTerritories(role: ReturnType<typeof cmsRoleFromAdmin>) {
  return canAccess(role, "regions") || canAccess(role, "homepage");
}

function revalidateTerritoryMapPaths(params: {
  regionSlug?: string;
  provinceSlug?: string;
  communeSlug?: string;
}) {
  try {
    revalidatePath("/");
    revalidatePath("/territoires");

    if (params.regionSlug) {
      const regMeta = REGIONS_12_METADATA.find(
        (r) =>
          r.slug === normalizeTerritorySlug(params.regionSlug || "") ||
          r.arabicSlug === params.regionSlug
      );
      for (const slug of new Set(
        [params.regionSlug, regMeta?.slug, regMeta?.arabicSlug].filter(Boolean) as string[]
      )) {
        revalidatePath(`/region/${slug}`);
        revalidatePath(`/region/${encodeURIComponent(slug)}`);
      }
    }

    if (params.provinceSlug) {
      revalidatePath(`/province/${params.provinceSlug}`);
      revalidatePath(`/province/${encodeURIComponent(params.provinceSlug)}`);
    }

    if (params.communeSlug) {
      revalidatePath(`/commune/${params.communeSlug}`);
      revalidatePath(`/commune/${encodeURIComponent(params.communeSlug)}`);
    }
  } catch {
    // Ignore revalidation errors outside request context
  }
}

export async function GET() {
  const maps = await getAllTerritoryMaps();
  return NextResponse.json({ maps });
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
    if (
      !body ||
      (body.territoryType !== "region" &&
        body.territoryType !== "province" &&
        body.territoryType !== "commune") ||
      typeof body.mapUrl !== "string" ||
      !body.mapUrl.trim()
    ) {
      return NextResponse.json(
        { error: "Veuillez sélectionner un territoire et téléverser l'image de sa carte." },
        { status: 400 }
      );
    }

    const saved = await saveTerritoryMap({
      territoryType: body.territoryType,
      regionId: typeof body.regionId === "string" ? body.regionId : undefined,
      provinceId: typeof body.provinceId === "string" ? body.provinceId : undefined,
      communeId: typeof body.communeId === "string" ? body.communeId : undefined,
      regionSlug: typeof body.regionSlug === "string" ? body.regionSlug : undefined,
      provinceSlug: typeof body.provinceSlug === "string" ? body.provinceSlug : undefined,
      communeSlug: typeof body.communeSlug === "string" ? body.communeSlug : undefined,
      territoryName: typeof body.territoryName === "string" ? body.territoryName : undefined,
      mapUrl: body.mapUrl,
      caption: typeof body.caption === "string" ? body.caption : undefined,
    });

    revalidateTerritoryMapPaths({
      regionSlug: saved.regionSlug || body.regionSlug,
      provinceSlug: saved.provinceSlug || body.provinceSlug,
      communeSlug: saved.communeSlug || body.communeSlug,
    });

    return NextResponse.json({ success: true, map: saved });
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

    const { map } = await deleteTerritoryMap(id);
    if (map) {
      revalidateTerritoryMapPaths({
        regionSlug: map.regionSlug,
        provinceSlug: map.provinceSlug,
        communeSlug: map.communeSlug,
      });
    } else {
      revalidateTerritoryMapPaths({});
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
