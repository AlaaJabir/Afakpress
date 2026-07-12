import type { SupabaseClient } from "@supabase/supabase-js";
import { initialCmsState } from "@/lib/cms";

type Db = SupabaseClient;
type ArticleReferencePayload = {
  category_id?: string | null;
  author_id?: string | null;
  region_id?: string | null;
  province_id?: string | null;
  commune_id?: string | null;
};

export function defaultProfileRows() {
  return initialCmsState.users.map((user) => ({
    id: user.id,
    name: user.name,
    slug: user.email.split("@")[0] || user.name.toLowerCase().replace(/\s+/g, "-"),
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
  }));
}

export function defaultCategoryRows() {
  return initialCmsState.categories.map((category, index) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parent_id: category.parentId || null,
    order_index: index,
    is_active: true,
  }));
}

export function defaultRegionRows() {
  return initialCmsState.regions.map((region) => ({
    id: region.id,
    name: region.name,
    slug: region.slug,
  }));
}

export function defaultProvinceRows() {
  return initialCmsState.regions.flatMap((region) =>
    region.provinces.map((province) => ({
      id: province.id,
      region_id: region.id,
      name: province.name,
      slug: province.slug,
    })),
  );
}

export function defaultCommuneRows() {
  return initialCmsState.regions.flatMap((region) =>
    region.provinces.flatMap((province) =>
      province.communes.map((commune) => ({
        id: commune.id,
        province_id: province.id,
        name: commune.name,
        slug: commune.slug,
      })),
    ),
  );
}

async function upsertRows<Row extends { id: string }>(supabase: Db, table: "profiles" | "categories" | "regions" | "provinces" | "communes", rows: Row[]) {
  for (const row of rows) {
    const { error } = await supabase.from(table).upsert(row, { onConflict: "id" });
    const message = error?.message.toLowerCase() ?? "";
    const canResolveLater = message.includes("duplicate key") || message.includes("foreign key constraint");
    if (error && !canResolveLater) {
      return error.message;
    }
  }
  return "";
}

export async function seedDefaultCmsReferences(
  supabase: Db,
  sessionProfile?: { id: string; name: string; email: string; role: string; avatar?: string | null },
) {
  if (sessionProfile) {
    const { error } = await supabase.from("profiles").upsert(sessionProfile, { onConflict: "id" });
    if (error && !error.message.toLowerCase().includes("duplicate key")) return error.message;
  }

  return (
    (await upsertRows(supabase, "categories", defaultCategoryRows())) ||
    (await upsertRows(supabase, "regions", defaultRegionRows())) ||
    (await upsertRows(supabase, "profiles", defaultProfileRows())) ||
    (await upsertRows(supabase, "provinces", defaultProvinceRows())) ||
    (await upsertRows(supabase, "communes", defaultCommuneRows()))
  );
}

async function existsById(supabase: Db, table: "profiles" | "categories" | "regions" | "provinces" | "communes", id: string) {
  const { data, error } = await supabase.from(table).select("id").eq("id", id).maybeSingle();
  if (error) return { error: error.message, id: "" };
  return { id: data?.id ?? "", error: "" };
}

async function idByColumn(supabase: Db, table: "profiles" | "categories" | "regions" | "provinces" | "communes", column: "email" | "slug", value: string) {
  const { data, error } = await supabase.from(table).select("id").eq(column, value).limit(1).maybeSingle();
  if (error) return { error: error.message, id: "" };
  return { id: data?.id ?? "", error: "" };
}

async function resolveReference(
  supabase: Db,
  table: "profiles" | "categories" | "regions" | "provinces" | "communes",
  id: string | null | undefined,
  defaults: { id: string; slug?: string | null; email?: string | null }[],
  label: string,
) {
  if (!id) return { id: null, error: "" };

  const existing = await existsById(supabase, table, id);
  if (existing.error || existing.id) return existing;

  const fallback = defaults.find((item) => item.id === id);
  if (fallback?.email) {
    const byEmail = await idByColumn(supabase, table, "email", fallback.email);
    if (byEmail.error || byEmail.id) return byEmail;
  }
  if (fallback?.slug) {
    const bySlug = await idByColumn(supabase, table, "slug", fallback.slug);
    if (bySlug.error || bySlug.id) return bySlug;
  }

  return { id: "", error: `${label} does not exist in Supabase. Refresh CMS data or create the missing record first.` };
}

export async function resolveArticleReferences(supabase: Db, payload: ArticleReferencePayload) {
  const category = await resolveReference(supabase, "categories", payload.category_id, defaultCategoryRows(), "Selected category");
  if (category.error) return category.error;
  payload.category_id = category.id;

  const author = await resolveReference(supabase, "profiles", payload.author_id, defaultProfileRows(), "Selected author");
  if (author.error) return author.error;
  payload.author_id = author.id;

  const region = await resolveReference(supabase, "regions", payload.region_id, defaultRegionRows(), "Selected region");
  if (region.error) return region.error;
  payload.region_id = region.id;

  const province = await resolveReference(supabase, "provinces", payload.province_id, defaultProvinceRows(), "Selected province");
  if (province.error) return province.error;
  payload.province_id = province.id;

  const commune = await resolveReference(supabase, "communes", payload.commune_id, defaultCommuneRows(), "Selected commune");
  if (commune.error) return commune.error;
  payload.commune_id = commune.id;

  return "";
}
