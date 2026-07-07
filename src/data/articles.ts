import { moroccoRegions } from "./morocco-regions";

export type Category = {
  name: string;
  slug: string;
  description: string;
};

export type Article = {
  title: string;
  slug: string;
  excerpt: string;
  body: string[];
  category: string;
  region: string;
  province: string;
  commune: string;
  author: string;
  publishedAt: string;
  readingTime: string;
  image: string;
  featured?: boolean;
  breaking?: boolean;
  mostRead?: boolean;
};

export const categories: Category[] = [
  { name: "National", slug: "national", description: "Public affairs, institutions, economy, and society across Morocco." },
  { name: "Regions", slug: "regions", description: "Local coverage from Morocco's regions, provinces, prefectures, and communes." },
  { name: "Economy", slug: "economy", description: "Markets, investment, employment, industry, agriculture, and public finance." },
  { name: "Culture", slug: "culture", description: "Arts, heritage, festivals, books, cinema, and creative communities." },
  { name: "Opinion", slug: "opinion", description: "Editorial analysis, columns, and informed civic debate." },
];

export const articles: Article[] = [
  {
    title: "Morocco accelerates regional investment plans with new local project desks",
    slug: "morocco-regional-investment-local-project-desks",
    excerpt: "Regional councils are expanding one-stop support for entrepreneurs, cooperatives, and public-private projects.",
    body: [
      "Morocco's regional investment ecosystem is moving toward faster local processing as councils and investment centers coordinate new project desks in major provinces.",
      "The approach is designed to reduce administrative delays, support small enterprises, and make regional opportunities easier to compare for Moroccan and international investors.",
      "Local officials say the next phase will focus on industrial land, digital services, tourism circuits, and training programs aligned with each region's economic strengths.",
    ],
    category: "economy",
    region: "casablanca-settat",
    province: "casablanca",
    commune: "maarif",
    author: "Afakpress Desk",
    publishedAt: "2026-07-07",
    readingTime: "4 min",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    breaking: true,
    mostRead: true,
  },
  {
    title: "Tanger port corridor sees renewed logistics activity ahead of summer peak",
    slug: "tanger-port-corridor-logistics-summer-peak",
    excerpt: "Transport operators report stronger freight flows as regional exporters prepare for seasonal demand.",
    body: [
      "The Tanger logistics corridor is seeing increased traffic across storage, customs, and road transport facilities.",
      "Exporters in automotive parts, food processing, and textile supply chains are adjusting schedules to keep deliveries stable through the summer peak.",
    ],
    category: "regions",
    region: "tanger-tetouan-al-hoceima",
    province: "tanger-assilah",
    commune: "tanger",
    author: "Regional Bureau",
    publishedAt: "2026-07-06",
    readingTime: "3 min",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
    mostRead: true,
  },
  {
    title: "Rabat launches civic services dashboard for commune-level follow-up",
    slug: "rabat-civic-services-dashboard-commune-follow-up",
    excerpt: "The capital is piloting a public dashboard covering permits, street maintenance, and citizen requests.",
    body: [
      "Rabat has introduced a digital dashboard that tracks civic service requests at commune level.",
      "The pilot covers maintenance, administrative permits, and public-space reports, with broader rollout planned after technical evaluation.",
    ],
    category: "national",
    region: "rabat-sale-kenitra",
    province: "rabat",
    commune: "rabat",
    author: "Afakpress Desk",
    publishedAt: "2026-07-05",
    readingTime: "3 min",
    image: "https://images.unsplash.com/photo-1577147443647-81856d5151af?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Agadir tourism operators prepare integrated coastal and mountain offers",
    slug: "agadir-tourism-coastal-mountain-offers",
    excerpt: "Local professionals are packaging beaches, rural lodging, and cultural routes for longer stays.",
    body: [
      "Tourism operators in Souss-Massa are preparing offers that connect Agadir's coastline with nearby mountain and rural destinations.",
      "The packages aim to extend average visitor stays while involving cooperatives, guides, transport companies, and cultural venues.",
    ],
    category: "culture",
    region: "souss-massa",
    province: "agadir-ida-outanane",
    commune: "agadir",
    author: "Culture Desk",
    publishedAt: "2026-07-04",
    readingTime: "4 min",
    image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
    mostRead: true,
  },
  {
    title: "Why commune data should become Morocco's next public-service priority",
    slug: "commune-data-morocco-public-service-priority",
    excerpt: "Reliable local information can help citizens understand budgets, services, and development choices.",
    body: [
      "Strong public-service reporting starts with information that citizens can understand and compare.",
      "Commune-level data on budgets, road works, permits, and service delays would help residents follow decisions that shape daily life.",
    ],
    category: "opinion",
    region: "fes-meknes",
    province: "fes",
    commune: "fes",
    author: "Editorial Board",
    publishedAt: "2026-07-03",
    readingTime: "5 min",
    image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Dakhla renewables projects draw supplier interest from southern provinces",
    slug: "dakhla-renewables-supplier-interest-southern-provinces",
    excerpt: "Energy contractors are mapping local supply needs around training, maintenance, and logistics.",
    body: [
      "Renewable energy projects around Dakhla are encouraging suppliers to assess local capacity in maintenance, transport, and technical training.",
      "Business groups say the region's long-term opportunity depends on connecting infrastructure projects with local skills development.",
    ],
    category: "economy",
    region: "dakhla-oued-ed-dahab",
    province: "oued-ed-dahab",
    commune: "dakhla",
    author: "Economy Desk",
    publishedAt: "2026-07-02",
    readingTime: "4 min",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
];

export const breakingNews = articles.filter((article) => article.breaking);
export const featuredArticle = articles.find((article) => article.featured) ?? articles[0];
export const latestArticles = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
export const mostReadArticles = articles.filter((article) => article.mostRead);

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getRegion(slug: string) {
  return moroccoRegions.find((region) => region.slug === slug);
}

export function getArticlesByCategory(slug: string) {
  return articles.filter((article) => article.category === slug);
}

export function getArticlesByRegion(slug: string) {
  return articles.filter((article) => article.region === slug);
}

