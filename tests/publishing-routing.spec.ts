import { expect, test, type Page } from "@playwright/test";

const cmsState = {
  users: [],
  categories: [
    { id: "cat-politique", name: "Politique", slug: "politique", parentId: "", color: "#b91c1c", icon: "P", description: "Political coverage", seoTitle: "", seoDescription: "" },
    { id: "cat-economy", name: "Economy", slug: "economy", parentId: "", color: "#0f766e", icon: "E", description: "Economic coverage", seoTitle: "", seoDescription: "" },
  ],
  regions: [
    {
      id: "region-rabat",
      name: "Rabat-Sale-Kenitra",
      slug: "rabat-sale-kenitra",
      provinces: [
        {
          id: "province-rabat",
          name: "Rabat",
          slug: "rabat",
          communes: [{ id: "commune-rabat", name: "Rabat", slug: "rabat" }],
        },
      ],
    },
    {
      id: "region-casablanca",
      name: "Casablanca-Settat",
      slug: "casablanca-settat",
      provinces: [
        {
          id: "province-nouaceur",
          name: "Nouaceur",
          slug: "nouaceur",
          communes: [{ id: "commune-bouskoura", name: "Bouskoura", slug: "bouskoura" }],
        },
      ],
    },
  ],
  media: [],
  articles: [
    article({ id: "article-region", title: "Region Only Publish", slug: "region-only-publish", region: "rabat-sale-kenitra", province: "", commune: "", publishedAt: "2026-07-20T12:04:00.000Z" }),
    article({ id: "article-province", title: "Province Publish", slug: "province-publish", region: "rabat-sale-kenitra", province: "rabat", commune: "", publishedAt: "2026-07-20T12:03:00.000Z" }),
    article({ id: "article-commune", title: "Commune Publish", slug: "commune-publish", region: "rabat-sale-kenitra", province: "rabat", commune: "rabat", publishedAt: "2026-07-20T12:02:00.000Z" }),
    article({ id: "article-category", title: "Category Publish", slug: "category-publish", category: "economy", region: "rabat-sale-kenitra", province: "", commune: "", publishedAt: "2026-07-20T12:01:00.000Z" }),
    article({ id: "article-other", title: "Unrelated Casablanca Publish", slug: "unrelated-casablanca-publish", region: "casablanca-settat", province: "nouaceur", commune: "bouskoura", publishedAt: "2026-07-20T12:00:00.000Z" }),
    article({ id: "article-draft", title: "Draft Should Not Render", slug: "draft-should-not-render", status: "Draft", region: "rabat-sale-kenitra", province: "rabat", commune: "rabat" }),
  ],
  menus: [],
  breakingNews: [],
  pages: [],
  comments: [],
  subscribers: [],
  homepageSections: [
    { id: "featured-slider", label: "Featured Slider", enabled: true, order: 1 },
    { id: "latest-news", label: "Latest News", enabled: true, order: 2 },
    { id: "regional-news", label: "Regional News", enabled: true, order: 3 },
    { id: "economy", label: "Economy", enabled: true, order: 4 },
    { id: "opinion", label: "Opinion", enabled: true, order: 5 },
  ],
  settings: {
    websiteName: "Afakpress",
    logo: "",
    darkLogo: "",
    favicon: "",
    contactEmail: "",
    phone: "",
    address: "",
    footer: "",
    socialLinks: "",
    analyticsCode: "",
    googleSearchConsole: "",
    googleTagManager: "",
    defaultMetaTitle: "",
    defaultMetaDescription: "",
    robots: "index,follow",
    openGraphTitle: "",
    twitterCard: "summary_large_image",
    theme: "Light",
    accentColor: "#b91c1c",
  },
};

function article(overrides: Partial<Record<string, string>> = {}) {
  const title = overrides.title ?? "Published Article";
  const slug = overrides.slug ?? "published-article";
  return {
    id: overrides.id ?? slug,
    title,
    slug,
    excerpt: `${title} excerpt`,
    content: `${title} paragraph one.\n\n${title} paragraph two.`,
    body: [`${title} paragraph one.`, `${title} paragraph two.`],
    featuredImage: "",
    image: "",
    gallery: "",
    videoUrl: "",
    authorId: "",
    author: "Afakpress",
    categoryId: overrides.category === "economy" ? "cat-economy" : "cat-politique",
    category: overrides.category ?? "politique",
    regionId: "",
    region: overrides.region ?? "",
    provinceId: "",
    province: overrides.province ?? "",
    communeId: "",
    commune: overrides.commune ?? "",
    tags: "",
    seoTitle: title,
    seoDescription: `${title} excerpt`,
    canonicalUrl: `/article/${slug}`,
    status: overrides.status ?? "Published",
    publishDate: (overrides.publishedAt ?? "2026-07-20T12:00:00.000Z").slice(0, 10),
    publishedAt: overrides.publishedAt ?? "2026-07-20T12:00:00.000Z",
    readingTime: "3 min",
    featured: overrides.id === "article-region",
    breaking: false,
    mostRead: false,
    homepagePosition: 99,
    relatedArticles: [],
    ownerId: "",
  };
}

async function seedCms(page: Page) {
  await page.addInitScript((state) => {
    (window as Window & { __AFAKPRESS_TEST_CMS_STATE__?: typeof state }).__AFAKPRESS_TEST_CMS_STATE__ = state;
  }, cmsState);
}

