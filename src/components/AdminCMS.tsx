"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getPublishedArticles,
  initialCmsState,
  makeId,
  rolePermissions,
  type ArticleStatus,
  type CmsArticle,
  type CmsCategory,
  type CmsCommune,
  type CmsMedia,
  type CmsMenuItem,
  type CmsPage,
  type CmsProvince,
  type CmsRegion,
  type CmsUser,
} from "@/lib/cms";
import { useCms } from "@/lib/cms-store";
import { slugify } from "@/lib/slug";
import { stableUuid } from "@/lib/uuid";
import { canManageAdmins, cmsRoleFromAdmin, type AdminRole } from "@/lib/admin-roles";
import type { AdminSession, AdminUserRecord } from "@/lib/admin-auth";
import { articleStatusValues, validateArticleDraft } from "@/lib/article-validation";
import {
  articlePayload,
  breakingPayload,
  categoryPayload,
  mediaPayload,
  menuPayload,
  pagePayload,
  profilePayload,
  communePayload,
  provincePayload,
  regionPayload,
  type AdminResource,
} from "@/lib/supabase-cms";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type Section =
  | "dashboard"
  | "articles"
  | "media"
  | "categories"
  | "menus"
  | "breaking"
  | "regions"
  | "admins"
  | "authors"
  | "pages"
  | "homepage"
  | "comments"
  | "newsletter"
  | "seo"
  | "settings";

const sections: { id: Section; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "articles", label: "Articles" },
  { id: "media", label: "Media" },
  { id: "categories", label: "Categories" },
  { id: "menus", label: "Menus" },
  { id: "breaking", label: "Breaking News" },
  { id: "regions", label: "Morocco Regions" },
  { id: "admins", label: "Admins" },
  { id: "authors", label: "Authors" },
  { id: "pages", label: "Pages" },
  { id: "homepage", label: "Homepage" },
  { id: "comments", label: "Comments" },
  { id: "newsletter", label: "Newsletter" },
  { id: "seo", label: "SEO" },
  { id: "settings", label: "Settings" },
];

const defaultArticleAuthor = "Afakpress";
const maxFeaturedImageSize = 2 * 1024 * 1024;

const emptyArticle: CmsArticle = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  body: [],
  featuredImage: "",
  image: "",
  gallery: "",
  videoUrl: "",
  authorId: "",
  author: defaultArticleAuthor,
  categoryId: "",
  category: "",
  geographicScope: "National",
  regionId: "",
  region: "",
  provinceId: "",
  province: "",
  communeId: "",
  commune: "",
  tags: "",
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  status: "Published",
  publishDate: new Date().toISOString().slice(0, 10),
  publishedAt: new Date().toISOString().slice(0, 10),
  readingTime: "3 min",
  featured: false,
  breaking: false,
  mostRead: false,
  homepagePosition: 99,
  relatedArticles: [],
  ownerId: "",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 text-sm font-bold text-slate-700">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </div>
  );
}

type SelectOption = {
  value: string;
  label: string;
};

