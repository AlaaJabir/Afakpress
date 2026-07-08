import { articles, categories } from "@/data/articles";
import { moroccoRegions } from "@/data/morocco-regions";
import { slugify } from "@/lib/slug";

export type Role = "Super Admin" | "Editor" | "Journalist" | "Moderator";
export type ArticleStatus = "Draft" | "Pending Review" | "Scheduled" | "Published";
export type NoticeType = "success" | "error" | "warning";

export type CmsUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  position: string;
  bio: string;
  avatar: string;
  socialLinks: string;
};

export type CmsCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string;
  color: string;
  icon: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

export type CmsCommune = {
  id: string;
  name: string;
  slug: string;
};

export type CmsProvince = {
  id: string;
  name: string;
  slug: string;
  communes: CmsCommune[];
};

export type CmsRegion = {
  id: string;
  name: string;
  slug: string;
  provinces: CmsProvince[];
};

export type CmsMedia = {
  id: string;
  name: string;
  url: string;
  type: "Image" | "Video" | "PDF";
  folder: string;
  alt: string;
  caption: string;
  copyright: string;
  optimized: boolean;
};

export type CmsArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  body: string[];
  featuredImage: string;
  image: string;
  gallery: string;
  videoUrl: string;
  authorId: string;
  author: string;
  categoryId: string;
  category: string;
  regionId: string;
  region: string;
  provinceId: string;
  province: string;
  communeId: string;
  commune: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  status: ArticleStatus;
  publishDate: string;
  publishedAt: string;
  readingTime: string;
  featured: boolean;
  breaking: boolean;
  mostRead: boolean;
  homepagePosition: number;
  relatedArticles: string[];
  ownerId: string;
};

export type CmsMenuItem = {
  id: string;
  label: string;
  href: string;
  type: "Custom" | "Page" | "Category" | "Region" | "Province" | "Commune";
  active?: boolean;
  showInHeader?: boolean;
  showInFooter?: boolean;
  order?: number;
  children: CmsMenuItem[];
};

export type CmsBreakingNews = {
  id: string;
  title: string;
  articleId: string;
  url: string;
  isActive: boolean;
  orderIndex: number;
};

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  status: "Draft" | "Published";
};

export type CmsComment = {
  id: string;
  articleId: string;
  author: string;
  email: string;
  content: string;
  status: "Pending" | "Approved" | "Rejected" | "Spam";
};

export type CmsSubscriber = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type HomepageSection = {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
};

export type CmsSettings = {
  websiteName: string;
  logo: string;
  darkLogo: string;
  favicon: string;
  contactEmail: string;
  phone: string;
  address: string;
  footer: string;
  socialLinks: string;
  analyticsCode: string;
  googleSearchConsole: string;
  googleTagManager: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  robots: string;
  openGraphTitle: string;
  twitterCard: string;
  theme: "Light" | "Dark";
  accentColor: string;
};

export type CmsState = {
  users: CmsUser[];
  categories: CmsCategory[];
  regions: CmsRegion[];
  media: CmsMedia[];
  articles: CmsArticle[];
  menus: CmsMenuItem[];
  breakingNews: CmsBreakingNews[];
  pages: CmsPage[];
  comments: CmsComment[];
  subscribers: CmsSubscriber[];
  homepageSections: HomepageSection[];
  settings: CmsSettings;
};

export const rolePermissions: Record<Role, string[]> = {
  "Super Admin": ["dashboard", "articles", "categories", "media", "menus", "breaking", "regions", "authors", "pages", "homepage", "comments", "newsletter", "seo", "settings"],
  Editor: ["dashboard", "articles", "categories", "media", "menus", "breaking", "homepage"],
  Journalist: ["dashboard", "articles", "media"],
  Moderator: ["dashboard", "articles", "comments"],
};

const users: CmsUser[] = [
  { id: "user-super", name: "Alaa Jabir", email: "admin@afakpress.ma", role: "Super Admin", position: "Publisher", bio: "Full platform administrator.", avatar: "", socialLinks: "LinkedIn, X" },
  { id: "user-editor", name: "Afakpress Editor", email: "editor@afakpress.ma", role: "Editor", position: "Managing Editor", bio: "Coordinates the newsroom desk.", avatar: "", socialLinks: "" },
  { id: "user-journalist", name: "Regional Bureau", email: "journalist@afakpress.ma", role: "Journalist", position: "Journalist", bio: "Reports from Moroccan regions.", avatar: "", socialLinks: "" },
  { id: "user-moderator", name: "Review Desk", email: "moderator@afakpress.ma", role: "Moderator", position: "Moderator", bio: "Reviews comments and submitted articles.", avatar: "", socialLinks: "" },
];

export const cmsCredentials: Record<string, { password: string; userId: string }> = {
  "admin@afakpress.ma": { password: "afakpress2026", userId: "user-super" },
  "editor@afakpress.ma": { password: "editor2026", userId: "user-editor" },
  "journalist@afakpress.ma": { password: "journalist2026", userId: "user-journalist" },
  "moderator@afakpress.ma": { password: "moderator2026", userId: "user-moderator" },
};

function section(label: string, order: number): HomepageSection {
  return { id: slugify(label), label, enabled: true, order };
}

const cmsCategories = categories.map((category, index): CmsCategory => ({
  id: `cat-${category.slug}`,
  name: category.name,
  slug: category.slug,
  parentId: "",
  color: ["#b91c1c", "#0f766e", "#1d4ed8", "#7c3aed", "#334155"][index] ?? "#b91c1c",
  icon: category.name.slice(0, 1),
  description: category.description,
  seoTitle: `${category.name} | Afakpress`,
  seoDescription: category.description,
}));

