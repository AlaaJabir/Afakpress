"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  getPublishedArticles,
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

type Section =
  | "dashboard"
  | "articles"
  | "media"
  | "categories"
  | "menus"
  | "regions"
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
  { id: "regions", label: "Morocco Regions" },
  { id: "authors", label: "Authors" },
  { id: "pages", label: "Pages" },
  { id: "homepage", label: "Homepage" },
  { id: "comments", label: "Comments" },
  { id: "newsletter", label: "Newsletter" },
  { id: "seo", label: "SEO" },
  { id: "settings", label: "Settings" },
];

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
  author: "",
  categoryId: "",
  category: "",
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
  status: "Draft",
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
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

const inputClass = "min-h-11 w-full border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-red-700";
const buttonClass = "min-h-10 border border-slate-300 px-3 text-sm font-black text-slate-900 transition hover:border-red-700 hover:text-red-700";
const primaryButtonClass = "min-h-10 bg-slate-950 px-3 text-sm font-black text-white transition hover:bg-red-700";

export function AdminCMS() {
  const { state, setState, currentUser, login, logout, hasAccess, notice, notify, resetDemo } = useCms();
  const [email, setEmail] = useState("admin@afakpress.ma");
  const [password, setPassword] = useState("afakpress2026");
  const [active, setActive] = useState<Section>("dashboard");
  const [query, setQuery] = useState("");
  const [articleDraft, setArticleDraft] = useState<CmsArticle>({ ...emptyArticle });
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);

  const visibleSections = sections.filter((section) => hasAccess(section.id));
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

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">Protected CMS</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Afakpress Admin Login</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Demo accounts: admin, editor, journalist, moderator at afakpress.ma. Passwords follow role + 2026, except admin uses afakpress2026.</p>
        <div className="mt-6 space-y-4">
          <Field label="Email">
            <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Password">
            <input className={inputClass} value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </Field>
          <button className={primaryButtonClass} onClick={() => login(email, password)} type="button">Sign in</button>
        </div>
        {notice ? <Notice type={notice.type} message={notice.message} /> : null}
      </div>
    );
  }

  const saveArticle = () => {
    const category = state.categories.find((item) => item.id === articleDraft.categoryId || item.slug === articleDraft.category);
    const region = state.regions.find((item) => item.id === articleDraft.regionId || item.slug === articleDraft.region);
    const province = region?.provinces.find((item) => item.id === articleDraft.provinceId || item.slug === articleDraft.province);
    const commune = province?.communes.find((item) => item.id === articleDraft.communeId || item.slug === articleDraft.commune);
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
      categoryId: category?.id ?? articleDraft.categoryId,
      category: category?.slug ?? articleDraft.category,
      regionId: region?.id ?? articleDraft.regionId,
      region: region?.slug ?? articleDraft.region,
      provinceId: province?.id ?? articleDraft.provinceId,
      province: province?.slug ?? articleDraft.province,
      communeId: commune?.id ?? articleDraft.communeId,
      commune: commune?.slug ?? articleDraft.commune,
      authorId: author?.id ?? articleDraft.authorId,
      author: author?.name ?? articleDraft.author,
      ownerId: articleDraft.ownerId || currentUser.id,
      publishedAt: articleDraft.publishDate,
      canonicalUrl: articleDraft.canonicalUrl || `/article/${slug}`,
    };
    setState((current) => ({
      ...current,
      articles: current.articles.some((article) => article.id === nextArticle.id) ? current.articles.map((article) => (article.id === nextArticle.id ? nextArticle : article)) : [nextArticle, ...current.articles],
    }));
    setArticleDraft({ ...emptyArticle });
    notify("success", "Article saved.");
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
    <div className="min-h-[80vh] bg-slate-100">
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-black">Afakpress CMS</p>
              <p className="mt-1 text-xs font-bold uppercase text-slate-400">{currentUser.role}</p>
            </div>
            <button className="text-sm font-bold text-red-300" onClick={logout} type="button">Logout</button>
          </div>
          <input className="mt-5 min-h-11 w-full border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none" placeholder="Search dashboard" value={query} onChange={(event) => setQuery(event.target.value)} />
          <nav className="mt-5 grid gap-1">
            {visibleSections.map((section) => (
              <button key={section.id} className={`px-3 py-3 text-left text-sm font-bold transition ${active === section.id ? "bg-red-700 text-white" : "text-slate-300 hover:bg-slate-900"}`} onClick={() => setActive(section.id)} type="button">
                {section.label}
              </button>
            ))}
          </nav>
          <div className="mt-6 border border-slate-800 p-4 text-xs leading-6 text-slate-400">
            <p className="font-black text-white">Permissions</p>
            <p>{rolePermissions[currentUser.role].join(", ")}</p>
          </div>
        </aside>

        <section className="p-4 lg:p-8">
          {notice ? <Notice type={notice.type} message={notice.message} /> : null}
          <div className="mb-6 flex flex-col gap-3 border border-slate-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-red-700">{active}</p>
              <h1 className="mt-1 text-3xl font-black text-slate-950">{sections.find((section) => section.id === active)?.label}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className={buttonClass} href="/">View site</Link>
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
            />
          ) : null}
          {active === "media" ? <MediaPanel /> : null}
          {active === "categories" ? <CategoriesPanel /> : null}
          {active === "menus" ? <MenusPanel /> : null}
          {active === "regions" ? <RegionsPanel /> : null}
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="border border-slate-200 bg-white p-5">
            <p className="text-xs font-black uppercase text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>
      <div className="border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-black text-slate-950">Publishing health</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">The frontend is connected to the CMS store. Published articles, categories, menus, regions, and homepage settings update immediately in this browser session.</p>
        <div className="mt-5 h-3 overflow-hidden bg-slate-100">
          <div className="h-full bg-red-700" style={{ width: `${Math.min(100, published * 12)}%` }} />
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
}: {
  articles: CmsArticle[];
  draft: CmsArticle;
  setDraft: (article: CmsArticle) => void;
  selected: string[];
  setSelected: (ids: string[]) => void;
  saveArticle: () => void;
  bulkDelete: () => void;
  bulkUpdate: (key: "status" | "category", value: string) => void;
}) {
  const { state, setState, currentUser, notify } = useCms();
  const statusOptions: ArticleStatus[] = ["Draft", "Pending Review", "Scheduled", "Published"];
  const provinces = state.regions.find((region) => region.id === draft.regionId)?.provinces ?? [];
  const communes = provinces.find((province) => province.id === draft.provinceId)?.communes ?? [];
  const canEdit = currentUser?.role !== "Journalist" || !draft.ownerId || draft.ownerId === currentUser.id;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_460px]">
      <div className="border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <button className={buttonClass} onClick={() => bulkUpdate("status", "Published")} type="button">Publish selected</button>
          <button className={buttonClass} onClick={() => bulkUpdate("status", "Draft")} type="button">Draft selected</button>
          <button className={buttonClass} onClick={() => bulkUpdate("category", state.categories[0]?.slug ?? "")} type="button">Bulk category</button>
          <button className={buttonClass} onClick={bulkDelete} type="button">Bulk delete</button>
        </div>
        <div className="divide-y divide-slate-200">
          {articles.map((article) => (
            <div key={article.id} className="grid gap-3 py-4 lg:grid-cols-[32px_1fr_130px_130px_180px] lg:items-center">
              <input checked={selected.includes(article.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, article.id] : selected.filter((id) => id !== article.id))} type="checkbox" />
              <div>
                <Link href={`/article/${article.slug}`} className="font-black text-slate-950 hover:text-red-700">{article.title}</Link>
                <p className="mt-1 text-xs font-bold text-slate-500">{article.excerpt}</p>
              </div>
              <span className="text-sm font-bold">{article.status}</span>
              <span className="text-sm font-bold">{article.category}</span>
              <div className="flex flex-wrap gap-2">
                <button className={buttonClass} onClick={() => setDraft(article)} type="button">Edit</button>
                <button className={buttonClass} onClick={() => setDraft({ ...article, id: "", title: `${article.title} Copy`, slug: `${article.slug}-copy`, status: "Draft" })} type="button">Duplicate</button>
                <button className={buttonClass} onClick={() => {
                  setState((current) => ({ ...current, articles: current.articles.filter((item) => item.id !== article.id) }));
                  notify("warning", "Article deleted.");
                }} type="button">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-slate-950">Article editor</h2>
        <div className="mt-5 grid gap-4">
          <Field label="Title"><input className={inputClass} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value, slug: slugify(event.target.value), seoTitle: event.target.value })} /></Field>
          <Field label="Slug"><input className={inputClass} value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} /></Field>
          <Field label="Excerpt"><textarea className={`${inputClass} min-h-20 py-3`} value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value, seoDescription: event.target.value })} /></Field>
          <Field label="Full Content"><textarea className={`${inputClass} min-h-40 py-3`} value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} /></Field>
          <Field label="Featured Image URL"><input className={inputClass} value={draft.featuredImage} onChange={(event) => setDraft({ ...draft, featuredImage: event.target.value, image: event.target.value })} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Author"><select className={inputClass} value={draft.authorId} onChange={(event) => setDraft({ ...draft, authorId: event.target.value })}><option value="">Select</option>{state.users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></Field>
            <Field label="Category"><select className={inputClass} value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}><option value="">Select</option>{state.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
            <Field label="Region"><select className={inputClass} value={draft.regionId} onChange={(event) => setDraft({ ...draft, regionId: event.target.value, provinceId: "", communeId: "" })}><option value="">Select</option>{state.regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></Field>
            <Field label="Province / Prefecture"><select className={inputClass} value={draft.provinceId} onChange={(event) => setDraft({ ...draft, provinceId: event.target.value, communeId: "" })}><option value="">Select</option>{provinces.map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}</select></Field>
            <Field label="Commune"><select className={inputClass} value={draft.communeId} onChange={(event) => setDraft({ ...draft, communeId: event.target.value })}><option value="">Select</option>{communes.map((commune) => <option key={commune.id} value={commune.id}>{commune.name}</option>)}</select></Field>
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
          <button className={primaryButtonClass} disabled={!canEdit} onClick={saveArticle} type="button">{canEdit ? "Save article" : "Journalists can edit only their own articles"}</button>
        </div>
      </div>
    </div>
  );
}