function SearchableSelect({
  value,
  options,
  onChange,
  placeholder = "Select",
  disabled = false,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, search]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        className={`${inputClass} flex items-center justify-between gap-3 text-left font-black disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
        disabled={disabled}
        onClick={() => {
          setOpen((current) => !current);
          setSearch("");
        }}
        type="button"
      >
        <span dir="auto" className="min-w-0 truncate">{selected?.label ?? placeholder}</span>
        <span className="shrink-0 text-slate-500">v</span>
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border border-slate-300 bg-white shadow-xl">
          <input
            autoFocus
            className="min-h-10 w-full border-b border-slate-200 px-3 text-sm text-slate-950 outline-none focus:bg-slate-50"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            value={search}
          />
          <div className="border-b border-slate-100 px-3 py-2 text-xs font-black uppercase text-slate-500">
            {filteredOptions.length} options
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            <button
              className={`block w-full px-3 py-2 text-left text-sm font-black ${value ? "text-slate-700 hover:bg-slate-100" : "bg-red-50 text-red-800"}`}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              type="button"
            >
              {placeholder}
            </button>
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                className={`block w-full px-3 py-2 text-left text-sm font-black hover:bg-slate-100 ${option.value === value ? "bg-red-700 text-white hover:bg-red-700" : "text-slate-800"}`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                type="button"
              >
                <span dir="auto" className="block truncate">{option.label}</span>
              </button>
            ))}
            {filteredOptions.length === 0 ? <div className="px-3 py-3 text-sm font-bold text-slate-500">No results</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const inputClass = "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-red-700 focus:ring-4 focus:ring-red-100";
const buttonClass = "inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-black text-slate-900 transition hover:border-red-700 hover:text-red-700";
const primaryButtonClass = "inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400";
const statusOptions: ArticleStatus[] = [...articleStatusValues];

function sameLocation(left: { name: string; slug: string }, right: { name: string; slug: string }) {
  return normalizedLocation(left.slug) === normalizedLocation(right.slug) || normalizedLocation(left.name) === normalizedLocation(right.name);
}

function normalizedLocation(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "")
    .toLowerCase();
}

function sharedProvinceCount(left: CmsRegion, right: CmsRegion) {
  const rightProvinces = new Set(right.provinces.flatMap((province) => [normalizedLocation(province.name), normalizedLocation(province.slug)]));
  return left.provinces.filter((province) => rightProvinces.has(normalizedLocation(province.name)) || rightProvinces.has(normalizedLocation(province.slug))).length;
}

function mergeProvinceCommunes(source: CmsProvince, fallback?: CmsProvince): CmsProvince {
  if (!fallback) return source;
  const communesBySlug = new Map(source.communes.map((commune) => [commune.slug, commune]));
  const missingCommunes = fallback.communes
    .filter((commune) => !communesBySlug.has(commune.slug))
    .map((commune) => ({ ...commune, id: stableUuid(`commune-${source.id}-${commune.slug}`) }));
  return { ...source, communes: [...source.communes, ...missingCommunes] };
}

function completeRegionHierarchy(region?: CmsRegion) {
  if (!region) return undefined;
  const fallbackRegion = initialCmsState.regions.find((item) => sameLocation(item, region)) ?? initialCmsState.regions.find((item) => sharedProvinceCount(region, item) > 0);
  if (!fallbackRegion) return region;

  const mergedProvinces = region.provinces.map((province) => mergeProvinceCommunes(province, fallbackRegion.provinces.find((item) => sameLocation(item, province))));
  const provinceSlugs = new Set(mergedProvinces.map((province) => province.slug));
  const missingProvinces = fallbackRegion.provinces
    .filter((province) => !provinceSlugs.has(province.slug))
    .map((province) => {
      const provinceId = stableUuid(`province-${region.id}-${province.slug}`);
      return {
        ...province,
        id: provinceId,
        communes: province.communes.map((commune) => ({ ...commune, id: stableUuid(`commune-${provinceId}-${commune.slug}`) })),
      };
    });

  return { ...region, provinces: [...mergedProvinces, ...missingProvinces] };
}

function completeRegions(regions: CmsRegion[]) {
  return regions.map((region) => completeRegionHierarchy(region) ?? region);
}

async function adminRequest(resource: AdminResource, method: "POST" | "PATCH" | "DELETE", headers: HeadersInit, body?: unknown, id?: string) {
  const url = id ? `/api/admin/${resource}?id=${encodeURIComponent(id)}` : `/api/admin/${resource}`;
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Supabase request failed.");
  }
  return payload.data;
}

export function AdminCMS({ adminSession }: { adminSession: AdminSession }) {
  const router = useRouter();
  const { state, setState, setCurrentUser, notice, notify, resetDemo, adminHeaders, refreshFromSupabase, isLoading, error } = useCms();
  const currentUser: CmsUser = useMemo(() => ({
    id: adminSession.userId,
    name: adminSession.email,
    email: adminSession.email,
    role: cmsRoleFromAdmin(adminSession.role),
    position: adminSession.role.replace("_", " "),
    bio: "",
    avatar: "",
    socialLinks: "",
  }), [adminSession]);
  const [active, setActive] = useState<Section>("dashboard");
  const [query, setQuery] = useState("");
  const [articleDraft, setArticleDraft] = useState<CmsArticle>({ ...emptyArticle });
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [isSavingArticle, setIsSavingArticle] = useState(false);
  const isSavingArticleRef = useRef(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapAttempted, setBootstrapAttempted] = useState(false);

  useEffect(() => {
    setCurrentUser(currentUser);
    return () => setCurrentUser(null);
  }, [currentUser, setCurrentUser]);

  useEffect(() => {
    if (isBootstrapping || bootstrapAttempted) return;

    const bootstrap = async () => {
      setIsBootstrapping(true);
      setBootstrapAttempted(true);
      try {
        const response = await fetch("/api/admin/bootstrap", { method: "POST" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "CMS reference data setup failed.");
        await refreshFromSupabase();
      } catch (error) {
        notify("error", error instanceof Error ? error.message : "CMS reference data setup failed.");
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, [bootstrapAttempted, isBootstrapping, notify, refreshFromSupabase]);

  const hasSectionAccess = (area: string) => {
    if (area === "admins") return canManageAdmins(adminSession.role);
    return rolePermissions[currentUser.role].includes(area);
  };
  const visibleSections = sections.filter((section) => hasSectionAccess(section.id));
  const published = getPublishedArticles(state);
  const stats = useMemo(() => {
    const provinces = state.regions.reduce((sum, region) => sum + region.provinces.length, 0);
    const communes = state.regions.reduce((sum, region) => sum + region.provinces.reduce((inner, province) => inner + province.communes.length, 0), 0);
    return [
      ["Total Articles", state.articles.length],
      ["Published Articles", state.articles.filter((article) => article.status === "Published").length],
      ["Draft Articles", state.articles.filter((article) => article.status === "Draft").length],
      ["Scheduled Articles", state.articles.filter((article) => article.status === "Scheduled").length],
      ["Categories", state.categories.length],
      ["Regions", state.regions.length],
      ["Provinces", provinces],
      ["Communes", communes],
      ["Authors", state.users.length],
      ["Media Files", state.media.length],
      ["Comments", state.comments.length],
      ["Visitors", "12.4k"],
      ["Breaking News", state.articles.filter((article) => article.breaking).length],
      ["Featured Articles", state.articles.filter((article) => article.featured).length],
    ];
  }, [state]);

  const logout = async () => {
    await fetch("/api/auth/admin-session", { method: "DELETE" });
    setCurrentUser(null);
    router.replace("/admin/login");
    router.refresh();
  };

  const saveArticle = async () => {
    if (isSavingArticleRef.current) return;

    const completedState = { ...state, regions: completeRegions(state.regions) };
    const validationError = validateArticleDraft(articleDraft, completedState);
    if (validationError) {
      notify("error", validationError);
      return;
    }

    const category = state.categories.find((item) => item.id === articleDraft.categoryId);
    const region = completedState.regions.find((item) => item.id === articleDraft.regionId);
    const province = region?.provinces.find((item) => item.id === articleDraft.provinceId);
    const commune = province?.communes.find((item) => item.id === articleDraft.communeId);
    const author = state.users.find((item) => item.id === articleDraft.authorId);
    const slug = articleDraft.slug || slugify(articleDraft.title);
    const nextArticle: CmsArticle = {
      ...articleDraft,
      id: articleDraft.id || makeId("article"),
      slug,
      content: articleDraft.content,
      body: articleDraft.content.split(/\n{2,}/).filter(Boolean),
      featuredImage: articleDraft.featuredImage || articleDraft.image,
      image: articleDraft.featuredImage || articleDraft.image,
      categoryId: category?.id ?? "",
      category: category?.slug ?? articleDraft.category,
      regionId: region?.id ?? "",
      region: region?.slug ?? articleDraft.region,
      provinceId: province?.id ?? "",
      province: province?.slug ?? articleDraft.province,
      communeId: commune?.id ?? "",
      commune: commune?.slug ?? articleDraft.commune,
      authorId: author?.id ?? "",
      author: (author?.name ?? articleDraft.author) || defaultArticleAuthor,
      ownerId: articleDraft.ownerId || currentUser.id,
      publishedAt: articleDraft.publishDate,
      canonicalUrl: articleDraft.canonicalUrl || `/article/${slug}`,
    };
    isSavingArticleRef.current = true;
    setIsSavingArticle(true);
    try {
      const payload = {
        ...articlePayload(nextArticle),
        __location: {
          region: region ? { id: region.id, name: region.name, slug: region.slug } : null,
          province: province ? { id: province.id, name: province.name, slug: province.slug } : null,
          commune: commune ? { id: commune.id, name: commune.name, slug: commune.slug } : null,
        },
      };
      console.info("[AdminCMS] article payload before save", {
        category_id: payload.category_id,
        region_id: payload.region_id,
        province_id: payload.province_id,
        commune_id: payload.commune_id,
        author_id: payload.author_id,
      });
      const saved = articleDraft.id
        ? await adminRequest("articles", "PATCH", adminHeaders(), { id: articleDraft.id, ...payload })
        : await adminRequest("articles", "POST", adminHeaders(), payload);
      const savedArticle = {
        ...nextArticle,
        id: typeof saved?.id === "string" ? saved.id : nextArticle.id,
        slug: typeof saved?.slug === "string" ? saved.slug : nextArticle.slug,
      };
      setState((current) => ({
        ...current,
        articles: current.articles.some((article) => article.id === savedArticle.id) ? current.articles.map((article) => (article.id === savedArticle.id ? savedArticle : article)) : [savedArticle, ...current.articles],
      }));
      setArticleDraft({ ...emptyArticle });
      notify("success", "Article saved to Supabase.");
      router.refresh();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Article save failed.");
    } finally {
      isSavingArticleRef.current = false;
      setIsSavingArticle(false);
    }
  };

  const bulkUpdate = (key: "status" | "category", value: string) => {
    setState((current) => ({
      ...current,
      articles: current.articles.map((article) => (selectedArticles.includes(article.id) ? { ...article, [key]: value } : article)),
    }));
    notify("success", "Bulk update applied.");
  };

  const bulkDelete = () => {
    setState((current) => ({ ...current, articles: current.articles.filter((article) => !selectedArticles.includes(article.id)) }));
    setSelectedArticles([]);
    notify("warning", "Selected articles deleted.");
  };

  const filteredArticles = state.articles.filter((article) => `${article.title} ${article.category} ${article.status}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen gap-0 lg:grid-cols-[292px_minmax(0,1fr)]">
        <aside className="sticky top-0 z-30 h-screen overflow-y-auto border-r border-slate-800 bg-slate-950 p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-black">Afakpress CMS</p>
              <p className="mt-1 text-xs font-bold uppercase text-slate-400">{currentUser.role}</p>
            </div>
            <button className="text-sm font-bold text-red-300" onClick={() => void logout()} type="button">Logout</button>
          </div>
          <input className="mt-5 min-h-11 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-red-500" placeholder="Search articles, sections" value={query} onChange={(event) => setQuery(event.target.value)} />
          <nav className="mt-5 grid gap-1">
            {visibleSections.map((section) => (
              <button key={section.id} className={`rounded-md px-3 py-3 text-left text-sm font-bold transition ${active === section.id ? "bg-red-700 text-white shadow-lg shadow-red-950/20" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`} onClick={() => setActive(section.id)} type="button">
                {section.label}
              </button>
            ))}
          </nav>
          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs leading-6 text-slate-400">
            <p className="font-black text-white">Permissions</p>
            <p>{adminSession.role}: {rolePermissions[currentUser.role].join(", ")}{canManageAdmins(adminSession.role) ? ", admins" : ""}</p>
          </div>
        </aside>

        <section className="min-w-0 p-4 sm:p-6 lg:p-8">
          {notice ? <Notice type={notice.type} message={notice.message} /> : null}
          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">{active}</p>
              <h1 className="mt-1 text-3xl font-black text-slate-950">{sections.find((section) => section.id === active)?.label}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {isLoading || isBootstrapping ? <span className="inline-flex min-h-10 items-center rounded-md bg-slate-100 px-3 text-sm font-black text-slate-600">Loading Supabase</span> : null}
              {error ? <span className="inline-flex min-h-10 items-center rounded-md bg-amber-50 px-3 text-sm font-black text-amber-800">Supabase error</span> : null}
              <Link className={buttonClass} href="/">View site</Link>
              <button className={buttonClass} onClick={() => void refreshFromSupabase()} type="button">Refresh data</button>
              <button className={buttonClass} onClick={resetDemo} type="button">Reset demo data</button>
            </div>
          </div>

          {active === "dashboard" ? <Dashboard stats={stats} published={published.length} /> : null}
          {active === "articles" ? (
            <ArticlesPanel
              articles={filteredArticles}
              draft={articleDraft}
              setDraft={setArticleDraft}
              selected={selectedArticles}
              setSelected={setSelectedArticles}
              saveArticle={saveArticle}
              bulkDelete={bulkDelete}
              bulkUpdate={bulkUpdate}
              currentUser={currentUser}
              isSavingArticle={isSavingArticle}
            />
          ) : null}
          {active === "media" ? <MediaPanel /> : null}
          {active === "categories" ? <CategoriesPanel /> : null}
          {active === "menus" ? <MenusPanel /> : null}
          {active === "breaking" ? <BreakingNewsPanel /> : null}
          {active === "regions" ? <RegionsPanel /> : null}
          {active === "admins" ? <AdminsPanel currentRole={adminSession.role} /> : null}
          {active === "authors" ? <AuthorsPanel /> : null}
          {active === "pages" ? <PagesPanel /> : null}
          {active === "homepage" ? <HomepagePanel /> : null}
          {active === "comments" ? <CommentsPanel /> : null}
          {active === "newsletter" ? <NewsletterPanel /> : null}
          {active === "seo" ? <SeoPanel /> : null}
          {active === "settings" ? <SettingsPanel /> : null}
        </section>
      </div>
    </div>
  );
}

function Notice({ type, message }: { type: string; message: string }) {
  const color = type === "success" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : type === "error" ? "border-red-500 bg-red-50 text-red-800" : "border-amber-500 bg-amber-50 text-amber-800";
  return <div className={`mb-4 border-l-4 p-3 text-sm font-bold ${color}`}>{message}</div>;
}

function Dashboard({ stats, published }: { stats: (string | number)[][]; published: number }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Publishing health</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">The frontend is connected to the CMS store. Published articles, categories, menus, regions, and homepage settings update immediately in this browser session.</p>
        <div className="mt-5 h-3 overflow-hidden bg-slate-100">
          <div className="h-full bg-red-700" style={{ width: `${Math.min(100, published * 12)}%` }} />
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
        <h2 className="text-xl font-black">Editorial desk</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">Use Articles for publishing, Menus for header structure, Media for assets, and Settings for site identity.</p>
      </div>
      </div>
    </div>
  );
}

