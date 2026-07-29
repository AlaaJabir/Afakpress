#!/usr/bin/env node
import fs from "node:fs";
import pg from "pg";

const values = {};
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const entry = line.trim();
  if (!entry || entry.startsWith("#") || !entry.includes("=")) continue;
  const separator = entry.indexOf("=");
  values[entry.slice(0, separator).trim()] = entry.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
}

const client = new pg.Client({
  connectionString: values.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const { rows } = await client.query(`
    select
      (select count(*) from regions) regions,
      (select count(*) from provinces) provinces,
      (select count(*) from communes) communes,
      (select count(*) from provinces p left join regions r on r.id = p.region_id where r.id is null) orphan_provinces,
      (select count(*) from communes c left join provinces p on p.id = c.province_id where p.id is null) orphan_communes,
      (select count(*) from articles a left join regions r on r.id = a.region_id where a.region_id is not null and r.id is null) missing_region_refs,
      (select count(*) from articles a left join provinces p on p.id = a.province_id where a.province_id is not null and p.id is null) missing_province_refs,
      (select count(*) from articles a left join communes c on c.id = a.commune_id where a.commune_id is not null and c.id is null) missing_commune_refs,
      (select count(*) from regions where id in (
        'bcc23fd9-2781-4418-873c-0efae4ee7107',
        'c6b2db9e-30ef-4ab0-8e90-f5d24fa227b9',
        'bcb568d0-874e-4a15-8a23-817663d8bde2'
      )) deleted_regions_remaining,
      (select count(*) from provinces where id in (
        '02cd8af1-7a53-40f4-8c4e-6222dba16772',
        '441e2a93-e89b-4c74-8e31-a4682fb0a314'
      )) deleted_provinces_remaining,
      (select count(*) from communes where id = '83bb84ac-5c59-4a13-81ef-40e0b54e56d3') deleted_communes_remaining,
      (select count(*) from articles where region_id in (
        '1b04b800-a782-4d8f-83e8-d1959f12b90f',
        '523e90c5-7663-449d-8a5f-b0569e95a613',
        '1f05571c-d75f-40e5-8f0b-8767478a4bbb'
      )) canonical_region_articles,
      (select count(*) from articles where province_id in (
        '7425c804-f854-4d43-8408-a10af8d8908f',
        '00d53848-0c14-4d58-8004-dd5b7cd8478e'
      )) canonical_province_articles,
      (select count(*) from articles where province_id = 'b7805c78-5314-4048-8e06-82ca5c97840d') retained_casablanca_articles,
      (select count(*) from articles where commune_id in (
        '4330e8b8-89f4-45b4-8b6f-3117644c92d6',
        'f7c5e840-008b-4087-87f5-2cce846d5caa'
      )) retained_commune_articles
  `);
  console.log(JSON.stringify(rows[0], null, 2));
} finally {
  await client.end();
}