function MediaPanel() {
  const { state, setState, notify } = useCms();
  const [draft, setDraft] = useState<CmsMedia>({ id: "", name: "", url: "", type: "Image", folder: "Newsroom", alt: "", caption: "", copyright: "", optimized: true });
  const save = () => {
    const item = { ...draft, id: draft.id || makeId("media") };
    setState((current) => ({ ...current, media: current.media.some((media) => media.id === item.id) ? current.media.map((media) => media.id === item.id ? item : media) : [item, ...current.media] }));
    setDraft({ id: "", name: "", url: "", type: "Image", folder: "Newsroom", alt: "", caption: "", copyright: "", optimized: true });
    notify("success", "Media saved.");
  };
  return <CrudShell title="Media Library" aside={<MediaForm draft={draft} setDraft={setDraft} save={save} />}>{state.media.map((media) => <Row key={media.id} title={media.name} meta={`${media.type} / ${media.folder}`} actions={<><button className={buttonClass} onClick={() => setDraft(media)} type="button">Edit</button><button className={buttonClass} onClick={() => setState((current) => ({ ...current, media: current.media.filter((item) => item.id !== media.id) }))} type="button">Delete</button></>} />)}</CrudShell>;
}

function MediaForm({ draft, setDraft, save }: { draft: CmsMedia; setDraft: (media: CmsMedia) => void; save: () => void }) {
  return <div className="grid gap-4"><Field label="File URL or upload placeholder"><input className={inputClass} value={draft.url} onChange={(event) => setDraft({ ...draft, url: event.target.value })} /></Field><Field label="Name"><input className={inputClass} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="Type"><select className={inputClass} value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as CmsMedia["type"] })}><option>Image</option><option>Video</option><option>PDF</option></select></Field><Field label="Folder"><input className={inputClass} value={draft.folder} onChange={(event) => setDraft({ ...draft, folder: event.target.value })} /></Field><Field label="Alt text"><input className={inputClass} value={draft.alt} onChange={(event) => setDraft({ ...draft, alt: event.target.value })} /></Field><Field label="Caption"><input className={inputClass} value={draft.caption} onChange={(event) => setDraft({ ...draft, caption: event.target.value })} /></Field><Field label="Copyright"><input className={inputClass} value={draft.copyright} onChange={(event) => setDraft({ ...draft, copyright: event.target.value })} /></Field><label className="flex gap-2 text-sm font-bold"><input checked={draft.optimized} onChange={(event) => setDraft({ ...draft, optimized: event.target.checked })} type="checkbox" /> Image optimized/compressed</label><div className="border border-dashed border-slate-300 p-6 text-center text-sm font-bold text-slate-500">Drag & drop upload area, cropping, compression, and optimization metadata</div><button className={primaryButtonClass} onClick={save} type="button">Save media</button></div>;
}