function ArticlesPanel({
  articles,
  draft,
  setDraft,
  selected,
  setSelected,
  saveArticle,
  bulkDelete,
  bulkUpdate,
  currentUser,
  isSavingArticle,
}: {
  articles: CmsArticle[];
  draft: CmsArticle;
  setDraft: React.Dispatch<React.SetStateAction<CmsArticle>>;
  selected: string[];
  setSelected: (ids: string[]) => void;
  saveArticle: () => void;
  bulkDelete: () => void;
  bulkUpdate: (key: "status" | "category", value: string) => void;
  currentUser: CmsUser;
  isSavingArticle: boolean;
}) {
  const { state, setState, notify, adminHeaders, refreshFromSupabase } = useCms();
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isUploadingFeaturedImage, setIsUploadingFeaturedImage] = useState(false);
  const [featuredImageError, setFeaturedImageError] = useState("");
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<CmsMedia | null>(null);
  const completedRegions = useMemo(() => completeRegions(state.regions), [state.regions]);
  const authorOptions = useMemo(() => state.users.map((user) => ({ value: user.id, label: user.name || user.email || user.id })), [state.users]);
  const categoryOptions = useMemo(() => state.categories.map((category) => ({ value: category.id, label: category.name || category.slug || category.id })), [state.categories]);
  const regionOptions = useMemo(() => completedRegions.map((region) => ({ value: region.id, label: region.name || region.slug || region.id })), [completedRegions]);
  const selectedRegion = useMemo(() => completedRegions.find((region) => region.id === draft.regionId), [completedRegions, draft.regionId]);
  const selectedProvince = useMemo(() => selectedRegion?.provinces.find((province) => province.id === draft.provinceId), [draft.provinceId, selectedRegion]);
  const provinceOptions = useMemo(
    () => (selectedRegion?.provinces ?? []).map((province) => ({ value: province.id, label: province.name || province.slug || province.id })),
    [selectedRegion],
  );
  const communeOptions = useMemo(
    () => (selectedProvince?.communes ?? []).map((commune) => ({ value: commune.id, label: commune.name || commune.slug || commune.id })),
    [selectedProvince],
  );
  const canEdit = currentUser?.role !== "Journalist" || !draft.ownerId || draft.ownerId === currentUser.id;
  const selectedMedia = state.media.find((media) => media.url === (draft.featuredImage || draft.image));
  const selectedImageName = selectedMedia?.name || (() => {
    try {
      return decodeURIComponent(new URL(draft.featuredImage || draft.image).pathname.split("/").pop() || "Featured image");
    } catch {
      return "Featured image";
    }
  })();

  useEffect(() => {
    const provinceBelongsToRegion = Boolean(selectedRegion?.provinces.some((province) => province.id === draft.provinceId));
    const communeBelongsToProvince = Boolean(selectedProvince?.communes.some((commune) => commune.id === draft.communeId));

    if (draft.provinceId && !provinceBelongsToRegion) {
      setDraft({ ...draft, provinceId: "", province: "", communeId: "", commune: "" });
      return;
    }

    if (draft.communeId && !communeBelongsToProvince) {
      setDraft({ ...draft, communeId: "", commune: "" });
    }
  }, [draft, selectedProvince, selectedRegion, setDraft]);
  const setFeaturedImageFromFile = async (file: File | null) => {
    if (!file) return;
    setFeaturedImageError("");
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      const message = "Featured image must be a PNG or JPEG file.";
      setFeaturedImageError(message);
      notify("error", message);
      return;
    }
    if (file.size > maxFeaturedImageSize) {
      const message = "Featured image must be 2MB or smaller.";
      setFeaturedImageError(message);
      notify("error", message);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingFeaturedImage(true);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Featured image upload failed.");
      if (typeof payload.url !== "string" || !/^https?:\/\//i.test(payload.url)) throw new Error("Upload did not return a persistent image URL.");
      setDraft((current) => ({ ...current, featuredImage: payload.url, image: payload.url }));
      if (payload.media?.id) {
        setState((current) => ({
          ...current,
          media: current.media.some((media) => media.id === payload.media.id) ? current.media : [payload.media as CmsMedia, ...current.media],
        }));
      }
      notify("success", "Featured image uploaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Featured image upload failed.";
      setFeaturedImageError(message);
      notify("error", message);
    } finally {
      setIsUploadingFeaturedImage(false);
    }
  };

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_520px]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black text-slate-950">Article desk</h2>
          <div className="flex flex-wrap gap-2">
          <select className={inputClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select className={inputClass} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">All categories</option>
            {state.categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
          </select>
          <button className={buttonClass} onClick={() => bulkUpdate("status", "Published")} type="button">Publish selected</button>
          <button className={buttonClass} onClick={() => bulkUpdate("status", "Draft")} type="button">Draft selected</button>
          <button className={buttonClass} onClick={() => bulkUpdate("category", state.categories[0]?.slug ?? "")} type="button">Bulk category</button>
          <button className={buttonClass} onClick={bulkDelete} type="button">Bulk delete</button>
          </div>
        </div>
        <div className="overflow-x-auto">
        <div className="min-w-[920px] divide-y divide-slate-200">
          <div className="grid grid-cols-[40px_minmax(320px,1fr)_150px_150px_150px_220px] gap-3 border-y border-slate-200 bg-slate-50 px-3 py-3 text-xs font-black uppercase text-slate-500">
            <span />
            <span>Title</span>
            <span>Status</span>
            <span>Category</span>
            <span>Date</span>
            <span>Actions</span>
          </div>
          {articles.filter((article) => (!statusFilter || article.status === statusFilter) && (!categoryFilter || article.category === categoryFilter)).map((article) => (
            <div key={article.id} className="grid grid-cols-[40px_minmax(320px,1fr)_150px_150px_150px_220px] gap-3 px-3 py-4 items-center">
              <input checked={selected.includes(article.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, article.id] : selected.filter((id) => id !== article.id))} type="checkbox" />
              <div>
                <Link href={`/article/${encodeURIComponent(article.slug)}`} className="font-black text-slate-950 hover:text-red-700">{article.title}</Link>
                <p className="mt-1 text-xs font-bold text-slate-500">{article.excerpt}</p>
              </div>
              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{article.status}</span>
              <span className="text-sm font-bold">{article.category}</span>
              <span className="text-sm font-bold text-slate-500">{article.publishDate}</span>
              <div className="flex flex-wrap gap-2">
                <button className={buttonClass} onClick={() => setDraft(article)} type="button">Edit</button>
                <button className={buttonClass} onClick={() => setDraft({ ...article, id: "", title: `${article.title} Copy`, slug: `${article.slug}-copy`, status: "Draft" })} type="button">Duplicate</button>
                <button className={buttonClass} onClick={async () => {
                  try {
                    await adminRequest("articles", "DELETE", adminHeaders(), undefined, article.id);
                    setState((current) => ({ ...current, articles: current.articles.filter((item) => item.id !== article.id) }));
                    await refreshFromSupabase();
                    notify("warning", "Article deleted from Supabase.");
                  } catch (error) {
                    notify("error", error instanceof Error ? error.message : "Article delete failed.");
                  }
                }} type="button">Delete</button>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Article editor</h2>
        <div className="mt-5 grid gap-4">
          <Field label="Title"><input className={inputClass} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value, slug: draft.id ? draft.slug : slugify(event.target.value), seoTitle: event.target.value })} /></Field>
          <Field label="Slug"><input className={inputClass} value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} /></Field>
          <Field label="Excerpt"><textarea className={`${inputClass} min-h-20 py-3`} value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value, seoDescription: event.target.value })} /></Field>
          <Field label="Full Content">
            <RichTextEditor value={draft.content} onChange={(content) => setDraft({ ...draft, content })} />
          </Field>
          <Field label="Featured Image">
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                <button className={buttonClass} onClick={() => {
                  setPendingMedia(selectedMedia ?? null);
                  setIsMediaPickerOpen(true);
                }} type="button">{draft.featuredImage ? "Replace from media library" : "Select from media library"}</button>
                <label className={`${buttonClass} cursor-pointer`}>
                  {isUploadingFeaturedImage ? "Uploading..." : "Upload PNG/JPEG"}
                  <input className="sr-only" accept="image/png,image/jpeg" disabled={isUploadingFeaturedImage} onChange={(event) => {
                    void setFeaturedImageFromFile(event.target.files?.[0] ?? null);
                    event.target.value = "";
                  }} type="file" />
                </label>
              </div>
              {draft.featuredImage ? (
                <div className="grid gap-3 rounded-lg border-2 border-emerald-500 bg-emerald-50 p-3" data-testid="selected-featured-image">
                  <div className="relative h-40 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="Selected featured image" className="h-full w-full object-cover" src={draft.featuredImage} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-800">Selected</p>
                    <p className="mt-1 break-all text-sm font-bold text-slate-800">{selectedImageName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className={buttonClass} onClick={() => {
                      setPendingMedia(selectedMedia ?? null);
                      setIsMediaPickerOpen(true);
                    }} type="button">Replace image</button>
                    <button className={buttonClass} onClick={() => {
                      setDraft((current) => ({ ...current, featuredImage: "", image: "" }));
                      setFeaturedImageError("");
                    }} type="button">Remove image</button>
                  </div>
                </div>
              ) : null}
              {isUploadingFeaturedImage ? <p aria-live="polite" className="text-sm font-bold text-slate-600">Uploading image and saving it to the media library…</p> : null}
              {featuredImageError ? <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{featuredImageError}</p> : null}
            </div>
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Author"><SearchableSelect value={draft.authorId} onChange={(authorId) => setDraft({ ...draft, authorId, author: authorId ? draft.author : defaultArticleAuthor })} options={authorOptions} placeholder={defaultArticleAuthor} /></Field>
            <Field label="Category"><SearchableSelect value={draft.categoryId} onChange={(categoryId) => setDraft({ ...draft, categoryId })} options={categoryOptions} /></Field>
            <Field label="Geographic scope">
              <select
                className={inputClass}
                value={draft.geographicScope ?? "National"}
                onChange={(event) => {
                  const geographicScope = event.target.value as CmsArticle["geographicScope"];
                  setDraft({
                    ...draft,
                    geographicScope,
                    regionId: geographicScope === "National" ? "" : draft.regionId,
                    region: geographicScope === "National" ? "" : draft.region,
                    provinceId: geographicScope === "Province" || geographicScope === "Commune" ? draft.provinceId : "",
                    province: geographicScope === "Province" || geographicScope === "Commune" ? draft.province : "",
                    communeId: geographicScope === "Commune" ? draft.communeId : "",
                    commune: geographicScope === "Commune" ? draft.commune : "",
                  });
                }}
              >
                <option>National</option>
                <option>Region</option>
                <option>Province</option>
                <option>Commune</option>
              </select>
            </Field>
            <Field label="Region"><SearchableSelect value={draft.regionId} onChange={(regionId) => setDraft({ ...draft, regionId, region: completedRegions.find((item) => item.id === regionId)?.slug ?? "", provinceId: "", province: "", communeId: "", commune: "" })} options={regionOptions} disabled={(draft.geographicScope ?? "National") === "National"} placeholder={(draft.geographicScope ?? "National") === "National" ? "Not applicable" : "Select"} /></Field>
            <Field label="Province / Prefecture">
              <SearchableSelect
                value={draft.provinceId}
                onChange={(provinceId) => {
                  const province = selectedRegion?.provinces.find((item) => item.id === provinceId);
                  setDraft({ ...draft, provinceId: province?.id ?? "", province: province?.slug ?? "", communeId: "", commune: "" });
                }}
                options={provinceOptions}
                disabled={!draft.regionId || draft.geographicScope === "National" || draft.geographicScope === "Region"}
                placeholder={draft.regionId ? "Select" : "Select region first"}
              />
            </Field>
            <Field label="Commune">
              <SearchableSelect
                value={draft.communeId}
                onChange={(communeId) => {
                  const commune = selectedProvince?.communes.find((item) => item.id === communeId);
                  setDraft({ ...draft, communeId: commune?.id ?? "", commune: commune?.slug ?? "" });
                }}
                options={communeOptions}
                disabled={!draft.provinceId || draft.geographicScope !== "Commune"}
                placeholder={draft.provinceId ? "Select" : "Select province first"}
              />
            </Field>
            <Field label="Status"><select className={inputClass} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ArticleStatus })}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></Field>
            <Field label="Publish Date"><input className={inputClass} value={draft.publishDate} onChange={(event) => setDraft({ ...draft, publishDate: event.target.value })} type="date" /></Field>
            <Field label="Homepage Position"><input className={inputClass} value={draft.homepagePosition} onChange={(event) => setDraft({ ...draft, homepagePosition: Number(event.target.value) })} type="number" /></Field>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex gap-2 text-sm font-bold"><input checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} type="checkbox" /> Featured</label>
            <label className="flex gap-2 text-sm font-bold"><input checked={draft.breaking} onChange={(event) => setDraft({ ...draft, breaking: event.target.checked })} type="checkbox" /> Breaking News</label>
            <label className="flex gap-2 text-sm font-bold"><input checked={draft.mostRead} onChange={(event) => setDraft({ ...draft, mostRead: event.target.checked })} type="checkbox" /> Most Read</label>
          </div>
          <Field label="Gallery URLs"><input className={inputClass} value={draft.gallery} onChange={(event) => setDraft({ ...draft, gallery: event.target.value })} /></Field>
          <Field label="Video URL"><input className={inputClass} value={draft.videoUrl} onChange={(event) => setDraft({ ...draft, videoUrl: event.target.value })} /></Field>
          <Field label="Tags"><input className={inputClass} value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} /></Field>
          <Field label="SEO Title"><input className={inputClass} value={draft.seoTitle} onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })} /></Field>
          <Field label="SEO Description"><textarea className={`${inputClass} min-h-20 py-3`} value={draft.seoDescription} onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })} /></Field>
          <Field label="Canonical URL"><input className={inputClass} value={draft.canonicalUrl} onChange={(event) => setDraft({ ...draft, canonicalUrl: event.target.value })} /></Field>
          <button className={primaryButtonClass} disabled={!canEdit || isUploadingFeaturedImage || isSavingArticle} onClick={saveArticle} type="button">{isUploadingFeaturedImage ? "Uploading image..." : isSavingArticle ? "Saving article..." : canEdit ? "Save article" : "Journalists can edit only their own articles"}</button>
        </div>
      </div>
      {isMediaPickerOpen ? (
        <div aria-label="Select featured image" aria-modal="true" className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-4" role="dialog">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-black text-slate-950">Media library</h2>
                <p className="mt-1 text-sm text-slate-600">Choose an image, then confirm your selection.</p>
              </div>
              <button className={buttonClass} onClick={() => setIsMediaPickerOpen(false)} type="button">Close</button>
            </div>
            <div className="grid max-h-[65vh] grid-cols-2 gap-4 overflow-y-auto p-5 sm:grid-cols-3 lg:grid-cols-4">
              {state.media.filter((media) => media.type === "Image" && /^https?:\/\//i.test(media.url)).map((media) => (
                <button
                  aria-pressed={pendingMedia?.id === media.id}
                  className={`overflow-hidden rounded-lg border-2 text-left transition ${pendingMedia?.id === media.id ? "border-red-700 ring-4 ring-red-100" : "border-slate-200 hover:border-slate-400"}`}
                  key={media.id}
                  onDoubleClick={() => {
                    setDraft((current) => ({ ...current, featuredImage: media.url, image: media.url }));
                    setFeaturedImageError("");
                    setIsMediaPickerOpen(false);
                  }}
                  onClick={() => setPendingMedia(media)}
                  type="button"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={media.alt || media.name} className="h-32 w-full bg-slate-100 object-cover" src={media.url} />
                  <span className="block truncate p-3 text-sm font-black text-slate-800">{media.name}</span>
                  {pendingMedia?.id === media.id ? <span className="block bg-red-700 px-3 py-2 text-xs font-black uppercase text-white">Selected</span> : null}
                </button>
              ))}
              {state.media.filter((media) => media.type === "Image" && /^https?:\/\//i.test(media.url)).length === 0 ? (
                <p className="col-span-full rounded-md border border-slate-200 bg-slate-50 p-6 text-sm font-bold text-slate-600">No persistent images are available. Upload an image from the article form first.</p>
              ) : null}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
              <button className={buttonClass} onClick={() => setIsMediaPickerOpen(false)} type="button">Cancel</button>
              <button className={primaryButtonClass} disabled={!pendingMedia} onClick={() => {
                if (!pendingMedia) return;
                setDraft((current) => ({ ...current, featuredImage: pendingMedia.url, image: pendingMedia.url }));
                setFeaturedImageError("");
                setIsMediaPickerOpen(false);
              }} type="button">Use this image</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MediaPanel() {
  const { state, setState, notify, adminHeaders, refreshFromSupabase } = useCms();
  const [draft, setDraft] = useState<CmsMedia>({ id: "", name: "", url: "", type: "Image", folder: "Newsroom", alt: "", caption: "", copyright: "", optimized: true });
  const save = async () => {
    const item = { ...draft, id: draft.id || makeId("media") };
    try {
      const payload = mediaPayload(item);
      if (draft.id) {
        await adminRequest("media", "PATCH", adminHeaders(), { id: draft.id, ...payload });
      } else {
        await adminRequest("media", "POST", adminHeaders(), payload);
      }
      setState((current) => ({ ...current, media: current.media.some((media) => media.id === item.id) ? current.media.map((media) => media.id === item.id ? item : media) : [item, ...current.media] }));
      await refreshFromSupabase();
      setDraft({ id: "", name: "", url: "", type: "Image", folder: "Newsroom", alt: "", caption: "", copyright: "", optimized: true });
      notify("success", "Media saved to Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Media save failed.");
    }
  };
  return <CrudShell title="Media Library" aside={<MediaForm draft={draft} setDraft={setDraft} save={save} />}>{state.media.map((media) => <Row key={media.id} title={media.name} meta={`${media.type} / ${media.folder}`} actions={<><button className={buttonClass} onClick={() => setDraft(media)} type="button">Edit</button><button className={buttonClass} onClick={async () => { try { await adminRequest("media", "DELETE", adminHeaders(), undefined, media.id); setState((current) => ({ ...current, media: current.media.filter((item) => item.id !== media.id) })); await refreshFromSupabase(); notify("warning", "Media deleted from Supabase."); } catch (error) { notify("error", error instanceof Error ? error.message : "Media delete failed."); } }} type="button">Delete</button></>} />)}</CrudShell>;
}

function MediaForm({ draft, setDraft, save }: { draft: CmsMedia; setDraft: (media: CmsMedia) => void; save: () => void }) {
  return <div className="grid gap-4"><Field label="File URL or upload placeholder"><input className={inputClass} value={draft.url} onChange={(event) => setDraft({ ...draft, url: event.target.value })} /></Field><Field label="Name"><input className={inputClass} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="Type"><select className={inputClass} value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as CmsMedia["type"] })}><option>Image</option><option>Video</option><option>PDF</option></select></Field><Field label="Folder"><input className={inputClass} value={draft.folder} onChange={(event) => setDraft({ ...draft, folder: event.target.value })} /></Field><Field label="Alt text"><input className={inputClass} value={draft.alt} onChange={(event) => setDraft({ ...draft, alt: event.target.value })} /></Field><Field label="Caption"><input className={inputClass} value={draft.caption} onChange={(event) => setDraft({ ...draft, caption: event.target.value })} /></Field><Field label="Copyright"><input className={inputClass} value={draft.copyright} onChange={(event) => setDraft({ ...draft, copyright: event.target.value })} /></Field><label className="flex gap-2 text-sm font-bold"><input checked={draft.optimized} onChange={(event) => setDraft({ ...draft, optimized: event.target.checked })} type="checkbox" /> Image optimized/compressed</label><div className="border border-dashed border-slate-300 p-6 text-center text-sm font-bold text-slate-500">Drag & drop upload area, cropping, compression, and optimization metadata</div><button className={primaryButtonClass} onClick={save} type="button">Save media</button></div>;
}