async function seedCmsState(page: Page, state: typeof cmsState) {
  await page.addInitScript((nextState) => {
    (window as Window & { __AFAKPRESS_TEST_CMS_STATE__?: typeof nextState }).__AFAKPRESS_TEST_CMS_STATE__ = nextState;
  }, state);
}

test.beforeEach(async ({ page }) => {
  await seedCms(page);
});

test("published articles appear on the homepage immediately, newest first, without drafts", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("h1", { hasText: "Region Only Publish" })).toBeVisible();
  await expect(page.locator("body")).toContainText("Province Publish");
  await expect(page.locator("body")).toContainText("Commune Publish");
  await expect(page.locator("body")).not.toContainText("Draft Should Not Render");
});

test("geographic article scope is exact across region, province, and commune pages", async ({ page }) => {
  await page.goto("/region/rabat-sale-kenitra");
  await expect(page.locator("body")).toContainText("Region Only Publish");
  await expect(page.locator("body")).toContainText("Province Publish");
  await expect(page.locator("body")).toContainText("Commune Publish");
  await expect(page.locator("body")).not.toContainText("Unrelated Casablanca Publish");

  await page.goto("/province/rabat");
  await expect(page.locator("body")).not.toContainText("Region Only Publish");
  await expect(page.locator("body")).toContainText("Province Publish");
  await expect(page.locator("body")).toContainText("Commune Publish");

  await page.goto("/commune/rabat");
  await expect(page.locator("body")).not.toContainText("Region Only Publish");
  await expect(page.locator("body")).not.toContainText("Province Publish");
  await expect(page.locator("body")).toContainText("Commune Publish");
});

test("category and article pages only render published matching content", async ({ page }) => {
  await page.goto("/category/politique");
  await expect(page.locator("body")).toContainText("Region Only Publish");
  await expect(page.locator("body")).not.toContainText("Category Publish");

  await page.goto("/article/commune-publish");
  await expect(page.getByRole("heading", { name: "Commune Publish" })).toBeVisible();

  await page.goto("/article/draft-should-not-render");
  await expect(page.locator("body")).toContainText("Article not found.");
});

test("published articles resolve category and geography from ids when slug fields are empty", async ({ page }) => {
  const idOnlyState = {
    ...cmsState,
    articles: [
      article({ id: "id-region", title: "ID Region Publish", slug: "id-region-publish", publishedAt: "2026-07-20T13:05:00.000Z" }),
      article({ id: "id-province", title: "ID Province Publish", slug: "id-province-publish", publishedAt: "2026-07-20T13:04:00.000Z" }),
      article({ id: "id-commune", title: "ID Commune Publish", slug: "id-commune-publish", publishedAt: "2026-07-20T13:03:00.000Z" }),
      article({ id: "id-unrelated", title: "ID Unrelated Publish", slug: "id-unrelated-publish", publishedAt: "2026-07-20T13:02:00.000Z" }),
      article({ id: "id-draft", title: "ID Draft Hidden", slug: "id-draft-hidden", status: "Draft", publishedAt: "2026-07-20T13:01:00.000Z" }),
    ].map((item) => {
      if (item.id === "id-unrelated") {
        return { ...item, category: "", categoryId: "cat-economy", region: "", regionId: "region-casablanca", province: "", provinceId: "province-nouaceur", commune: "", communeId: "commune-bouskoura" };
      }
      if (item.id === "id-province") {
        return { ...item, category: "", categoryId: "cat-politique", region: "", regionId: "region-rabat", province: "", provinceId: "province-rabat", commune: "", communeId: "" };
      }
      if (item.id === "id-commune" || item.id === "id-draft") {
        return { ...item, category: "", categoryId: "cat-politique", region: "", regionId: "region-rabat", province: "", provinceId: "province-rabat", commune: "", communeId: "commune-rabat" };
      }
      return { ...item, category: "", categoryId: "cat-politique", region: "", regionId: "region-rabat", province: "", provinceId: "", commune: "", communeId: "" };
    }),
  };
  await seedCmsState(page, idOnlyState);

  await page.goto("/category/politique");
  await expect(page.locator("body")).toContainText("ID Region Publish");
  await expect(page.locator("body")).toContainText("ID Province Publish");
  await expect(page.locator("body")).toContainText("ID Commune Publish");
  await expect(page.locator("body")).not.toContainText("ID Unrelated Publish");
  await expect(page.locator("body")).not.toContainText("ID Draft Hidden");

  await page.goto("/region/rabat-sale-kenitra");
  await expect(page.locator("body")).toContainText("ID Region Publish");
  await expect(page.locator("body")).toContainText("ID Province Publish");
  await expect(page.locator("body")).toContainText("ID Commune Publish");
  await expect(page.locator("body")).not.toContainText("ID Unrelated Publish");

  await page.goto("/province/rabat");
  await expect(page.locator("body")).not.toContainText("ID Region Publish");
  await expect(page.locator("body")).toContainText("ID Province Publish");
  await expect(page.locator("body")).toContainText("ID Commune Publish");
  await expect(page.getByRole("heading", { name: "ID Province Publish" })).toHaveCount(1);

  await page.goto("/commune/rabat");
  await expect(page.locator("body")).not.toContainText("ID Region Publish");
  await expect(page.locator("body")).not.toContainText("ID Province Publish");
  await expect(page.locator("body")).toContainText("ID Commune Publish");
  await expect(page.getByRole("heading", { name: "ID Commune Publish" })).toHaveCount(1);
});