function CategoriesPanel() {
  const { state, setState, notify } = useCms();
  const [draft, setDraft] = useState<CmsCategory>({ id: "", name: "", slug: "", parentId: "", color: "#b91c1c", icon: "", description: "", seoTitle: "", seoDescription: "" });
  const save = () => {
    const item = { ...draft, id: draft.id || makeId("cat"), slug: draft.slug || slugify(draft.name) };
    setState((current) => ({ ...current, categories: current.categories.some((category) => category.id === item.id) ? current.categories.map((category) => category.id === item.id ? item : category) : [...current.categories, item] }));
    setDraft({ id: "", name: "", slug: "", parentId: "", color: "#b91c1c", icon: "", description: "", seoTitle: "", seoDescription: "" });
    notify("success", "Category saved.");
  };
  return <CrudShell title="Categories" aside={<div className="grid gap-4"><Field label="Name"><input className={inputClass} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value, slug: slugify(event.target.value) })} /></Field><Field label="Parent"><select className={inputClass} value={draft.parentId} onChange={(event) => setDraft({ ...draft, parentId: event.target.value })}><option value="">None</option>{state.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field><Field label="Color"><input className={inputClass} value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} type="color" /></Field><Field label="Icon"><input className={inputClass} value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value })} /></Field><Field label="Description"><textarea className={`${inputClass} min-h-20 py-3`} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field><Field label="SEO Title"><input className={inputClass} value={draft.seoTitle} onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })} /></Field><Field label="SEO Description"><input className={inputClass} value={draft.seoDescription} onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })} /></Field><button className={primaryButtonClass} onClick={save} type="button">Save category</button></div>}>{state.categories.map((category) => <Row key={category.id} title={category.name} meta={category.slug} actions={<><button className={buttonClass} onClick={() => setDraft(category)} type="button">Edit</button><button className={buttonClass} onClick={() => setState((current) => ({ ...current, categories: current.categories.filter((item) => item.id !== category.id) }))} type="button">Delete</button></>} />)}</CrudShell>;
}