function CategoriesPanel() {
  const { state, setState, notify, adminHeaders, refreshFromSupabase } = useCms();
  const [draft, setDraft] = useState<CmsCategory>({ id: "", name: "", slug: "", parentId: "", color: "#b91c1c", icon: "", description: "", seoTitle: "", seoDescription: "" });
  const save = async () => {
    const item = { ...draft, id: draft.id || makeId("cat"), slug: draft.slug || slugify(draft.name) };
    try {
      const payload = categoryPayload(item);
      if (draft.id) {
        await adminRequest("categories", "PATCH", adminHeaders(), { id: draft.id, ...payload });
      } else {
        await adminRequest("categories", "POST", adminHeaders(), payload);
      }
      setState((current) => ({ ...current, categories: current.categories.some((category) => category.id === item.id) ? current.categories.map((category) => category.id === item.id ? item : category) : [...current.categories, item] }));
      await refreshFromSupabase();
      setDraft({ id: "", name: "", slug: "", parentId: "", color: "#b91c1c", icon: "", description: "", seoTitle: "", seoDescription: "" });
      notify("success", "Category saved to Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Category save failed.");
    }
  };
  return <CrudShell title="Categories" aside={<div className="grid gap-4"><Field label="Name"><input className={inputClass} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value, slug: slugify(event.target.value) })} /></Field><Field label="Parent"><select className={inputClass} value={draft.parentId} onChange={(event) => setDraft({ ...draft, parentId: event.target.value })}><option value="">None</option>{state.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field><Field label="Order Index"><input className={inputClass} defaultValue={0} type="number" /></Field><label className="flex gap-2 text-sm font-bold"><input defaultChecked type="checkbox" /> Active</label><Field label="Description"><textarea className={`${inputClass} min-h-20 py-3`} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field><button className={primaryButtonClass} onClick={save} type="button">Save category</button></div>}>{state.categories.map((category) => <Row key={category.id} title={category.name} meta={category.parentId ? `${category.slug} / child category` : category.slug} actions={<><button className={buttonClass} onClick={() => setDraft(category)} type="button">Edit</button><button className={buttonClass} onClick={async () => { try { await adminRequest("categories", "DELETE", adminHeaders(), undefined, category.id); setState((current) => ({ ...current, categories: current.categories.filter((item) => item.id !== category.id) })); await refreshFromSupabase(); notify("warning", "Category deleted from Supabase."); } catch (error) { notify("error", error instanceof Error ? error.message : "Category delete failed."); } }} type="button">Delete</button></>} />)}</CrudShell>;
}

