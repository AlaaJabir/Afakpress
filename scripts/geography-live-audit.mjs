#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

for (const filename of [".env.local", ".env"]) {
  const file = path.join(root, filename);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const value = line.trim();
    if (!value || value.startsWith("#") || !value.includes("=")) continue;
    const separator = value.indexOf("=");
    const key = value.slice(0, separator).trim();
    const content = value.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = content;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase audit credentials are unavailable.");

const supabase = createClient(url, key, { auth: { persistSession: false } });
const seed = fs.readFileSync(path.join(root, "src/lib/cms-morocco-regions-seed.sql"), "utf8");

const expectedRegions = [...seed.matchAll(/insert into regions \(name, slug\) values \('([^']*)', '([^']*)'\);/g)]
  .map((match) => ({ name: match[1], slug: match[2] }));
const expectedProvinces = [...seed.matchAll(/insert into provinces \(region_id, name, slug\) values \(\(select id from regions where slug = '([^']*)'\), '([^']*)', '([^']*)'\);/g)]
  .map((match) => ({ regionSlug: match[1], name: match[2], slug: match[3] }));
const expectedCommunes = [...seed.matchAll(/insert into communes \(province_id, name, slug\) values \(\(select id from provinces where slug = '([^']*)'\), '([^']*)', '([^']*)'\);/g)]
  .map((match) => ({ provinceSlug: match[1], name: match[2], slug: match[3] }));

async function allRows(table, columns) {
  const rows = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + pageSize - 1);
    if (error) throw new Error(`Read failed for ${table}.`);
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

function normalized(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "")
    .toLowerCase();
}

function sameLocation(left, right) {
  return normalized(left.slug) === normalized(right.slug) || normalized(left.name) === normalized(right.name);
}

function duplicates(rows, value, parent = () => "") {
  const groups = new Map();
  for (const row of rows) {
    const normalizedValue = normalized(value(row));
    if (!normalizedValue) continue;
    const keyValue = `${parent(row) ?? ""}:${normalizedValue}`;
    groups.set(keyValue, [...(groups.get(keyValue) ?? []), row.id]);
  }
  return [...groups.values()].filter((ids) => ids.length > 1);
}

const [regions, provinces, communes, articles] = await Promise.all([
  allRows("regions", "id,name,slug,created_at"),
  allRows("provinces", "id,region_id,name,slug,created_at"),
  allRows("communes", "id,province_id,name,slug,created_at"),
  allRows("articles", "id,region_id,province_id,commune_id"),
]);

const regionIds = new Set(regions.map((row) => row.id));
const provinceIds = new Set(provinces.map((row) => row.id));
const orphanProvinces = provinces.filter((row) => !row.region_id || !regionIds.has(row.region_id));
const orphanCommunes = communes.filter((row) => !row.province_id || !provinceIds.has(row.province_id));
const regionById = new Map(regions.map((row) => [row.id, row]));
const provinceById = new Map(provinces.map((row) => [row.id, row]));
const provinceChildren = new Map(regions.map((row) => [row.id, provinces.filter((province) => province.region_id === row.id).length]));
const communeChildren = new Map(provinces.map((row) => [row.id, communes.filter((commune) => commune.province_id === row.id).length]));
const regionArticles = new Map(regions.map((row) => [row.id, articles.filter((article) => article.region_id === row.id).length]));
const provinceArticles = new Map(provinces.map((row) => [row.id, articles.filter((article) => article.province_id === row.id).length]));
const communeArticles = new Map(communes.map((row) => [row.id, articles.filter((article) => article.commune_id === row.id).length]));

const regionMatches = new Map(expectedRegions.map((expected) => [
  expected.slug,
  regions.filter((row) => sameLocation(row, expected)),
]));

const missingProvinces = [];
const invalidProvinceParents = [];
const provinceMatches = new Map();
for (const expected of expectedProvinces) {
  const candidates = provinces.filter((row) => sameLocation(row, expected));
  const validRegionIds = new Set((regionMatches.get(expected.regionSlug) ?? []).map((row) => row.id));
  const valid = candidates.filter((row) => validRegionIds.has(row.region_id));
  provinceMatches.set(expected.slug, valid);
  if (!valid.length) {
    if (candidates.length) invalidProvinceParents.push(expected);
    else missingProvinces.push(expected);
  }
}

const missingCommunes = [];
const invalidCommuneParents = [];
const officialRegionIds = new Set();
const officialProvinceIds = new Set();
const officialCommuneIds = new Set();
for (const expected of expectedRegions) {
  for (const row of regions.filter((candidate) => candidate.slug === expected.slug)) officialRegionIds.add(row.id);
}
for (const expected of expectedCommunes) {
  const candidates = communes.filter((row) => sameLocation(row, expected));
  const validProvinceIds = new Set((provinceMatches.get(expected.provinceSlug) ?? []).map((row) => row.id));
  const valid = candidates.filter((row) => validProvinceIds.has(row.province_id));
  if (!valid.length) {
    if (candidates.length) invalidCommuneParents.push(expected);
    else missingCommunes.push(expected);
  }
  for (const row of valid.filter((candidate) => candidate.slug === expected.slug)) officialCommuneIds.add(row.id);
}

for (const expected of expectedProvinces) {
  const validRegionIds = new Set(regions.filter((row) => row.slug === expected.regionSlug).map((row) => row.id));
  for (const row of provinces.filter((candidate) => candidate.slug === expected.slug && validRegionIds.has(candidate.region_id))) {
    officialProvinceIds.add(row.id);
  }
}

const regionDetail = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  normalizedName: normalized(row.name),
  createdAt: row.created_at,
  childProvinces: provinceChildren.get(row.id) ?? 0,
  articleReferences: regionArticles.get(row.id) ?? 0,
  officialSeed: officialRegionIds.has(row.id),
});
const provinceDetail = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  regionId: row.region_id,
  parentRegionName: regionById.get(row.region_id)?.name ?? null,
  normalizedName: normalized(row.name),
  createdAt: row.created_at,
  childCommunes: communeChildren.get(row.id) ?? 0,
  articleReferences: provinceArticles.get(row.id) ?? 0,
  officialSeed: officialProvinceIds.has(row.id),
});
const communeDetail = (row) => {
  const province = provinceById.get(row.province_id);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    provinceId: row.province_id,
    parentProvinceName: province?.name ?? null,
    parentRegionName: province ? regionById.get(province.region_id)?.name ?? null : null,
    normalizedName: normalized(row.name),
    createdAt: row.created_at,
    articleReferences: communeArticles.get(row.id) ?? 0,
    officialSeed: officialCommuneIds.has(row.id),
  };
};