function MenusPanel() {
  const { state, setState, notify } = useCms();
  const [draft, setDraft] = useState<CmsMenuItem>({ id: "", label: "", href: "", type: "Custom", children: [] });
  const save = () => {
    const item = { ...draft, id: draft.id || makeId("menu") };
    setState((current) => ({ ...current, menus: current.menus.some((menu) => menu.id === item.id) ? current.menus.map((menu) => menu.id === item.id ? item : menu) : [...current.menus, item] }));
    setDraft({ id: "", label: "", href: "", type: "Custom", children: [] });
    notify("success", "Menu saved.");
  };
  const move = (index: number, direction: -1 | 1) => setState((current) => {
    const menus = [...current.menus];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= menus.length) return current;
    [menus[index], menus[nextIndex]] = [menus[nextIndex], menus[index]];
    return { ...current, menus };
  });
  return <CrudShell title="Menu Builder" aside={<div className="grid gap-4"><Field label="Label"><input className={inputClass} value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} /></Field><Field label="Href"><input className={inputClass} value={draft.href} onChange={(event) => setDraft({ ...draft, href: event.target.value })} /></Field><Field label="Type"><select className={inputClass} value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as CmsMenuItem["type"] })}><option>Custom</option><option>Page</option><option>Category</option><option>Region</option><option>Province</option><option>Commune</option></select></Field><p className="text-sm leading-6 text-slate-600">Use arrows for ordering. Region items support Submenu and Submenu level 2 through nested region/province/commune data.</p><button className={primaryButtonClass} onClick={save} type="button">Save menu</button></div>}>{state.menus.map((menu, index) => <Row key={menu.id} title={menu.label} meta={`${menu.type} / ${menu.href}`} actions={<><button className={buttonClass} onClick={() => move(index, -1)} type="button">Up</button><button className={buttonClass} onClick={() => move(index, 1)} type="button">Down</button><button className={buttonClass} onClick={() => setDraft(menu)} type="button">Edit</button><button className={buttonClass} onClick={() => setState((current) => ({ ...current, menus: current.menus.filter((item) => item.id !== menu.id) }))} type="button">Delete</button></>} />)}</CrudShell>;
}

