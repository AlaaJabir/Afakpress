import type {
  ArticleStatus,
  CmsArticle,
  CmsBreakingNews,
  CmsCategory,
  CmsCommune,
  CmsMedia,
  CmsMenuItem,
  CmsPage,
  CmsProvince,
  CmsRegion,
  CmsState,
  CmsUser,
} from "@/lib/cms";
import { initialCmsState } from "@/lib/cms";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/supabase-types";
import { nullableUuid } from "@/lib/uuid";

type Tables = Database["public"]["Tables"];
type ArticleRow = Tables["articles"]["Row"];
type CategoryRow = Tables["categories"]["Row"];
type MenuRow = Tables["menus"]["Row"];
type MediaRow = Tables["media"]["Row"];
type ProfileRow = Tables["profiles"]["Row"];
type PageRow = Tables["pages"]["Row"];
type BreakingRow = Tables["breaking_news"]["Row"];
type RegionRow = Tables["regions"]["Row"];
type ProvinceRow = Tables["provinces"]["Row"];
type CommuneRow = Tables["communes"]["Row"];

export type AdminResource = "articles" | "categories" | "menus" | "media" | "breaking_news" | "pages" | "settings" | "profiles" | "regions" | "provinces" | "communes" | "comments";

function articleStatus(status: string | null | undefined): ArticleStatus {
  const normalized = (status ?? "draft").toLowerCase();
  if (normalized === "published") return "Published";
  if (normalized === "scheduled") return "Scheduled";
  if (normalized === "pending review" || normalized === "pending_review") return "Pending Review";
  return "Draft";
}

function dbStatus(status: ArticleStatus) {
  return status.toLowerCase().replace(/\s+/g, "_");
}

