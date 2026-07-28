import { z } from "zod";
import type { CmsArticle, CmsState } from "@/lib/cms";
import { sanitizeArticleHtml } from "@/lib/article-html";

export const articleStatusValues = ["Draft", "Pending Review", "Scheduled", "Published"] as const;
export const dbArticleStatusValues = ["draft", "pending_review", "scheduled", "published"] as const;

const optionalUuid = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.uuid("Must be a valid UUID.").nullable(),
);

const optionalTimestamp = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Must be a valid timestamp.").nullable(),
);

export const articleDraftSchema = z.object({
  title: z.string().trim().min(1, "Article title is required."),
  slug: z.string().trim().min(1, "Article slug is required."),
  status: z.enum(articleStatusValues, "Article status is not valid."),
  geographicScope: z.enum(["National", "Region", "Province", "Commune"]).optional(),
  publishDate: z.string().optional().refine((value) => !value || !Number.isNaN(Date.parse(value)), "Publish date must be a valid date."),
  categoryId: optionalUuid,
  authorId: optionalUuid,
  regionId: optionalUuid,
  provinceId: optionalUuid,
  communeId: optionalUuid,
});

export const articlePayloadSchema = z.object({
  title: z.string().trim().min(1, "title is required."),
  slug: z.string().trim().min(1, "slug is required."),
  excerpt: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  featured_image: z.string().nullable().optional(),
  geographic_scope: z.enum(["national", "region", "province", "commune"]),
  category_id: optionalUuid,
  author_id: optionalUuid,
  region_id: optionalUuid,
  province_id: optionalUuid,
  commune_id: optionalUuid,
  status: z.enum(dbArticleStatusValues, "status must be draft, pending_review, scheduled, or published.").nullable().optional(),
  is_featured: z.boolean().optional(),
  allow_comments: z.boolean().optional(),
  views: z.number().int().nonnegative().optional(),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  seo_keywords: z.string().nullable().optional(),
  published_at: optionalTimestamp,
});

export type ArticlePayloadInput = z.infer<typeof articlePayloadSchema>;

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join(".") || "article"}: ${issue.message}`).join(" ");
}

export function validateArticleDraft(draft: CmsArticle, state: CmsState) {
  const parsed = articleDraftSchema.safeParse(draft);
  if (!parsed.success) return formatZodError(parsed.error);

  const region = draft.regionId ? state.regions.find((item) => item.id === draft.regionId) : null;
  const province = draft.provinceId ? region?.provinces.find((item) => item.id === draft.provinceId) : null;
  const commune = draft.communeId ? province?.communes.find((item) => item.id === draft.communeId) : null;
  const category = draft.categoryId ? state.categories.find((item) => item.id === draft.categoryId) : null;
  const author = draft.authorId ? state.users.find((item) => item.id === draft.authorId) : null;

  if (draft.categoryId && !category) return "Selected category was not found in CMS data.";
  if (draft.authorId && !author) return "Selected author was not found in CMS data.";
  if (draft.regionId && !region) return "Selected region was not found in CMS data.";
  if (draft.provinceId && !province) return "Selected province must belong to the selected region.";
  if (draft.communeId && !commune) return "Selected commune must belong to the selected province.";
  if (draft.status === "Published" && !category) return "Select a category before publishing.";
  if (draft.status === "Published") {
    const meaningfulContent = sanitizeArticleHtml(draft.content)
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!meaningfulContent) return "Add article content before publishing.";
  }
  const featuredImage = (draft.featuredImage || draft.image).trim();
  if (featuredImage && !/^https?:\/\//i.test(featuredImage)) {
    return "Featured image must use a persistent HTTP or HTTPS URL.";
  }
  const scope = draft.geographicScope ?? (draft.communeId ? "Commune" : draft.provinceId ? "Province" : draft.regionId ? "Region" : "National");
  if (scope === "National" && (draft.regionId || draft.provinceId || draft.communeId)) return "National articles cannot have a region, province, or commune.";
  if (scope === "Region" && (!draft.regionId || draft.provinceId || draft.communeId)) return "Region scope requires only a region.";
  if (scope === "Province" && (!draft.regionId || !draft.provinceId || draft.communeId)) return "Province scope requires a region and province.";
  if (scope === "Commune" && (!draft.regionId || !draft.provinceId || !draft.communeId)) return "Commune scope requires a region, province, and commune.";

  return "";
}
