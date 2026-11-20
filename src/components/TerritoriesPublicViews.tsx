"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { TerritoryArticle, TerritoryChild, TerritoryEntity, TerritoryOfficial, TerritoryPageData } from "@/lib/territories";

const t = {
  home: "Territoires",
  homeIntro: "Explorez les régions, provinces, préfectures et communes du Maroc.",
  search: "Rechercher une région, province ou commune",
  mapLabel: "Carte schématique des 12 régions",
  officials: "Élus et représentants",
  noOfficials: "Aucun profil publié pour ce territoire.",
  children: "Explorer le territoire",
  regionChildren: "Provinces et préfectures",
  communeChildren: "Communes",
  news: "Actualités du territoire",
  noNews: "Aucun article publié pour ce territoire pour le moment.",
  allNews: "Voir les actualités",
  practical: "Informations pratiques",
  related: "Communes voisines",
  population: "Population",
  profiles: "Profils publiés",
  articles: "Articles",
  filterAll: "Tous les types",
  urban: "Urbaine",
  rural: "Rurale",
  searchChildren: "Rechercher dans la liste",
  categoryAll: "Toutes les catégories",
};

function label(item: TerritoryEntity) {
  return item.name_fr || item.name || item.slug;
}

function storageImage(path: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !path) return "";
  return `${base}/storage/v1/object/public/territory-media/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function OfficialCard({ official }: { official: TerritoryOfficial }) {
  const photo = storageImage(official.photo_path);
  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {photo ? <Image src={photo} alt={official.full_name} width={112} height={112} className="mx-auto h-24 w-24 rounded-full object-cover" /> : <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-2xl font-black text-slate-500">{official.full_name.slice(0, 1)}</div>}
      <h3 className="mt-3 text-center text-base font-black text-slate-950">{official.full_name}</h3>
      {official.full_name_ar ? <p dir="ltr" className="mt-1 text-center text-sm text-slate-600">{official.full_name_ar}</p> : null}
      <p className="mt-2 text-center text-sm font-bold text-red-700">{official.role}</p>
      {official.party ? <p className="mt-1 text-center text-xs text-slate-500">{official.party}</p> : null}
      {official.mandate_start || official.mandate_end ? <p className="mt-2 text-center text-xs text-slate-500">{official.mandate_start ?? "—"} – {official.mandate_end ?? "—"}</p> : null}
    </article>
  );
}

function ArticleCard({ article }: { article: TerritoryArticle }) {
  const image = article.featured_image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80";
  return (
    <Link href={`/article/${encodeURIComponent(article.slug ?? "")}`} className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/9] bg-slate-100">
        <Image src={image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-300 group-hover:scale-105" />
      </div>
      <div className="p-4">
        {article.category?.name ? <p className="text-xs font-black text-red-700">{article.category.name}</p> : null}
        <h3 className="mt-2 line-clamp-2 text-lg font-black leading-7 text-slate-950 group-hover:text-red-700">{article.title}</h3>
        {article.excerpt ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{article.excerpt}</p> : null}
        <time className="mt-4 block text-xs text-slate-500" dateTime={article.published_at ?? article.created_at ?? undefined}>{article.published_at ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(article.published_at)) : ""}</time>
      </div>
    </Link>
  );
}

export function TerritoriesHomeView({ regions, searchItems, officials }: {
  regions: Array<TerritoryEntity & { href: string; officialCount: number }>;
  searchItems: Array<{ name: string; nameAr: string; href: string; type: "region" | "province" | "commune" }>;
  officials: TerritoryOfficial[];
}) {
  const [query, setQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(regions[0]?.id ?? "");
  const selected = regions.find((region) => region.id === selectedRegion) ?? regions[0];
  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return [];
    return searchItems.filter((item) => `${item.name} ${item.nameAr}`.toLocaleLowerCase().includes(term)).slice(0, 12);
  }, [query, searchItems]);
  const selectedOfficials = officials.filter((official) => official.region_id === selected?.id);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" dir="ltr">
      <header className="mb-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-red-700">Afakpress · Maroc</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">{t.home}</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">{t.homeIntro}</p>
      </header>
      <label className="relative block max-w-2xl">
        <span className="sr-only">{t.search}</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-red-700 focus:ring-2 focus:ring-red-100" />
      </label>
      {query.trim() ? <div className="mt-3 max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {results.length ? results.map((item) => <Link key={item.href} href={item.href} className="flex min-h-12 items-center justify-between border-b border-slate-100 px-4 py-3 text-sm hover:bg-red-50"><span>{item.name}</span><span className="text-xs text-slate-500">{item.type}</span></Link>) : <p className="p-4 text-sm text-slate-500">Aucun territoire trouvé.</p>}
      </div> : null}
      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-2xl font-black text-slate-950">{t.mapLabel}</h2><p className="mt-1 text-xs text-slate-500">Sélectionnez une région pour afficher ses représentants.</p></div>
            <span className="text-xs font-bold text-slate-500">{regions.length} régions</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {regions.map((region, index) => <button key={region.id} type="button" onClick={() => setSelectedRegion(region.id)} className={`min-h-28 rounded-xl border p-4 text-right transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 ${selectedRegion === region.id ? "border-red-700 bg-red-50 shadow-sm" : "border-slate-200 bg-white hover:border-red-300"}`}>
              <span className="text-xs font-black text-red-700">{String(index + 1).padStart(2, "0")}</span>
              <span className="mt-2 block text-sm font-black leading-6 text-slate-950">{label(region)}</span>
              <span className="mt-1 block text-xs text-slate-500">{region.officialCount} profil(s)</span>
            </button>)}
          </div>
        </section>
        {selected ? <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-red-700">Région sélectionnée</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">{label(selected)}</h2>
          {selected.name_ar && selected.name_ar !== label(selected) ? <p dir="rtl" className="mt-1 text-lg text-slate-600">{selected.name_ar}</p> : null}
          <div className="mt-5 space-y-3">
            {selectedOfficials.length ? selectedOfficials.slice(0, 3).map((official) => <div key={official.id} className="border-t border-slate-100 pt-3"><p className="font-bold text-slate-900">{official.full_name}</p><p className="text-xs text-slate-500">{official.role}</p></div>) : <p className="text-sm text-slate-500">{t.noOfficials}</p>}
          </div>
          <Link href={selected.href} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-red-700 px-4 text-sm font-bold text-white hover:bg-red-800">Consulter la région</Link>
        </aside> : null}
      </div>
    </main>
  );
}

export function TerritoryDetailView({ data }: { data: TerritoryPageData }) {
  const [childQuery, setChildQuery] = useState("");
  const [childKind, setChildKind] = useState("all");
  const [category, setCategory] = useState("all");
  const children = useMemo(() => data.children.filter((item) => {
    const matchesText = label(item).toLocaleLowerCase().includes(childQuery.trim().toLocaleLowerCase());
    const matchesKind = childKind === "all" || item.kind === childKind;
    return matchesText && matchesKind;
  }), [data.children, childQuery, childKind]);
  const categories = [...new Set(data.articles.map((article) => article.category?.name).filter((value): value is string => Boolean(value)))];
  const articles = category === "all" ? data.articles : data.articles.filter((article) => article.category?.name === category);
  const title = label(data.entity);
  const typeLabel = data.type === "region" ? "Région" : data.type === "province" ? (data.entity.kind === "prefecture" ? "Préfecture" : "Province") : "Commune";
  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: t.home, href: "/territoires" },
    { label: label(data.region), href: `/territoires/${encodeURIComponent(data.region.slug)}` },
    ...(data.province ? [{ label: label(data.province), href: `/territoires/${encodeURIComponent(data.region.slug)}/${encodeURIComponent(data.province.slug)}` }] : []),
  ];
  if (data.type === "commune") breadcrumb.push({ label: title, href: "#" });
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" dir="ltr">
      <nav aria-label="Fil d’Ariane" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
        {breadcrumb.map((item, index) => <span key={item.href + index} className="flex items-center gap-2"><Link href={item.href} className="hover:text-red-700">{item.label}</Link>{index < breadcrumb.length - 1 ? <span aria-hidden="true">/</span> : null}</span>)}
      </nav>
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm font-black uppercase tracking-wider text-red-700">{typeLabel} · Maroc</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-5xl">{title}</h1>
        {data.entity.name_ar && data.entity.name_ar !== title ? <p dir="rtl" className="mt-2 text-2xl text-slate-600">{data.entity.name_ar}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {data.entity.population !== null && data.entity.population !== undefined ? <div className="rounded-lg bg-slate-50 px-4 py-3"><span className="block text-xs text-slate-500">{t.population}</span><strong className="mt-1 block text-lg text-slate-950">{data.entity.population.toLocaleString("fr-FR")}</strong></div> : null}
          <div className="rounded-lg bg-slate-50 px-4 py-3"><span className="block text-xs text-slate-500">{t.profiles}</span><strong className="mt-1 block text-lg text-slate-950">{data.officials.length}</strong></div>
          <div className="rounded-lg bg-slate-50 px-4 py-3"><span className="block text-xs text-slate-500">{t.articles}</span><strong className="mt-1 block text-lg text-slate-950">{data.articles.length}</strong></div>
        </div>
      </header>
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-red-700">Représentation</p><h2 className="mt-1 text-2xl font-black text-slate-950">{t.officials}</h2></div></div>
        {data.officials.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.officials.map((official) => <OfficialCard key={official.id} official={official} />)}</div> : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{t.noOfficials}</p>}
        {data.type === "province" && data.officials.some((official) => official.house) ? <div className="mt-5 rounded-xl bg-slate-50 p-4"><h3 className="font-black text-slate-900">Parlementaires</h3><div className="mt-3 flex flex-wrap gap-2">{data.officials.filter((official) => official.house).map((official) => <span key={official.id} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">{official.full_name} · {official.house?.replaceAll("_", " ")}</span>)}</div></div> : null}
      </section>
      {data.children.length ? <section className="mt-10">
        <div className="mb-5"><p className="text-xs font-black uppercase tracking-wider text-red-700">Découvrir</p><h2 className="mt-1 text-2xl font-black text-slate-950">{data.type === "region" ? t.regionChildren : t.communeChildren}</h2></div>
        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
          <input aria-label={t.searchChildren} value={childQuery} onChange={(event) => setChildQuery(event.target.value)} placeholder={t.searchChildren} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-red-700 focus:ring-2 focus:ring-red-100" />
          <select aria-label={t.filterAll} value={childKind} onChange={(event) => setChildKind(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="all">{t.filterAll}</option><option value="province">Province</option><option value="prefecture">Préfecture</option><option value="urbaine">{t.urban}</option><option value="rurale">{t.rural}</option></select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children.map((child) => <Link key={child.id} href={child.href} className="flex min-h-16 items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 hover:border-red-300 hover:text-red-700"><span>{label(child)}</span><span aria-hidden="true">←</span></Link>)}</div>
        {!children.length ? <p className="py-8 text-center text-sm text-slate-500">Aucun résultat.</p> : null}
      </section> : null}
      {data.type === "commune" ? <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section><h2 className="text-2xl font-black text-slate-950">{t.related}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{data.relatedCommunes.map((item) => <Link key={item.id} href={item.href} className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold hover:border-red-300">{label(item)}</Link>)}</div></section>
        <aside className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-black text-slate-950">{t.practical}</h2><dl className="mt-4 space-y-3 text-sm">{data.entity.address ? <div><dt className="text-xs text-slate-500">Adresse</dt><dd className="mt-1 font-bold">{data.entity.address}</dd></div> : null}{data.entity.phone ? <div><dt className="text-xs text-slate-500">Téléphone</dt><dd className="mt-1 font-bold" dir="ltr">{data.entity.phone}</dd></div> : null}{data.entity.website ? <div><dt className="text-xs text-slate-500">Site web</dt><dd className="mt-1"><a className="font-bold text-red-700 underline" href={data.entity.website} target="_blank" rel="noreferrer">{data.entity.website}</a></dd></div> : null}</dl></aside>
      </div> : null}
      <section id="actualites" className="mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-red-700">Presse locale</p><h2 className="mt-1 text-2xl font-black text-slate-950">{t.news}</h2></div>
          <select aria-label={t.categoryAll} value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="all">{t.categoryAll}</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>
        {articles.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div> : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{t.noNews}</p>}
      </section>
    </main>
  );
}