function RegionsPanel() {
  const { state, setState, notify } = useCms();
  const addRegion = () => setState((current) => ({ ...current, regions: [...current.regions, { id: makeId("region"), name: "New Region", slug: "new-region", provinces: [] }] }));
  const updateRegion = (region: CmsRegion) => setState((current) => ({ ...current, regions: current.regions.map((item) => item.id === region.id ? region : item) }));
  const addProvince = (region: CmsRegion) => updateRegion({ ...region, provinces: [...region.provinces, { id: makeId("province"), name: "New Province", slug: "new-province", communes: [] }] });
  const updateProvince = (region: CmsRegion, province: CmsProvince) => updateRegion({ ...region, provinces: region.provinces.map((item) => item.id === province.id ? province : item) });
  const addCommune = (region: CmsRegion, province: CmsProvince) => updateProvince(region, { ...province, communes: [...province.communes, { id: makeId("commune"), name: "New Commune", slug: "new-commune" }] });
  const updateCommune = (region: CmsRegion, province: CmsProvince, commune: CmsCommune) => updateProvince(region, { ...province, communes: province.communes.map((item) => item.id === commune.id ? commune : item) });
  return <div className="border border-slate-200 bg-white p-5"><button className={primaryButtonClass} onClick={() => { addRegion(); notify("success", "Region added."); }} type="button">Add Region</button><div className="mt-5 space-y-6">{state.regions.map((region) => <div key={region.id} className="border border-slate-200 p-4"><div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]"><input className={inputClass} value={region.name} onChange={(event) => updateRegion({ ...region, name: event.target.value, slug: slugify(event.target.value) })} /><input className={inputClass} value={region.slug} onChange={(event) => updateRegion({ ...region, slug: event.target.value })} /><button className={buttonClass} onClick={() => addProvince(region)} type="button">Add Province</button><button className={buttonClass} onClick={() => setState((current) => ({ ...current, regions: current.regions.filter((item) => item.id !== region.id) }))} type="button">Delete</button></div><div className="mt-4 space-y-4 pl-4">{region.provinces.map((province) => <div key={province.id} className="border-l-4 border-red-200 pl-4"><div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]"><input className={inputClass} value={province.name} onChange={(event) => updateProvince(region, { ...province, name: event.target.value, slug: slugify(event.target.value) })} /><input className={inputClass} value={province.slug} onChange={(event) => updateProvince(region, { ...province, slug: event.target.value })} /><button className={buttonClass} onClick={() => addCommune(region, province)} type="button">Add Commune</button><button className={buttonClass} onClick={() => updateRegion({ ...region, provinces: region.provinces.filter((item) => item.id !== province.id) })} type="button">Delete</button></div><div className="mt-3 grid gap-2 pl-4 md:grid-cols-2">{province.communes.map((commune) => <div key={commune.id} className="grid gap-2 md:grid-cols-[1fr_auto]"><input className={inputClass} value={commune.name} onChange={(event) => updateCommune(region, province, { ...commune, name: event.target.value, slug: slugify(event.target.value) })} /><button className={buttonClass} onClick={() => updateProvince(region, { ...province, communes: province.communes.filter((item) => item.id !== commune.id) })} type="button">Delete</button></div>)}</div></div>)}</div></div>)}</div></div>;
}

