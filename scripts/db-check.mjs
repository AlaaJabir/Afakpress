#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function loadEnvFile(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) return;
  for (const line of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const schema = {
  profiles: ["id", "name", "slug", "email", "role", "avatar", "created_at", "updated_at"],
  admin_users: ["id", "user_id", "email", "role", "status", "created_at", "updated_at"],
  categories: ["id", "name", "slug", "description", "parent_id", "order_index", "is_active", "created_at", "updated_at"],
  regions: ["id", "name", "slug", "created_at", "updated_at"],
  provinces: ["id", "region_id", "name", "slug", "created_at", "updated_at"],
  communes: ["id", "province_id", "name", "slug", "created_at", "updated_at"],
  media: ["id", "name", "url", "type", "folder", "alt", "caption", "copyright", "optimized", "created_at", "updated_at"],
  articles: ["id", "title", "slug", "excerpt", "content", "featured_image", "category_id", "author_id", "geographic_scope", "region_id", "province_id", "commune_id", "status", "is_featured", "allow_comments", "views", "seo_title", "seo_description", "seo_keywords", "published_at", "created_at", "updated_at"],
  menus: ["id", "title", "slug", "parent_id", "level", "order_index", "is_active", "show_header", "show_footer", "created_at", "updated_at"],
  pages: ["id", "title", "slug", "content", "seo_title", "seo_description", "status", "created_at", "updated_at"],
  tags: ["id", "name", "slug", "created_at"],
  article_tags: ["article_id", "tag_id"],
  comments: ["id", "article_id", "author", "email", "content", "status", "created_at", "updated_at"],
  breaking_news: ["id", "title", "article_id", "url", "is_active", "order_index", "created_at", "updated_at"],
  settings: ["id", "key", "value", "created_at", "updated_at"],
};

const requiredLookupTables = ["categories", "profiles", "regions", "provinces", "communes"];
const idTables = ["profiles", "admin_users", "categories", "regions", "provinces", "communes", "media", "articles", "menus", "pages", "tags", "comments", "breaking_news", "settings"];
const fkChecks = [
  { sourceTable: "categories", sourceColumn: "parent_id", targetTable: "categories" },
  { sourceTable: "provinces", sourceColumn: "region_id", targetTable: "regions" },
  { sourceTable: "communes", sourceColumn: "province_id", targetTable: "provinces" },
  { sourceTable: "articles", sourceColumn: "category_id", targetTable: "categories" },
  { sourceTable: "articles", sourceColumn: "author_id", targetTable: "profiles" },
  { sourceTable: "articles", sourceColumn: "region_id", targetTable: "regions" },
  { sourceTable: "articles", sourceColumn: "province_id", targetTable: "provinces" },
  { sourceTable: "articles", sourceColumn: "commune_id", targetTable: "communes" },
  { sourceTable: "menus", sourceColumn: "parent_id", targetTable: "menus" },
  { sourceTable: "comments", sourceColumn: "article_id", targetTable: "articles" },
  { sourceTable: "breaking_news", sourceColumn: "article_id", targetTable: "articles" },
  { sourceTable: "article_tags", sourceColumn: "article_id", targetTable: "articles" },
  { sourceTable: "article_tags", sourceColumn: "tag_id", targetTable: "tags" },
];

const problems = [];
const warnings = [];

function problem(message) {
  problems.push(message);
}

function warning(message) {
  warnings.push(message);
}

if (!supabaseUrl || !serviceRoleKey) {
  problem("Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. db:check cannot inspect the real Supabase schema.");
  reportAndExit();
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function tableColumnsExist(table, columns) {
  const { error } = await supabase.from(table).select(columns.join(","), { head: true }).limit(1);
  if (error) {
    problem(`Table/column check failed for ${table}: ${error.message}. Required columns: ${columns.join(", ")}`);
  }
}

async function countRows(table) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) {
    problem(`Count failed for ${table}: ${error.message}`);
    return null;
  }
  return count ?? 0;
}

async function fetchRows(table, columns) {
  const { data, error } = await supabase.from(table).select(columns).limit(10000);
  if (error) {
    problem(`Read failed for ${table}.${columns}: ${error.message}`);
    return [];
  }
  return data ?? [];
}

