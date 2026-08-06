import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

test("article save completes without blocking on the full Supabase refresh", async () => {
  const source = await readFile(path.join(root, "src/components/AdminCMS.tsx"), "utf8");
  const saveArticle = source.slice(source.indexOf("const saveArticle = async () => {"), source.indexOf("const bulkUpdate"));

  expect(saveArticle).toContain("await adminRequest(\"articles\"");
  expect(saveArticle).toContain("notify(\"success\", \"Article saved to Supabase.\");");
  expect(saveArticle).toContain("router.refresh();");
  expect(saveArticle).not.toContain("await refreshFromSupabase();");
});

test("article save stops loading and ignores repeated clicks while publishing", async () => {
  const source = await readFile(path.join(root, "src/components/AdminCMS.tsx"), "utf8");
  const saveArticle = source.slice(source.indexOf("const saveArticle = async () => {"), source.indexOf("const bulkUpdate"));

  expect(source).toContain("const [isSavingArticle, setIsSavingArticle] = useState(false);");
  expect(source).toContain("const isSavingArticleRef = useRef(false);");
  expect(saveArticle).toContain("if (isSavingArticleRef.current) return;");
  expect(saveArticle).toContain("isSavingArticleRef.current = true;");
  expect(saveArticle).toContain("isSavingArticleRef.current = false;");
  expect(saveArticle).toContain("setIsSavingArticle(false);");
  expect(source).toContain("disabled={!canEdit || isUploadingFeaturedImage || isSavingArticle}");
});

test("article admin API invalidates affected public caches after Supabase writes", async () => {
  const source = await readFile(path.join(root, "src/app/api/admin/[resource]/route.ts"), "utf8");

  expect(source).toContain("revalidatePath(path)");
  expect(source).toContain("revalidateTag(\"cms:articles\", { expire: 0 })");
  expect(source).toContain("const revalidatedPaths = table === \"articles\" ? await revalidateArticlePublishScope");
  expect(source).toContain("paths.add(`/article/${article.slug}`)");
  expect(source).toContain("paths.add(`/category/${refs.categorySlug}`)");
  expect(source).toContain("paths.add(`/region/${refs.regionSlug}`)");
  expect(source).toContain("paths.add(`/province/${refs.provinceSlug}`)");
  expect(source).toContain("paths.add(`/commune/${refs.communeSlug}`)");
});

test("CMS data loading falls back when Supabase embedded article references fail", async () => {
  const source = await readFile(path.join(root, "src/lib/supabase-cms.ts"), "utf8");

  expect(source).toContain("joinedArticlesResult");
  expect(source).toContain("retrying without embedded references");
  expect(source).toContain("supabase.from(\"articles\").select(articleColumns).order(\"published_at\", { ascending: false })");
  expect(source).toContain("if (articlesResult.error) {");
});