function publishTimestamp(value?: string | null) {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T${new Date().toISOString().slice(11)}` : value;
}

function findCategorySlug(categories: CmsCategory[], id?: string | null) {
  return categories.find((category) => category.id === id)?.slug ?? "";
}

function findAuthorName(users: CmsUser[], id?: string | null) {
  return users.find((user) => user.id === id)?.name ?? "";
}

function findRegionSlug(regions: CmsRegion[], id?: string | null) {
  return regions.find((region) => region.id === id)?.slug ?? "";
}

function findProvinceSlug(regions: CmsRegion[], id?: string | null) {
  return regions.flatMap((region) => region.provinces).find((province) => province.id === id)?.slug ?? "";
}

function findCommuneSlug(regions: CmsRegion[], id?: string | null) {
  return regions.flatMap((region) => region.provinces.flatMap((province) => province.communes)).find((commune) => commune.id === id)?.slug ?? "";
}

function categoryFromRow(row: CategoryRow): CmsCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id ?? "",
    color: "#b91c1c",
    icon: row.name.slice(0, 1),
    description: row.description ?? "",
    seoTitle: `${row.name} | Afakpress`,
    seoDescription: row.description ?? "",
  };
}

function userFromRow(row: ProfileRow): CmsUser {
  return {
    id: row.id,
    name: row.name ?? row.email ?? "Author",
    email: row.email ?? "",
    role: row.role === "Editor" || row.role === "Journalist" || row.role === "Moderator" ? row.role : "Journalist",
    position: row.role ?? "Author",
    bio: "",
    avatar: row.avatar ?? "",
    socialLinks: "",
  };
}

function articleFromRow(row: ArticleRow, categories: CmsCategory[], users: CmsUser[], regions: CmsRegion[]): CmsArticle {
  const category = findCategorySlug(categories, row.category_id);
  const content = row.content ?? "";
  const publishedAt = row.published_at ?? row.created_at ?? "";
  const publishDate = publishedAt.slice(0, 10);
  const region = findRegionSlug(regions, row.region_id);
  const province = findProvinceSlug(regions, row.province_id);
  const commune = findCommuneSlug(regions, row.commune_id);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content,
    body: content.split(/\n{2,}/).filter(Boolean),
    featuredImage: row.featured_image ?? "",
    image: row.featured_image ?? "",
    gallery: "",
    videoUrl: "",
    authorId: row.author_id ?? "",
    author: findAuthorName(users, row.author_id),
    categoryId: row.category_id ?? "",
    category,
    regionId: row.region_id ?? "",
    region,
    provinceId: row.province_id ?? "",
    province,
    communeId: row.commune_id ?? "",
    commune,
    tags: row.seo_keywords ?? "",
    seoTitle: row.seo_title ?? row.title,
    seoDescription: row.seo_description ?? row.excerpt ?? "",
    canonicalUrl: `/article/${row.slug}`,
    status: articleStatus(row.status),
    publishDate,
    publishedAt,
    readingTime: "3 min",
    featured: Boolean(row.is_featured),
    breaking: false,
    mostRead: (row.views ?? 0) > 100,
    homepagePosition: 99,
    relatedArticles: [],
    ownerId: row.author_id ?? "",
  };
}

function menuHref(row: MenuRow) {
  return row.level === 0 ? `/${row.slug}` : row.slug.startsWith("/") ? row.slug : `/${row.slug}`;
}

function menuFromRow(row: MenuRow, children: CmsMenuItem[]): CmsMenuItem {
  return {
    id: row.id,
    label: row.title,
    href: menuHref(row),
    type: "Custom",
    active: row.is_active !== false,
    showInHeader: row.show_header !== false,
    showInFooter: row.show_footer === true,
    order: row.order_index ?? 0,
    children,
  };
}

function buildMenuTree(rows: MenuRow[], parentId: string | null = null): CmsMenuItem[] {
  return rows
    .filter((row) => (row.parent_id ?? null) === parentId)
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((row) => menuFromRow(row, buildMenuTree(rows, row.id)));
}

function mediaFromRow(row: MediaRow): CmsMedia {
  return {
    id: row.id,
    name: row.name ?? row.url.split("/").pop() ?? "Media",
    url: row.url,
    type: row.type === "Video" || row.type === "PDF" ? row.type : "Image",
    folder: row.folder ?? "Newsroom",
    alt: row.alt ?? "",
    caption: row.caption ?? "",
    copyright: row.copyright ?? "",
    optimized: row.optimized !== false,
  };
}

function pageFromRow(row: PageRow): CmsPage {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content ?? "",
    seoTitle: row.seo_title ?? row.title,
    seoDescription: row.seo_description ?? "",
    status: row.status === "Published" || row.status === "published" ? "Published" : "Draft",
  };
}

function breakingFromRow(row: BreakingRow): CmsBreakingNews {
  return {
    id: row.id,
    title: row.title,
    articleId: row.article_id ?? "",
    url: row.url ?? "",
    isActive: row.is_active !== false,
    orderIndex: row.order_index ?? 0,
  };
}

function buildRegionTree(regionRows: RegionRow[], provinceRows: ProvinceRow[], communeRows: CommuneRow[]): CmsRegion[] {
  return regionRows.map((region) => ({
    id: region.id,
    name: region.name,
    slug: region.slug,
    provinces: provinceRows
      .filter((province) => province.region_id === region.id)
      .map((province) => ({
        id: province.id,
        name: province.name,
        slug: province.slug,
        communes: communeRows
          .filter((commune) => commune.province_id === province.id)
          .map((commune) => ({
            id: commune.id,
            name: commune.name,
            slug: commune.slug,
          })),
      })),
  }));
}

export async function loadSupabaseCmsState(): Promise<CmsState | null> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) return null;

  const [categoriesResult, profilesResult, articlesResult, menusResult, mediaResult, pagesResult, breakingResult, regionsResult, provincesResult, communesResult] = await Promise.all([
    supabase.from("categories").select("*"),
    supabase.from("profiles").select("*"),
    supabase.from("articles").select("*").order("published_at", { ascending: false }),
    supabase.from("menus").select("*").order("order_index", { ascending: true }),
    supabase.from("media").select("*"),
    supabase.from("pages").select("*"),
    supabase.from("breaking_news").select("*").order("order_index", { ascending: true }),
    supabase.from("regions").select("*"),
    supabase.from("provinces").select("*"),
    supabase.from("communes").select("*"),
  ]);

  const firstError = [profilesResult, articlesResult, menusResult, mediaResult, pagesResult, breakingResult].find((result) => result.error)?.error;
  if (firstError) {
    throw firstError;
  }

  const categoryRows = (categoriesResult.data ?? []) as CategoryRow[];
  const categories = categoriesResult.error ? initialCmsState.categories : categoryRows.filter((row) => row.is_active !== false).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)).map(categoryFromRow);
  const users = (profilesResult.data ?? []).map(userFromRow);
  const regions = regionsResult.error || provincesResult.error || communesResult.error ? initialCmsState.regions : buildRegionTree(regionsResult.data ?? [], provincesResult.data ?? [], communesResult.data ?? []);
  const articles = (articlesResult.data ?? []).map((row) => articleFromRow(row, categories, users, regions));

  return {
    ...initialCmsState,
    users: users.length ? users : initialCmsState.users,
    categories: categories.length ? categories : initialCmsState.categories,
    articles: articles.length ? articles : initialCmsState.articles,
    regions: regions.length ? regions : initialCmsState.regions,
    menus: menusResult.data?.length ? buildMenuTree(menusResult.data) : initialCmsState.menus,
    media: mediaResult.data?.map(mediaFromRow) ?? [],
    pages: pagesResult.data?.map(pageFromRow) ?? initialCmsState.pages,
    breakingNews: breakingResult.data?.map(breakingFromRow) ?? [],
  };
}

export function articlePayload(article: CmsArticle): Tables["articles"]["Insert"] {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    featured_image: article.featuredImage || article.image || null,
    category_id: nullableUuid(article.categoryId),
    author_id: nullableUuid(article.authorId),
    region_id: nullableUuid(article.regionId),
    province_id: nullableUuid(article.provinceId),
    commune_id: nullableUuid(article.communeId),
    status: dbStatus(article.status),
    is_featured: article.featured,
    allow_comments: true,
    views: 0,
    seo_title: article.seoTitle,
    seo_description: article.seoDescription,
    seo_keywords: article.tags,
    published_at: publishTimestamp(article.publishDate),
  };
}

export function categoryPayload(category: CmsCategory): Tables["categories"]["Insert"] {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
    parent_id: nullableUuid(category.parentId),
    order_index: 0,
    is_active: true,
  };
}

export function profilePayload(user: CmsUser): Tables["profiles"]["Insert"] {
  return {
    name: user.name,
    slug: user.email.split("@")[0] || user.name.toLowerCase().replace(/\s+/g, "-"),
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
  };
}

export function regionPayload(region: CmsRegion): Tables["regions"]["Insert"] {
  return {
    name: region.name,
    slug: region.slug,
  };
}

export function provincePayload(province: CmsProvince, regionId: string): Tables["provinces"]["Insert"] {
  return {
    region_id: regionId,
    name: province.name,
    slug: province.slug,
  };
}

export function communePayload(commune: CmsCommune, provinceId: string): Tables["communes"]["Insert"] {
  return {
    province_id: provinceId,
    name: commune.name,
    slug: commune.slug,
  };
}

export function menuPayload(menu: CmsMenuItem, parentId = "", level = 0, orderIndex = 0): Tables["menus"]["Insert"] {
  return {
    title: menu.label,
    slug: menu.href.replace(/^\//, "") || menu.label.toLowerCase(),
    parent_id: nullableUuid(parentId),
    level,
    order_index: menu.order ?? orderIndex,
    is_active: menu.active !== false,
    show_header: menu.showInHeader !== false,
    show_footer: menu.showInFooter === true,
  };
}

export function mediaPayload(media: CmsMedia): Tables["media"]["Insert"] {
  return {
    name: media.name,
    url: media.url,
    type: media.type,
    folder: media.folder,
    alt: media.alt,
    caption: media.caption,
    copyright: media.copyright,
    optimized: media.optimized,
  };
}

export function pagePayload(page: CmsPage): Tables["pages"]["Insert"] {
  return {
    title: page.title,
    slug: page.slug,
    content: page.content,
    seo_title: page.seoTitle,
    seo_description: page.seoDescription,
    status: page.status.toLowerCase(),
  };
}

export function breakingPayload(item: CmsBreakingNews): Tables["breaking_news"]["Insert"] {
  return {
    title: item.title,
    article_id: nullableUuid(item.articleId),
    url: item.url || null,
    is_active: item.isActive,
    order_index: item.orderIndex,
  };
}
