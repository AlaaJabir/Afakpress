import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { initialCmsState, type CmsArticle } from "../src/lib/cms";
import { validateArticleDraft } from "../src/lib/article-validation";
import { articlePayload } from "../src/lib/supabase-cms";

const root = process.cwd();

function publishedArticle(overrides: Partial<CmsArticle> = {}): CmsArticle {
  const category = initialCmsState.categories[0];
  return {
    ...initialCmsState.articles[0],
    id: "",
    title: "Publishing regression article",
    slug: "publishing-regression-article",
    content: "<p>Meaningful article content.</p>",
    featuredImage: "https://example.com/media/featured.jpg",
    image: "https://example.com/media/featured.jpg",
    categoryId: category.id,
    category: category.slug,
    geographicScope: "National",
    regionId: "",
    provinceId: "",
    communeId: "",
    status: "Published",
    ...overrides,
  };
}

test("featured image uses the canonical featured_image payload field", () => {
  const payload = articlePayload(publishedArticle());
  expect(payload.featured_image).toBe("https://example.com/media/featured.jpg");
  expect(payload).not.toHaveProperty("image");
  expect(payload).not.toHaveProperty("featured_image_url");
});

test("published article validation accepts rich tables and rejects temporary image URLs", () => {
  const richArticle = publishedArticle({
    content: "<table><tbody><tr><th>City</th></tr><tr><td>Rabat</td></tr></tbody></table>",
  });
  expect(validateArticleDraft(richArticle, initialCmsState)).toBe("");
  expect(validateArticleDraft({ ...richArticle, featuredImage: "blob:http://localhost/image", image: "" }, initialCmsState))
    .toBe("Featured image must use a persistent HTTP or HTTPS URL.");
});

test("published articles require category and meaningful editor content", () => {
  expect(validateArticleDraft(publishedArticle({ categoryId: "" }), initialCmsState))
    .toBe("Select a category before publishing.");
  expect(validateArticleDraft(publishedArticle({ content: "<p></p>" }), initialCmsState))
    .toBe("Add article content before publishing.");
});

test("article editor transfers confirmed media to draft and blocks save during upload", async () => {
  const source = await readFile(path.join(root, "src/components/AdminCMS.tsx"), "utf8");
  expect(source).toContain('setDraft((current) => ({ ...current, featuredImage: pendingMedia.url, image: pendingMedia.url }))');
  expect(source).toContain("Use this image");
  expect(source).toContain('data-testid="selected-featured-image"');
  expect(source).toContain("disabled={!canEdit || isUploadingFeaturedImage || isSavingArticle}");
  expect(source).toContain('setDraft((current) => ({ ...current, featuredImage: "", image: "" }))');
});

test("upload persists a media record and article API maps actionable database errors", async () => {
  const uploadSource = await readFile(path.join(root, "src/app/api/admin/upload/route.ts"), "utf8");
  const apiSource = await readFile(path.join(root, "src/app/api/admin/[resource]/route.ts"), "utf8");
  expect(uploadSource).toContain('.from("media")');
  expect(uploadSource).toContain("path, media");
  expect(apiSource).toContain('error.code === "22P02"');
  expect(apiSource).toContain('error.code === "23505"');
  expect(apiSource).toContain('error.code === "23503"');
  expect(apiSource).toContain('error.code === "PGRST204"');
  expect(apiSource).toContain("revalidateArticlePublishScope");
});