function validUuid(value) {
  return value === null || value === undefined || value === "" || uuidPattern.test(String(value));
}

for (const [table, columns] of Object.entries(schema)) {
  await tableColumnsExist(table, columns);
}

for (const table of requiredLookupTables) {
  const count = await countRows(table);
  if (count === 0) problem(`Required lookup table ${table} is empty. Run supabase/migrations/complete_schema_sync.sql or open the admin dashboard bootstrap.`);
}

for (const table of idTables) {
  const rows = await fetchRows(table, "id");
  for (const row of rows) {
    if (!validUuid(row.id)) problem(`${table}.id contains invalid UUID value: ${row.id}`);
  }
}

for (const check of fkChecks) {
  const hasId = schema[check.sourceTable]?.includes("id");
  const sourceRows = await fetchRows(check.sourceTable, hasId ? `id,${check.sourceColumn}` : check.sourceColumn);
  const targetRows = await fetchRows(check.targetTable, "id");
  const targets = new Set(targetRows.map((row) => row.id));

  for (const row of sourceRows) {
    const value = row[check.sourceColumn];
    const rowLabel = row.id ?? JSON.stringify(row);
    if (!value) continue;
    if (!validUuid(value)) {
      problem(`${check.sourceTable}.${check.sourceColumn} contains invalid UUID value ${value} on row ${rowLabel}`);
      continue;
    }
    if (!targets.has(value)) {
      problem(`${check.sourceTable}.${check.sourceColumn} has orphan UUID ${value} on row ${rowLabel}; missing ${check.targetTable}.id`);
    }
  }
}

const articleRows = await fetchRows("articles", "id,status,published_at,slug,title,geographic_scope,region_id,province_id,commune_id");
for (const article of articleRows) {
  if (!article.slug) problem(`articles.slug is empty for article ${article.id}`);
  if (!article.title) problem(`articles.title is empty for article ${article.id}`);
  if (article.status && !["draft", "pending_review", "scheduled", "published"].includes(article.status)) {
    problem(`articles.status has invalid value ${article.status} on article ${article.id}`);
  }
  if (article.published_at && Number.isNaN(Date.parse(article.published_at))) {
    problem(`articles.published_at is not a valid timestamp on article ${article.id}`);
  }
  if (!["national", "region", "province", "commune"].includes(article.geographic_scope)) {
    problem(`articles.geographic_scope has invalid value ${article.geographic_scope} on article ${article.id}`);
  }
  if (article.geographic_scope === "national" && (article.region_id || article.province_id || article.commune_id)) {
    problem(`National article ${article.id} contains geographic foreign keys.`);
  }
  if (article.geographic_scope === "region" && (!article.region_id || article.province_id || article.commune_id)) {
    problem(`Region article ${article.id} has an inconsistent geographic hierarchy.`);
  }
  if (article.geographic_scope === "province" && (!article.region_id || !article.province_id || article.commune_id)) {
    problem(`Province article ${article.id} has an inconsistent geographic hierarchy.`);
  }
  if (article.geographic_scope === "commune" && (!article.region_id || !article.province_id || !article.commune_id)) {
    problem(`Commune article ${article.id} has an inconsistent geographic hierarchy.`);
  }
}

const profileProbe = await fetchRows("profiles", "id,avatar");
if (profileProbe.length === 0) warning("profiles is present but has no rows visible to the service role.");
for (const profile of profileProbe) {
  const { data, error } = await supabase.auth.admin.getUserById(profile.id);
  if (error || !data?.user) {
    problem(`profiles.id ${profile.id} has no matching auth.users row.`);
  }
}

if (warnings.length) {
  console.log("Afakpress DB warnings:");
  for (const item of warnings) console.log(`- ${item}`);
}

reportAndExit();

function reportAndExit() {
  if (problems.length) {
    console.error("Afakpress DB check failed:");
    for (const item of problems) console.error(`- ${item}`);
    process.exit(1);
  }

  console.log("Afakpress DB check passed: schema, required lookup tables, UUID references, and core article constraints are synchronized.");
}