function AuthorsPanel() {
  const { state, setState, notify } = useCms();
  const [draft, setDraft] = useState<CmsUser>({ id: "", name: "", email: "", role: "Journalist", position: "", bio: "", avatar: "", socialLinks: "" });
  const save = () => {
    const item = { ...draft, id: draft.id || makeId("user") };
    setState((current) => ({ ...current, users: current.users.some((user) => user.id === item.id) ? current.users.map((user) => user.id === item.id ? item : user) : [...current.users, item] }));
    setDraft({ id: "", name: "", email: "", role: "Journalist", position: "", bio: "", avatar: "", socialLinks: "" });
    notify("success", "Author saved.");
  };
  return <CrudShell title="Authors" aside={<div className="grid gap-4"><Field label="Name"><input className={inputClass} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="Email"><input className={inputClass} value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></Field><Field label="Role"><select className={inputClass} value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as CmsUser["role"] })}><option>Super Admin</option><option>Editor</option><option>Journalist</option><option>Moderator</option></select></Field><Field label="Position"><input className={inputClass} value={draft.position} onChange={(event) => setDraft({ ...draft, position: event.target.value })} /></Field><Field label="Avatar"><input className={inputClass} value={draft.avatar} onChange={(event) => setDraft({ ...draft, avatar: event.target.value })} /></Field><Field label="Bio"><textarea className={`${inputClass} min-h-20 py-3`} value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></Field><Field label="Social links"><input className={inputClass} value={draft.socialLinks} onChange={(event) => setDraft({ ...draft, socialLinks: event.target.value })} /></Field><button className={primaryButtonClass} onClick={save} type="button">Save author</button></div>}>{state.users.map((user) => <Row key={user.id} title={user.name} meta={`${user.role} / ${user.email}`} actions={<button className={buttonClass} onClick={() => setDraft(user)} type="button">Edit</button>} />)}</CrudShell>;
}

function PagesPanel() {
  const { state, setState, notify } = useCms();
  const [draft, setDraft] = useState<CmsPage>({ id: "", title: "", slug: "", content: "", seoTitle: "", seoDescription: "", status: "Draft" });
  const save = () => {
    const item = { ...draft, id: draft.id || makeId("page"), slug: draft.slug || slugify(draft.title) };
    setState((current) => ({ ...current, pages: current.pages.some((page) => page.id === item.id) ? current.pages.map((page) => page.id === item.id ? item : page) : [...current.pages, item] }));
    setDraft({ id: "", title: "", slug: "", content: "", seoTitle: "", seoDescription: "", status: "Draft" });
    notify("success", "Page saved.");
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
  return <div className="grid gap-6 xl:grid-cols-[1fr_420px]"><div className="border border-slate-200 bg-white p-5"><h2 className="mb-4 text-xl font-black text-slate-950">{title}</h2><div className="divide-y divide-slate-200">{children}</div></div><aside className="border border-slate-200 bg-white p-5"><h2 className="mb-4 text-xl font-black text-slate-950">Editor</h2>{aside}</aside></div>;
}

function Row({ title, meta, actions }: { title: string; meta: string; actions: React.ReactNode }) {
  return <div className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center"><div><p className="font-black text-slate-950">{title}</p><p className="mt-1 text-xs font-bold text-slate-500">{meta}</p></div><div className="flex flex-wrap gap-2">{actions}</div></div>;
}