function MenusPanel() {
  const { state, setState, notify, adminHeaders, refreshFromSupabase } = useCms();
  const [draft, setDraft] = useState<CmsMenuItem>({ id: "", label: "", href: "", type: "Custom", active: true, showInHeader: true, showInFooter: false, children: [] });
  const [parentId, setParentId] = useState("");
  const flattenMenus = (menus: CmsMenuItem[], depth = 0): { item: CmsMenuItem; depth: number }[] => menus.flatMap((item) => [{ item, depth }, ...flattenMenus(item.children, depth + 1)]);
  const updateInTree = (menus: CmsMenuItem[], item: CmsMenuItem): CmsMenuItem[] => menus.map((menu) => menu.id === item.id ? { ...item, children: item.children ?? menu.children } : { ...menu, children: updateInTree(menu.children, item) });
  const deleteInTree = (menus: CmsMenuItem[], id: string): CmsMenuItem[] => menus.filter((menu) => menu.id !== id).map((menu) => ({ ...menu, children: deleteInTree(menu.children, id) }));
  const addToParent = (menus: CmsMenuItem[], item: CmsMenuItem, targetParentId: string): CmsMenuItem[] => {
    if (!targetParentId) return [...menus, item];
    return menus.map((menu) => menu.id === targetParentId ? { ...menu, children: [...menu.children, item] } : { ...menu, children: addToParent(menu.children, item, targetParentId) });
  };
  const moveTopLevel = (index: number, direction: -1 | 1) => setState((current) => {
    const menus = [...current.menus];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= menus.length) return current;
    [menus[index], menus[nextIndex]] = [menus[nextIndex], menus[index]];
    return { ...current, menus };
  });
  const save = async () => {
    const item = { ...draft, id: draft.id || makeId("menu") };
    const parent = parentId ? flattenMenus(state.menus).find((entry) => entry.item.id === parentId) : null;
    const level = parent ? Math.min(2, parent.depth + 1) : 0;
    try {
      const payload = menuPayload(item, parentId, level, state.menus.length);
      if (draft.id) {
        await adminRequest("menus", "PATCH", adminHeaders(), { id: draft.id, ...payload });
      } else {
        await adminRequest("menus", "POST", adminHeaders(), payload);
      }
      setState((current) => {
        const exists = flattenMenus(current.menus).some((entry) => entry.item.id === item.id);
        return { ...current, menus: exists ? updateInTree(current.menus, item) : addToParent(current.menus, item, parentId) };
      });
      await refreshFromSupabase();
      setDraft({ id: "", label: "", href: "", type: "Custom", active: true, showInHeader: true, showInFooter: false, children: [] });
      setParentId("");
      notify("success", "Menu saved to Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Menu save failed.");
    }
  };
  const menuOptions = flattenMenus(state.menus).filter((entry) => entry.depth < 2);
  const editMenu = (menu: CmsMenuItem) => {
    setDraft(menu);
    setParentId("");
  };
  const deleteMenu = async (id: string) => {
    try {
      await adminRequest("menus", "DELETE", adminHeaders(), undefined, id);
      setState((current) => ({ ...current, menus: deleteInTree(current.menus, id) }));
      await refreshFromSupabase();
      notify("warning", "Menu deleted from Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Menu delete failed.");
    }
  };

  return (
    <CrudShell
      title="Menu Builder"
      aside={
        <div className="grid gap-4">
          <Field label="Label"><input className={inputClass} value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} /></Field>
          <Field label="Href"><input className={inputClass} value={draft.href} onChange={(event) => setDraft({ ...draft, href: event.target.value })} /></Field>
          <Field label="Parent menu"><select className={inputClass} value={parentId} onChange={(event) => setParentId(event.target.value)} disabled={Boolean(draft.id)}><option value="">Main menu</option>{menuOptions.map(({ item, depth }) => <option key={item.id} value={item.id}>{`${" - ".repeat(depth)}${item.label}`}</option>)}</select></Field>
          <Field label="Type"><select className={inputClass} value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as CmsMenuItem["type"] })}><option>Custom</option><option>Page</option><option>Category</option><option>Region</option><option>Province</option><option>Commune</option></select></Field>
          <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700">
            <label className="flex items-center gap-2"><input checked={draft.active !== false} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} type="checkbox" /> Active</label>
            <label className="flex items-center gap-2"><input checked={draft.showInHeader !== false} onChange={(event) => setDraft({ ...draft, showInHeader: event.target.checked })} type="checkbox" /> Show in header</label>
            <label className="flex items-center gap-2"><input checked={draft.showInFooter === true} onChange={(event) => setDraft({ ...draft, showInFooter: event.target.checked })} type="checkbox" /> Show in footer</label>
          </div>
          <p className="text-sm leading-6 text-slate-600">Use Parent menu to create submenu and submenu level 2 items. Top-level ordering uses the Up and Down controls in the tree.</p>
          <button className={primaryButtonClass} onClick={save} type="button">Save menu</button>
        </div>
      }
    >
      <div className="space-y-3">
        {state.menus.map((menu, index) => (
          <MenuTreeRow
            key={menu.id}
            menu={menu}
            depth={0}
            actions={
              <>
                <button className={buttonClass} onClick={() => moveTopLevel(index, -1)} type="button">Up</button>
                <button className={buttonClass} onClick={() => moveTopLevel(index, 1)} type="button">Down</button>
                <button className={buttonClass} onClick={() => editMenu(menu)} type="button">Edit</button>
                <button className={buttonClass} onClick={() => void deleteMenu(menu.id)} type="button">Delete</button>
              </>
            }
            editMenu={editMenu}
            deleteMenu={deleteMenu}
          />
        ))}
      </div>
    </CrudShell>
  );
}