function detailedGroups(rows, value, detail, parent = () => "") {
  const groups = new Map();
  for (const row of rows) {
    const normalizedValue = normalized(value(row));
    if (!normalizedValue) continue;
    const keyValue = `${parent(row) ?? ""}:${normalizedValue}`;
    groups.set(keyValue, [...(groups.get(keyValue) ?? []), row]);
  }
  return [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([keyValue, items]) => ({ key: keyValue.split(":").slice(1).join(":"), rows: items.map(detail) }));
}

const report = {
  totals: { regions: regions.length, provinces: provinces.length, communes: communes.length },
  expectedTotals: {
    regions: expectedRegions.length,
    provinces: expectedProvinces.length,
    communes: expectedCommunes.length,
  },
  missingProvinces,
  missingCommunes,
  duplicateSlugs: {
    regions: duplicates(regions, (row) => row.slug).length,
    provinces: duplicates(provinces, (row) => row.slug).length,
    communes: duplicates(communes, (row) => row.slug).length,
  },
  duplicateNormalizedNames: {
    regions: duplicates(regions, (row) => row.name).length,
    provinces: duplicates(provinces, (row) => row.name, (row) => row.region_id).length,
    communes: duplicates(communes, (row) => row.name, (row) => row.province_id).length,
  },
  invalidParentRelationships: {
    provinces: invalidProvinceParents,
    communes: invalidCommuneParents,
  },
  orphanRecords: {
    provinces: orphanProvinces.length,
    communes: orphanCommunes.length,
  },
  duplicateGroups: {
    regionSlugs: detailedGroups(regions, (row) => row.slug, regionDetail),
    regionNormalizedNames: detailedGroups(regions, (row) => row.name, regionDetail),
    provinceSlugs: detailedGroups(provinces, (row) => row.slug, provinceDetail),
    provinceNormalizedNamesWithinParent: detailedGroups(provinces, (row) => row.name, provinceDetail, (row) => row.region_id),
    communeSlugs: detailedGroups(communes, (row) => row.slug, communeDetail),
    communeNormalizedNamesWithinParent: detailedGroups(communes, (row) => row.name, communeDetail, (row) => row.province_id),
  },
  notInOfficialSeed: {
    regions: regions.filter((row) => !officialRegionIds.has(row.id)).map(regionDetail),
    provinces: provinces.filter((row) => !officialProvinceIds.has(row.id)).map(provinceDetail),
    communes: communes.filter((row) => !officialCommuneIds.has(row.id)).map(communeDetail),
  },
  canonicalCandidatesForAdditional: {
    provinces: provinces
      .filter((row) => !officialProvinceIds.has(row.id))
      .map((additional) => ({
        additional: provinceDetail(additional),
        officialCandidates: provinces
          .filter((row) => officialProvinceIds.has(row.id) && normalized(row.name) === normalized(additional.name))
          .map(provinceDetail),
      })),
    communes: communes
      .filter((row) => !officialCommuneIds.has(row.id))
      .map((additional) => ({
        additional: communeDetail(additional),
        officialCandidates: communes
          .filter((row) => officialCommuneIds.has(row.id) && normalized(row.name) === normalized(additional.name))
          .map(communeDetail),
      })),
  },
};

console.log(JSON.stringify(report, null, 2));
