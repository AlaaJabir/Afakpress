import type { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getTerritoriesHomeData } from "@/lib/territories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const configuredBase = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!configuredBase) return [];
  const baseUrl = configuredBase.replace(/\/+$/, "");
  const index = await getTerritoriesHomeData();
  if (index.status !== "ok") return [];

  const entries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/territoires`, changeFrequency: "weekly", priority: 0.8 },
    ...index.data.searchItems.map((item) => ({
      url: `${baseUrl}${item.href}`,
      changeFrequency: "weekly" as const,
      priority: item.type === "region" ? 0.7 : item.type === "province" ? 0.6 : 0.5,
    })),
  ];

  const supabase = createServerSupabaseClient();
  if (supabase) {
    const { data } = await supabase.from("officials").select("id,updated_at").eq("is_published", true);
    for (const official of data ?? []) {
      entries.push({
        url: `${baseUrl}/territoires/elus/${encodeURIComponent(official.id)}`,
        lastModified: official.updated_at ? new Date(official.updated_at) : undefined,
        changeFrequency: "monthly",
        priority: 0.4,
      });
    }
  }
  return entries;
}