function MenuTreeRow({ menu, depth, actions, editMenu, deleteMenu }: { menu: CmsMenuItem; depth: number; actions?: React.ReactNode; editMenu: (menu: CmsMenuItem) => void; deleteMenu: (id: string) => void | Promise<void> }) {
  return (
    <div>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center" style={{ marginLeft: depth ? depth * 20 : 0 }}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black uppercase text-slate-600">{depth === 0 ? "Main menu" : depth === 1 ? "Submenu" : "Level 2"}</span>
            <p className="font-black text-slate-950">{menu.label}</p>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-500">{menu.type} / {menu.href} / {menu.children.length} children</p>
        </div>
        <div className="flex flex-wrap gap-2">{actions ?? <><button className={buttonClass} onClick={() => editMenu(menu)} type="button">Edit</button><button className={buttonClass} onClick={() => void deleteMenu(menu.id)} type="button">Delete</button></>}</div>
      </div>
      {menu.children.length > 0 ? <div className="mt-3 space-y-3">{menu.children.map((child) => <MenuTreeRow key={child.id} menu={child} depth={depth + 1} editMenu={editMenu} deleteMenu={deleteMenu} />)}</div> : null}
    </div>
  );
}

function BreakingNewsPanel() {
  const { state, setState, notify, adminHeaders, refreshFromSupabase } = useCms();
  const [draft, setDraft] = useState({ id: "", title: "", articleId: "", url: "", isActive: true, orderIndex: 0 });
  const save = async () => {
    try {
      const payload = breakingPayload(draft);
      if (draft.id) {
        await adminRequest("breaking_news", "PATCH", adminHeaders(), { id: draft.id, ...payload });
      } else {
        await adminRequest("breaking_news", "POST", adminHeaders(), payload);
      }
      setState((current) => ({
        ...current,
        breakingNews: current.breakingNews.some((item) => item.id === draft.id) ? current.breakingNews.map((item) => item.id === draft.id ? draft : item) : [{ ...draft, id: draft.id || makeId("breaking") }, ...current.breakingNews],
      }));
      await refreshFromSupabase();
      setDraft({ id: "", title: "", articleId: "", url: "", isActive: true, orderIndex: 0 });
      notify("success", "Breaking news saved to Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Breaking news save failed.");
    }
  };

  return (
    <CrudShell
      title="Breaking News"
      aside={<div className="grid gap-4"><Field label="Title"><input className={inputClass} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></Field><Field label="Linked Article"><select className={inputClass} value={draft.articleId} onChange={(event) => setDraft({ ...draft, articleId: event.target.value })}><option value="">None</option>{state.articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}</select></Field><Field label="External URL"><input className={inputClass} value={draft.url} onChange={(event) => setDraft({ ...draft, url: event.target.value })} /></Field><Field label="Order Index"><input className={inputClass} value={draft.orderIndex} onChange={(event) => setDraft({ ...draft, orderIndex: Number(event.target.value) })} type="number" /></Field><label className="flex gap-2 text-sm font-bold"><input checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} type="checkbox" /> Active</label><button className={primaryButtonClass} onClick={save} type="button">Save breaking news</button></div>}
    >
      {state.breakingNews.map((item) => <Row key={item.id} title={item.title} meta={`${item.isActive ? "Active" : "Inactive"} / order ${item.orderIndex}`} actions={<><button className={buttonClass} onClick={() => setDraft(item)} type="button">Edit</button><button className={buttonClass} onClick={async () => { try { await adminRequest("breaking_news", "DELETE", adminHeaders(), undefined, item.id); setState((current) => ({ ...current, breakingNews: current.breakingNews.filter((entry) => entry.id !== item.id) })); await refreshFromSupabase(); notify("warning", "Breaking news deleted from Supabase."); } catch (error) { notify("error", error instanceof Error ? error.message : "Breaking news delete failed."); } }} type="button">Delete</button></>} />)}
    </CrudShell>
  );
}

