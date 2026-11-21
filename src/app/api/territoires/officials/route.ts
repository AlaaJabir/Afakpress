import { NextResponse } from "next/server";
import { getAllOfficials, saveOfficial, deleteOfficial } from "@/lib/territories-db";
import { revalidatePath } from "next/cache";

export async function GET() {
  const officials = await getAllOfficials();
  return NextResponse.json({ officials });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.fullName || !body.role || !body.territoryType) {
      return NextResponse.json(
        { error: "Veuillez renseigner le nom complet, le rôle et le niveau de territoire." },
        { status: 400 }
      );
    }

    const saved = await saveOfficial(body);

    // Revalidate territory paths
    try {
      revalidatePath("/territoires");
      if (body.regionSlug) {
        revalidatePath(`/territoires/${body.regionSlug}`);
        if (body.provinceSlug) {
          revalidatePath(`/territoires/${body.regionSlug}/${body.provinceSlug}`);
          if (body.communeSlug) {
            revalidatePath(`/territoires/${body.regionSlug}/${body.provinceSlug}/${body.communeSlug}`);
          }
        }
      }
    } catch {
      // Ignore in development
    }

    return NextResponse.json({ success: true, official: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    await deleteOfficial(id);
    try {
      revalidatePath("/territoires");
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