const cmsRegions = moroccoRegions.map((region): CmsRegion => ({
  id: `region-${region.slug}`,
  name: region.name,
  slug: region.slug,
  provinces: region.provinces.map((province) => ({
    id: `province-${province.slug}`,
    name: province.name,
    slug: province.slug,
    communes: province.communes.map((commune) => ({ id: `commune-${commune.slug}`, name: commune.name, slug: commune.slug })),
  })),
}));

const cmsArticles = articles.map((article, index): CmsArticle => {
  const category = cmsCategories.find((item) => item.slug === article.category);
  const region = cmsRegions.find((item) => item.slug === article.region);
  const province = region?.provinces.find((item) => item.slug === article.province);
  const commune = province?.communes.find((item) => item.slug === article.commune);
  const content = article.body.join("\n\n");

  return {
    id: `article-${article.slug}`,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content,
    body: article.body,
    featuredImage: article.image,
    image: article.image,
    gallery: "",
    videoUrl: "",
    authorId: users[index % users.length].id,
    author: article.author,
    categoryId: category?.id ?? "",
    category: article.category,
    regionId: region?.id ?? "",
    region: article.region,
    provinceId: province?.id ?? "",
    province: article.province,
    communeId: commune?.id ?? "",
    commune: article.commune,
    tags: "Morocco, regions, news",
    seoTitle: article.title,
    seoDescription: article.excerpt,
    canonicalUrl: `/article/${article.slug}`,
    status: "Published",
    publishDate: article.publishedAt,
    publishedAt: article.publishedAt,
    readingTime: article.readingTime,
    featured: Boolean(article.featured),
    breaking: Boolean(article.breaking),
    mostRead: Boolean(article.mostRead),
    homepagePosition: index + 1,
    relatedArticles: [],
    ownerId: users[index % users.length].id,
  };
});

const media: CmsMedia[] = cmsArticles.map((article, index) => ({
  id: `media-${index + 1}`,
  name: `${article.slug}.jpg`,
  url: article.featuredImage,
  type: "Image",
  folder: "Newsroom",
  alt: article.title,
  caption: article.excerpt,
  copyright: "Unsplash sample",
  optimized: true,
}));

function regionMenu(region: CmsRegion): CmsMenuItem {
  return {
    id: `menu-${region.slug}`,
    label: region.name,
    href: `/region/${region.slug}`,
    type: "Region",
    children: region.provinces.map((province) => ({
      id: `menu-${region.slug}-${province.slug}`,
      label: province.name,
      href: `/province/${province.slug}`,
      type: "Province",
      children: province.communes.map((commune) => ({
        id: `menu-${region.slug}-${province.slug}-${commune.slug}`,
        label: commune.name,
        href: `/commune/${commune.slug}`,
        type: "Commune",
        children: [],
      })),
    })),
  };
}

const menus: CmsMenuItem[] = [
  { id: "menu-national", label: "National", href: "/category/national", type: "Category", children: [] },
  { id: "menu-economy", label: "Economy", href: "/category/economy", type: "Category", children: [] },
  { id: "menu-culture", label: "Culture", href: "/category/culture", type: "Category", children: [] },
  { id: "menu-opinion", label: "Opinion", href: "/category/opinion", type: "Category", children: [] },
  ...cmsRegions.map(regionMenu),
];

export const initialCmsState: CmsState = {
  users,
  categories: cmsCategories,
  regions: cmsRegions,
  media,
  articles: cmsArticles,
  menus,
  breakingNews: [],
  pages: [
    { id: "page-about", title: "About", slug: "about", content: "Afakpress is a Moroccan regional news platform.", seoTitle: "About Afakpress", seoDescription: "About Afakpress", status: "Published" },
    { id: "page-contact", title: "Contact", slug: "contact", content: "Contact the newsroom for tips, corrections, and advertising.", seoTitle: "Contact Afakpress", seoDescription: "Contact Afakpress", status: "Published" },
    { id: "page-privacy", title: "Privacy Policy", slug: "privacy-policy", content: "Privacy policy content.", seoTitle: "Privacy Policy", seoDescription: "Privacy policy", status: "Draft" },
  ],
  comments: [
    { id: "comment-1", articleId: cmsArticles[0]?.id ?? "", author: "Reader", email: "reader@example.com", content: "Useful regional update.", status: "Pending" },
  ],
  subscribers: [
    { id: "subscriber-1", email: "briefing@example.com", name: "Daily Reader", createdAt: "2026-07-07" },
  ],
  homepageSections: [
    section("Featured Slider", 1),
    section("Latest News", 2),
    section("Politics", 3),
    section("Economy", 4),
    section("Society", 5),
    section("Sport", 6),
    section("Technology", 7),
    section("Culture", 8),
    section("Regional News", 9),
    section("Opinion", 10),
    section("Videos", 11),
  ],
  settings: {
    websiteName: "Afakpress",
    logo: "Afakpress",
    darkLogo: "Afakpress",
    favicon: "/favicon.ico",
    contactEmail: "contact@afakpress.ma",
    phone: "+212 5 00 00 00 00",
    address: "Morocco",
    footer: "Moroccan press and regional news platform covering national affairs, local development, economy, culture, and civic life.",
    socialLinks: "Facebook, X, LinkedIn, YouTube",
    analyticsCode: "",
    googleSearchConsole: "",
    googleTagManager: "",
    defaultMetaTitle: "Afakpress",
    defaultMetaDescription: "Moroccan press and regional news platform",
    robots: "index,follow",
    openGraphTitle: "Afakpress",
    twitterCard: "summary_large_image",
    theme: "Light",
    accentColor: "#b91c1c",
  },
};

export function canAccess(role: Role, area: string) {
  return rolePermissions[role].includes(area);
}

export function getPublishedArticles(state: CmsState) {
  return state.articles
    .filter((article) => article.status === "Published")
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