function RegionsPanel() {
  const { state, setState, notify, adminHeaders, refreshFromSupabase } = useCms();
  const [activeRegionId, setActiveRegionId] = useState(state.regions[0]?.id ?? "");
  const [activeProvinceId, setActiveProvinceId] = useState(state.regions[0]?.provinces[0]?.id ?? "");
  const activeRegion = state.regions.find((region) => region.id === activeRegionId) ?? state.regions[0];
  const activeProvince = activeRegion?.provinces.find((province) => province.id === activeProvinceId) ?? activeRegion?.provinces[0];
  const totals = state.regions.reduce(
    (summary, region) => ({
      provinces: summary.provinces + region.provinces.length,
      communes: summary.communes + region.provinces.reduce((sum, province) => sum + province.communes.length, 0),
    }),
    { provinces: 0, communes: 0 },
  );

  const updateRegion = (region: CmsRegion) => setState((current) => ({ ...current, regions: current.regions.map((item) => item.id === region.id ? region : item) }));
  const updateProvince = (region: CmsRegion, province: CmsProvince) => updateRegion({ ...region, provinces: region.provinces.map((item) => item.id === province.id ? province : item) });
  const updateCommune = (region: CmsRegion, province: CmsProvince, commune: CmsCommune) => updateProvince(region, { ...province, communes: province.communes.map((item) => item.id === commune.id ? commune : item) });
  const saveRegion = async (region: CmsRegion) => {
    try {
      await adminRequest("regions", "PATCH", adminHeaders(), { id: region.id, ...regionPayload(region) });
      await refreshFromSupabase();
      notify("success", "Region saved to Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Region save failed.");
    }
  };
  const deleteRegion = async (region: CmsRegion) => {
    try {
      await adminRequest("regions", "DELETE", adminHeaders(), undefined, region.id);
      setState((current) => ({ ...current, regions: current.regions.filter((item) => item.id !== region.id) }));
      setActiveRegionId(state.regions.find((item) => item.id !== region.id)?.id ?? "");
      setActiveProvinceId("");
      await refreshFromSupabase();
      notify("warning", "Region deleted from Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Region delete failed.");
    }
  };
  const saveProvince = async (region: CmsRegion, province: CmsProvince) => {
    try {
      await adminRequest("provinces", "PATCH", adminHeaders(), { id: province.id, ...provincePayload(province, region.id) });
      await refreshFromSupabase();
      notify("success", "Province saved to Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Province save failed.");
    }
  };
  const deleteProvince = async (region: CmsRegion, province: CmsProvince) => {
    try {
      await adminRequest("provinces", "DELETE", adminHeaders(), undefined, province.id);
      updateRegion({ ...region, provinces: region.provinces.filter((item) => item.id !== province.id) });
      setActiveProvinceId(region.provinces.find((item) => item.id !== province.id)?.id ?? "");
      await refreshFromSupabase();
      notify("warning", "Province deleted from Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Province delete failed.");
    }
  };
  const saveCommune = async (province: CmsProvince, commune: CmsCommune) => {
    try {
      await adminRequest("communes", "PATCH", adminHeaders(), { id: commune.id, ...communePayload(commune, province.id) });
      await refreshFromSupabase();
      notify("success", "Commune saved to Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Commune save failed.");
    }
  };
  const deleteCommune = async (region: CmsRegion, province: CmsProvince, commune: CmsCommune) => {
    try {
      await adminRequest("communes", "DELETE", adminHeaders(), undefined, commune.id);
      updateProvince(region, { ...province, communes: province.communes.filter((item) => item.id !== commune.id) });
      await refreshFromSupabase();
      notify("warning", "Commune deleted from Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Commune delete failed.");
    }
  };
  const addRegion = async () => {
    const region = { id: makeId("region"), name: "New Region", slug: "new-region", provinces: [] };
    try {
      await adminRequest("regions", "POST", adminHeaders(), { id: region.id, ...regionPayload(region) });
      setState((current) => ({ ...current, regions: [...current.regions, region] }));
      setActiveRegionId(region.id);
      setActiveProvinceId("");
      await refreshFromSupabase();
      notify("success", "Region added.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Region add failed.");
    }
  };
  const addProvince = async (region: CmsRegion) => {
    const province = { id: makeId("province"), name: "New Province", slug: "new-province", communes: [] };
    try {
      await adminRequest("provinces", "POST", adminHeaders(), { id: province.id, ...provincePayload(province, region.id) });
      updateRegion({ ...region, provinces: [...region.provinces, province] });
      setActiveProvinceId(province.id);
      await refreshFromSupabase();
      notify("success", "Province added.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Province add failed.");
    }
  };
  const addCommune = async (region: CmsRegion, province: CmsProvince) => {
    const commune = { id: makeId("commune"), name: "New Commune", slug: "new-commune" };
    try {
      await adminRequest("communes", "POST", adminHeaders(), { id: commune.id, ...communePayload(commune, province.id) });
      updateProvince(region, { ...province, communes: [...province.communes, commune] });
      await refreshFromSupabase();
      notify("success", "Commune added.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Commune add failed.");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">Region tree</h2>
            <p className="mt-1 text-xs font-bold uppercase text-slate-500">{state.regions.length} regions / {totals.provinces} provinces / {totals.communes} communes</p>
          </div>
          <button className={primaryButtonClass} onClick={() => void addRegion()} type="button">Add</button>
        </div>
        <div className="mt-5 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
          {state.regions.map((region) => (
            <button key={region.id} className={`w-full rounded-md border px-3 py-3 text-left transition ${activeRegion?.id === region.id ? "border-red-300 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-700 hover:border-red-200"}`} onClick={() => { setActiveRegionId(region.id); setActiveProvinceId(region.provinces[0]?.id ?? ""); }} type="button">
              <span dir="auto" className="block text-sm font-black">{region.name}</span>
              <span className="mt-1 block text-xs font-bold text-slate-500">{region.provinces.length} provinces</span>
            </button>
          ))}
        </div>
      </aside>

      {activeRegion ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto_auto]">
            <Field label="Region name"><input dir="auto" className={inputClass} value={activeRegion.name} onChange={(event) => updateRegion({ ...activeRegion, name: event.target.value, slug: slugify(event.target.value) })} /></Field>
            <Field label="Slug"><input className={inputClass} value={activeRegion.slug} onChange={(event) => updateRegion({ ...activeRegion, slug: event.target.value })} /></Field>
            <button className={`${primaryButtonClass} self-end`} onClick={() => void saveRegion(activeRegion)} type="button">Save Region</button>
            <button className={`${buttonClass} self-end`} onClick={() => void addProvince(activeRegion)} type="button">Add Province</button>
            <button className={`${buttonClass} self-end`} onClick={() => void deleteRegion(activeRegion)} type="button">Delete Region</button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-500">Provinces / Prefectures</h3>
              <div className="mt-3 max-h-[58vh] space-y-2 overflow-y-auto pr-1">
                {activeRegion.provinces.map((province) => (
                  <button key={province.id} className={`w-full rounded-md border px-3 py-3 text-left transition ${activeProvince?.id === province.id ? "border-red-300 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-700 hover:border-red-200"}`} onClick={() => setActiveProvinceId(province.id)} type="button">
                    <span dir="auto" className="block text-sm font-black">{province.name}</span>
                    <span className="mt-1 block text-xs font-bold text-slate-500">{province.communes.length} communes</span>
                  </button>
                ))}
              </div>
            </div>

            {activeProvince ? (
              <div className="min-w-0">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto_auto]">
                  <Field label="Province / Prefecture name"><input dir="auto" className={inputClass} value={activeProvince.name} onChange={(event) => updateProvince(activeRegion, { ...activeProvince, name: event.target.value, slug: slugify(event.target.value) })} /></Field>
                  <Field label="Slug"><input className={inputClass} value={activeProvince.slug} onChange={(event) => updateProvince(activeRegion, { ...activeProvince, slug: event.target.value })} /></Field>
                  <button className={`${primaryButtonClass} self-end`} onClick={() => void saveProvince(activeRegion, activeProvince)} type="button">Save Province</button>
                  <button className={`${buttonClass} self-end`} onClick={() => void addCommune(activeRegion, activeProvince)} type="button">Add Commune</button>
                  <button className={`${buttonClass} self-end`} onClick={() => void deleteProvince(activeRegion, activeProvince)} type="button">Delete Province</button>
                </div>
                <div className="mt-5 max-h-[52vh] overflow-y-auto pr-1">
                  <div className="grid gap-2 md:grid-cols-2">
                    {activeProvince.communes.map((commune) => (
                      <div key={commune.id} className="grid gap-2 rounded-md border border-slate-200 p-3">
                        <input dir="auto" className={inputClass} value={commune.name} onChange={(event) => updateCommune(activeRegion, activeProvince, { ...commune, name: event.target.value, slug: slugify(event.target.value) })} />
                        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                          <input className={inputClass} value={commune.slug} onChange={(event) => updateCommune(activeRegion, activeProvince, { ...commune, slug: event.target.value })} />
                          <button className={primaryButtonClass} onClick={() => void saveCommune(activeProvince, commune)} type="button">Save</button>
                          <button className={buttonClass} onClick={() => void deleteCommune(activeRegion, activeProvince, commune)} type="button">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="rounded-md border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-600">Select or add a province to manage communes.</p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function AdminsPanel({ currentRole }: { currentRole: AdminRole }) {
  const { notify } = useCms();
  const [admins, setAdmins] = useState<AdminUserRecord[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("admin");
  const [isLoading, setIsLoading] = useState(false);
  const roles: AdminRole[] = ["super_admin", "admin", "editor", "journalist"];

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin-users", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not load admins.");
      setAdmins(payload.data ?? []);
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not load admins.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (canManageAdmins(currentRole)) void loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRole]);

  const addAdmin = async () => {
    try {
      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not add admin.");
      setEmail("");
      setRole("admin");
      await loadAdmins();
      notify(payload.invited ? "success" : "warning", payload.invited ? "Admin added and invitation sent." : `Admin added. Invite warning: ${payload.inviteError || "Supabase invite was not sent."}`);
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not add admin.");
    }
  };

  const updateAdmin = async (id: string, payload: { role?: AdminRole; status?: string }) => {
    try {
      const response = await fetch("/api/admin-users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update admin.");
      await loadAdmins();
      notify("success", "Admin updated.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not update admin.");
    }
  };

  const deleteAdmin = async (id: string) => {
    try {
      const response = await fetch(`/api/admin-users?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not delete admin.");
      await loadAdmins();
      notify("warning", "Admin deleted.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not delete admin.");
    }
  };

  if (!canManageAdmins(currentRole)) {
    return <div className="rounded-lg border border-red-200 bg-white p-6 text-red-800">Access denied. Only super admins can manage admin users.</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-slate-950">Admin users</h2>
          <button className={buttonClass} onClick={() => void loadAdmins()} type="button">{isLoading ? "Loading" : "Refresh"}</button>
        </div>
        <div className="divide-y divide-slate-200">
          {admins.map((admin) => (
            <div key={admin.id} className="grid gap-3 py-4 lg:grid-cols-[minmax(0,1fr)_180px_150px_auto] lg:items-center">
              <div>
                <p className="font-black text-slate-950">{admin.email}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{admin.user_id || "No linked auth user yet"}</p>
              </div>
              <select className={inputClass} value={admin.role} onChange={(event) => void updateAdmin(admin.id, { role: event.target.value as AdminRole })}>
                {roles.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select className={inputClass} value={admin.status} onChange={(event) => void updateAdmin(admin.id, { status: event.target.value })}>
                <option value="active">active</option>
                <option value="disabled">disabled</option>
              </select>
              <button className={buttonClass} onClick={() => void deleteAdmin(admin.id)} type="button">Delete</button>
            </div>
          ))}
        </div>
      </section>
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Add admin</h2>
        <div className="mt-5 grid gap-4">
          <Field label="Email"><input className={inputClass} onChange={(event) => setEmail(event.target.value)} type="email" value={email} /></Field>
          <Field label="Role"><select className={inputClass} value={role} onChange={(event) => setRole(event.target.value as AdminRole)}>{roles.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
          <p className="text-sm leading-6 text-slate-600">Adding an admin creates or updates the admin_users record and attempts to send a Supabase Auth invitation from the server.</p>
          <button className={primaryButtonClass} onClick={() => void addAdmin()} type="button">Add admin</button>
        </div>
      </aside>
    </div>
  );
}

function AuthorsPanel() {
  const { state, setState, notify, adminHeaders, refreshFromSupabase } = useCms();
  const [draft, setDraft] = useState<CmsUser>({ id: "", name: "", email: "", role: "Journalist", position: "", bio: "", avatar: "", socialLinks: "" });
  const save = async () => {
    if (!draft.id) {
      notify("error", "Create the user in Supabase Auth first, then refresh CMS data to edit their author profile.");
      return;
    }
    const item = { ...draft, id: draft.id };
    try {
      const payload = profilePayload(item);
      if (draft.id) {
        await adminRequest("profiles", "PATCH", adminHeaders(), payload);
      } else {
        await adminRequest("profiles", "POST", adminHeaders(), payload);
      }
      setState((current) => ({ ...current, users: current.users.some((user) => user.id === item.id) ? current.users.map((user) => user.id === item.id ? item : user) : [...current.users, item] }));
      await refreshFromSupabase();
      setDraft({ id: "", name: "", email: "", role: "Journalist", position: "", bio: "", avatar: "", socialLinks: "" });
      notify("success", "Author saved to Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Author save failed.");
    }
  };
  return <CrudShell title="Authors" aside={<div className="grid gap-4"><Field label="Name"><input className={inputClass} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="Email"><input className={inputClass} value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></Field><Field label="Role"><select className={inputClass} value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as CmsUser["role"] })}><option>Super Admin</option><option>Editor</option><option>Journalist</option><option>Moderator</option></select></Field><Field label="Position"><input className={inputClass} value={draft.position} onChange={(event) => setDraft({ ...draft, position: event.target.value })} /></Field><Field label="Avatar"><input className={inputClass} value={draft.avatar} onChange={(event) => setDraft({ ...draft, avatar: event.target.value })} /></Field><Field label="Bio"><textarea className={`${inputClass} min-h-20 py-3`} value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></Field><Field label="Social links"><input className={inputClass} value={draft.socialLinks} onChange={(event) => setDraft({ ...draft, socialLinks: event.target.value })} /></Field><button className={primaryButtonClass} onClick={() => void save()} type="button">Save author</button></div>}>{state.users.map((user) => <Row key={user.id} title={user.name} meta={`${user.role} / ${user.email}`} actions={<button className={buttonClass} onClick={() => setDraft(user)} type="button">Edit</button>} />)}</CrudShell>;
}

function PagesPanel() {
  const { state, setState, notify, adminHeaders, refreshFromSupabase } = useCms();
  const [draft, setDraft] = useState<CmsPage>({ id: "", title: "", slug: "", content: "", seoTitle: "", seoDescription: "", status: "Draft" });
  const save = async () => {
    const item = { ...draft, id: draft.id || makeId("page"), slug: draft.slug || slugify(draft.title) };
    try {
      const payload = pagePayload(item);
      if (draft.id) {
        await adminRequest("pages", "PATCH", adminHeaders(), { id: draft.id, ...payload });
      } else {
        await adminRequest("pages", "POST", adminHeaders(), payload);
      }
      setState((current) => ({ ...current, pages: current.pages.some((page) => page.id === item.id) ? current.pages.map((page) => page.id === item.id ? item : page) : [...current.pages, item] }));
      await refreshFromSupabase();
      setDraft({ id: "", title: "", slug: "", content: "", seoTitle: "", seoDescription: "", status: "Draft" });
      notify("success", "Page saved to Supabase.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Page save failed.");
    }
  };
  return <CrudShell title="Static Pages" aside={<div className="grid gap-4"><Field label="Title"><input className={inputClass} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value, slug: slugify(event.target.value) })} /></Field><Field label="Slug"><input className={inputClass} value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} /></Field><Field label="Content"><textarea className={`${inputClass} min-h-32 py-3`} value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} /></Field><Field label="SEO Title"><input className={inputClass} value={draft.seoTitle} onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })} /></Field><Field label="SEO Description"><input className={inputClass} value={draft.seoDescription} onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })} /></Field><Field label="Status"><select className={inputClass} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as CmsPage["status"] })}><option>Draft</option><option>Published</option></select></Field><button className={primaryButtonClass} onClick={save} type="button">Save page</button></div>}>{state.pages.map((page) => <Row key={page.id} title={page.title} meta={`${page.status} / /${page.slug}`} actions={<button className={buttonClass} onClick={() => setDraft(page)} type="button">Edit</button>} />)}</CrudShell>;
}

function HomepagePanel() {
  const { state, setState, notify } = useCms();
  const move = (id: string, delta: -1 | 1) => setState((current) => ({ ...current, homepageSections: current.homepageSections.map((section) => section.id === id ? { ...section, order: section.order + delta } : section).sort((a, b) => a.order - b.order).map((section, index) => ({ ...section, order: index + 1 })) }));
  return <div className="border border-slate-200 bg-white p-5"><p className="text-sm leading-6 text-slate-600">Reorder and enable sections. The public homepage reads this manager for section availability and future layout expansion.</p><div className="mt-5 divide-y divide-slate-200">{state.homepageSections.sort((a, b) => a.order - b.order).map((section) => <div key={section.id} className="grid gap-3 py-4 md:grid-cols-[80px_1fr_auto_auto_auto] md:items-center"><span className="font-black">{section.order}</span><span className="font-bold">{section.label}</span><label className="flex gap-2 text-sm font-bold"><input checked={section.enabled} onChange={(event) => setState((current) => ({ ...current, homepageSections: current.homepageSections.map((item) => item.id === section.id ? { ...item, enabled: event.target.checked } : item) }))} type="checkbox" /> Enabled</label><button className={buttonClass} onClick={() => move(section.id, -1)} type="button">Up</button><button className={buttonClass} onClick={() => move(section.id, 1)} type="button">Down</button></div>)}</div><button className={primaryButtonClass} onClick={() => notify("success", "Homepage saved.")} type="button">Save homepage</button></div>;
}

function CommentsPanel() {
  const { state, setState, notify } = useCms();
  const setStatus = (id: string, status: "Approved" | "Rejected" | "Spam") => { setState((current) => ({ ...current, comments: current.comments.map((comment) => comment.id === id ? { ...comment, status } : comment) })); notify("success", `Comment marked ${status}.`); };
  return <div className="border border-slate-200 bg-white p-5">{state.comments.map((comment) => <Row key={comment.id} title={comment.content} meta={`${comment.author} / ${comment.status}`} actions={<><button className={buttonClass} onClick={() => setStatus(comment.id, "Approved")} type="button">Approve</button><button className={buttonClass} onClick={() => setStatus(comment.id, "Rejected")} type="button">Reject</button><button className={buttonClass} onClick={() => setStatus(comment.id, "Spam")} type="button">Spam</button><button className={buttonClass} onClick={() => setState((current) => ({ ...current, comments: current.comments.filter((item) => item.id !== comment.id) }))} type="button">Delete</button></>} />)}</div>;
}

function NewsletterPanel() {
  const { state } = useCms();
  const csv = ["email,name,createdAt", ...state.subscribers.map((item) => `${item.email},${item.name},${item.createdAt}`)].join("\n");
  return <div className="border border-slate-200 bg-white p-5"><a className={primaryButtonClass} download="afakpress-subscribers.csv" href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}>Export CSV</a><div className="mt-5 divide-y divide-slate-200">{state.subscribers.map((subscriber) => <Row key={subscriber.id} title={subscriber.email} meta={`${subscriber.name} / ${subscriber.createdAt}`} actions={null} />)}</div></div>;
}

function SeoPanel() {
  const { state, setState, notify } = useCms();
  const settings = state.settings;
  const update = (key: keyof typeof settings, value: string) => setState((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  return <div className="grid gap-4 border border-slate-200 bg-white p-5 lg:grid-cols-2"><Field label="Default Meta Title"><input className={inputClass} value={settings.defaultMetaTitle} onChange={(event) => update("defaultMetaTitle", event.target.value)} /></Field><Field label="Default Meta Description"><input className={inputClass} value={settings.defaultMetaDescription} onChange={(event) => update("defaultMetaDescription", event.target.value)} /></Field><Field label="Robots"><input className={inputClass} value={settings.robots} onChange={(event) => update("robots", event.target.value)} /></Field><Field label="OpenGraph Title"><input className={inputClass} value={settings.openGraphTitle} onChange={(event) => update("openGraphTitle", event.target.value)} /></Field><Field label="Twitter Card"><input className={inputClass} value={settings.twitterCard} onChange={(event) => update("twitterCard", event.target.value)} /></Field><button className={primaryButtonClass} onClick={() => notify("success", "SEO settings saved.")} type="button">Save SEO</button></div>;
}

function SettingsPanel() {
  const { state, setState, notify } = useCms();
  const settings = state.settings;
  const update = (key: keyof typeof settings, value: string) => setState((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  return <div className="grid gap-4 border border-slate-200 bg-white p-5 lg:grid-cols-2"><Field label="Website Name"><input className={inputClass} value={settings.websiteName} onChange={(event) => update("websiteName", event.target.value)} /></Field><Field label="Logo"><input className={inputClass} value={settings.logo} onChange={(event) => update("logo", event.target.value)} /></Field><Field label="Dark Logo"><input className={inputClass} value={settings.darkLogo} onChange={(event) => update("darkLogo", event.target.value)} /></Field><Field label="Favicon"><input className={inputClass} value={settings.favicon} onChange={(event) => update("favicon", event.target.value)} /></Field><Field label="Contact Email"><input className={inputClass} value={settings.contactEmail} onChange={(event) => update("contactEmail", event.target.value)} /></Field><Field label="Phone"><input className={inputClass} value={settings.phone} onChange={(event) => update("phone", event.target.value)} /></Field><Field label="Address"><input className={inputClass} value={settings.address} onChange={(event) => update("address", event.target.value)} /></Field><Field label="Footer"><input className={inputClass} value={settings.footer} onChange={(event) => update("footer", event.target.value)} /></Field><Field label="Social Links"><input className={inputClass} value={settings.socialLinks} onChange={(event) => update("socialLinks", event.target.value)} /></Field><Field label="Analytics Code"><input className={inputClass} value={settings.analyticsCode} onChange={(event) => update("analyticsCode", event.target.value)} /></Field><Field label="Google Search Console"><input className={inputClass} value={settings.googleSearchConsole} onChange={(event) => update("googleSearchConsole", event.target.value)} /></Field><Field label="Google Tag Manager"><input className={inputClass} value={settings.googleTagManager} onChange={(event) => update("googleTagManager", event.target.value)} /></Field><Field label="Theme"><select className={inputClass} value={settings.theme} onChange={(event) => update("theme", event.target.value)}><option>Light</option><option>Dark</option></select></Field><Field label="Accent Color"><input className={inputClass} value={settings.accentColor} onChange={(event) => update("accentColor", event.target.value)} type="color" /></Field><button className={primaryButtonClass} onClick={() => notify("success", "Settings saved.")} type="button">Save settings</button></div>;
}

function CrudShell({ title, children, aside }: { title: string; children: React.ReactNode; aside: React.ReactNode }) {
  return <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_460px]"><div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-xl font-black text-slate-950">{title}</h2><div className="divide-y divide-slate-200">{children}</div></div><aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-xl font-black text-slate-950">Editor</h2>{aside}</aside></div>;
}

function Row({ title, meta, actions }: { title: string; meta: string; actions: React.ReactNode }) {
  return <div className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center"><div><p className="font-black text-slate-950">{title}</p><p className="mt-1 text-xs font-bold text-slate-500">{meta}</p></div><div className="flex flex-wrap gap-2">{actions}</div></div>;
}
