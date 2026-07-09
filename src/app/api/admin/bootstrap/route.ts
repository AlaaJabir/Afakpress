import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsRoleFromAdmin } from "@/lib/admin-roles";
import { initialCmsState } from "@/lib/cms";
import { createServiceSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Missing Supabase service role configuration." }, { status: 500 });

  const profile = {
    id: session.userId,
    name: session.email,
    email: session.email,
    role: cmsRoleFromAdmin(session.role),
    avatar: null,
  };

  const { error: profileError } = await supabase.from("profiles").upsert(profile, { onConflict: "id" });
  if (profileError) return Response.json({ error: profileError.message }, { status: 400 });

  const categories = initialCmsState.categories.map((category, index) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parent_id: category.parentId || null,
    order_index: index,
    is_active: true,
  }));

  if (categories.length) {
    const { error } = await supabase.from("categories").upsert(categories, { onConflict: "id" });
    if (error) {
      const minimalCategories = categories.map(({ id, name, slug }) => ({ id, name, slug }));
      const { error: fallbackError } = await supabase.from("categories").upsert(minimalCategories, { onConflict: "id" });
      if (fallbackError) return Response.json({ error: fallbackError.message }, { status: 400 });
    }
  }

  const regions = initialCmsState.regions.map((region) => ({
    id: region.id,
    name: region.name,
    slug: region.slug,
  }));

  if (regions.length) {
    const { error } = await supabase.from("regions").upsert(regions, { onConflict: "id" });
    if (error) return Response.json({ error: error.message }, { status: 400 });
  }

  const provinces = initialCmsState.regions.flatMap((region) =>
    region.provinces.map((province) => ({
      id: province.id,
      region_id: region.id,
      name: province.name,
      slug: province.slug,
    })),
  );

  if (provinces.length) {
    const { error } = await supabase.from("provinces").upsert(provinces, { onConflict: "id" });
    if (error) return Response.json({ error: error.message }, { status: 400 });
  }

  const communes = initialCmsState.regions.flatMap((region) =>
    region.provinces.flatMap((province) =>
      province.communes.map((commune) => ({
        id: commune.id,
        province_id: province.id,
        name: commune.name,
        slug: commune.slug,
      })),
    ),
  );

  if (communes.length) {
    const { error } = await supabase.from("communes").upsert(communes, { onConflict: "id" });
    if (error) return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ ok: true });
}
