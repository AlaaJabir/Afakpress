"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useCms } from "@/lib/cms-store";

type TerritoryType = "region" | "province" | "commune";
type Official = {
  id: string;
  territory_type: TerritoryType;
  region_id: string | null;
  province_id: string | null;
  commune_id: string | null;
  full_name: string;
  full_name_ar: string | null;
  role: string;
  house: "conseil" | "chambre_representants" | "chambre_conseillers" | null;
  party: string | null;
  mandate_start: string | null;
  mandate_end: string | null;
  bio: string | null;
  photo_path: string | null;
  display_order: number;
  is_published: boolean;
};

type Draft = Omit<Official, "id"> & { id?: string };
type ArticleTerritoryLink = { id: string; article_id: string; territory_type: TerritoryType; region_id: string | null; province_id: string | null; commune_id: string | null };
const emptyDraft: Draft = {
  territory_type: "region",
  region_id: "",
  province_id: null,
  commune_id: null,
  full_name: "",
  full_name_ar: "",
  role: "",
  house: null,
  party: "",
  mandate_start: "",
  mandate_end: "",
  bio: "",
  photo_path: "",
  display_order: 0,
  is_published: false,
};

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

async function compressImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  if (file.size > 2 * 1024 * 1024) throw new Error("Image must be 2 MB or smaller.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image processing is not available in this browser.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not compress image.")), "image/webp", 0.82);
  });
  if (blob.size > 2 * 1024 * 1024) throw new Error("Compressed image is still larger than 2 MB.");
  return blob;
}

export function TerritoriesAdminPanel() {
  const { state, notify } = useCms();
  const [officials, setOfficials] = useState<Official[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [regionSearch, setRegionSearch] = useState("");
  const [articleLinks, setArticleLinks] = useState<ArticleTerritoryLink[]>([]);
  const [linkArticleId, setLinkArticleId] = useState("");
  const [linkType, setLinkType] = useState<TerritoryType>("region");
  const [linkRegionId, setLinkRegionId] = useState("");
  const [linkProvinceId, setLinkProvinceId] = useState("");
  const [linkCommuneId, setLinkCommuneId] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);

  const regions = state.regions;
  const selectedRegion = regions.find((item) => item.id === draft.region_id);
  const provinces = selectedRegion?.provinces ?? [];
  const selectedProvince = provinces.find((item) => item.id === draft.province_id);
  const communes = selectedProvince?.communes ?? [];
  const linkRegion = regions.find((item) => item.id === linkRegionId);
  const linkProvinces = linkRegion?.provinces ?? [];
  const linkProvince = linkProvinces.find((item) => item.id === linkProvinceId);
  const linkCommunes = linkProvince?.communes ?? [];
  const filteredOfficials = useMemo(() => officials.filter((official) => {
    const term = regionSearch.trim().toLocaleLowerCase();
    if (!term) return true;
    return [official.full_name, official.full_name_ar, official.role, official.party]
      .some((value) => value?.toLocaleLowerCase().includes(term));
  }), [officials, regionSearch]);

  const loadOfficials = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/territory-officials", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load elected officials.");
      setOfficials(result.data ?? []);
    } catch (loadError) {
      setError(messageFrom(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadArticleLinks = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/article-territories", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load article-territory links.");
      setArticleLinks(result.data ?? []);
    } catch (loadError) {
      setError(messageFrom(loadError));
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOfficials();
      void loadArticleLinks();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadOfficials, loadArticleLinks]);

  function editOfficial(official: Official) {
    const provinceEntry = official.province_id
      ? regions.map((region) => ({ region, province: region.provinces.find((item) => item.id === official.province_id) })).find((entry) => entry.province)
      : null;
    const communeEntry = official.commune_id
      ? regions.map((region) => region.provinces.map((province) => ({ region, province, commune: province.communes.find((item) => item.id === official.commune_id) }))).flat().find((entry) => entry.commune)
      : null;
    const parentRegionId = official.territory_type === "region"
      ? official.region_id ?? ""
      : provinceEntry?.region.id ?? communeEntry?.region.id ?? "";
    setDraft({
      ...official,
      region_id: parentRegionId,
      province_id: official.province_id,
      commune_id: official.commune_id,
    });
    const supabase = createBrowserSupabaseClient();
    setPhotoPreview(official.photo_path && supabase
      ? supabase.storage.from("territory-media").getPublicUrl(official.photo_path).data.publicUrl
      : "");
  }

  function changeTerritoryType(type: TerritoryType) {
    setDraft((current) => ({
      ...current,
      territory_type: type,
      region_id: type === "region" ? current.region_id : "",
      province_id: null,
      commune_id: null,
    }));
  }

  async function uploadPhoto(file: File) {
    setPhotoBusy(true);
    setError("");
    let uploadedPath = "";
    try {
      const blob = await compressImage(file);
      const supabase = createBrowserSupabaseClient();
      if (!supabase) throw new Error("Supabase public configuration is missing.");
      const ticketResponse = await fetch("/api/admin/territory-upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contentType: "image/webp" }),
      });
      const ticket = await ticketResponse.json();
      if (!ticketResponse.ok) throw new Error(ticket.error || "Could not prepare image upload.");
      uploadedPath = ticket.path;
      const { error: uploadError } = await supabase.storage
        .from("territory-media")
        .uploadToSignedUrl(ticket.path, ticket.token, blob, { contentType: "image/webp", upsert: false });
      if (uploadError) throw uploadError;
      setDraft((current) => ({ ...current, photo_path: uploadedPath }));
      setPhotoPreview(supabase.storage.from("territory-media").getPublicUrl(uploadedPath).data.publicUrl);
      notify("success", "Photo uploaded to Supabase Storage.");
    } catch (uploadError) {
      if (uploadedPath) {
        await fetch("/api/admin/territory-upload", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ path: uploadedPath }),
        }).catch(() => undefined);
      }
      setError(messageFrom(uploadError));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function saveOfficial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...draft,
      region_id: draft.territory_type === "region" ? draft.region_id : null,
      province_id: draft.territory_type === "province" ? draft.province_id : null,
      commune_id: draft.territory_type === "commune" ? draft.commune_id : null,
      mandate_start: draft.mandate_start || null,
      mandate_end: draft.mandate_end || null,
    };
    try {
      const response = await fetch("/api/admin/territory-officials", {
        method: draft.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save official.");
      await loadOfficials();
      setDraft(emptyDraft);
      setPhotoPreview("");
      notify("success", draft.id ? "Official updated." : "Official added.");
    } catch (saveError) {
      setError(messageFrom(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function reorderOfficial(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const reordered = [...officials];
    const sourceIndex = reordered.findIndex((item) => item.id === sourceId);
    const targetIndex = reordered.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    const normalized = reordered.map((item, index) => ({ ...item, display_order: index + 1 }));
    setOfficials(normalized);
    try {
      await Promise.all(normalized.map(async (item) => {
        const response = await fetch("/api/admin/territory-officials", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Could not reorder officials.");
        }
      }));
      notify("success", "Official order updated.");
    } catch (orderError) {
      setError(messageFrom(orderError));
      await loadOfficials();
    }
  }

  async function deleteOfficial(official: Official) {
    if (!window.confirm(`Delete ${official.full_name}? This also removes their uploaded photo.`)) return;
    try {
      const response = await fetch(`/api/admin/territory-officials?id=${encodeURIComponent(official.id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete official.");
      setOfficials((current) => current.filter((item) => item.id !== official.id));
      if (draft.id === official.id) {
        setDraft(emptyDraft);
        setPhotoPreview("");
      }
      notify("success", "Official deleted.");
    } catch (deleteError) {
      setError(messageFrom(deleteError));
    }
  }

  async function createArticleLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLinkBusy(true);
    setError("");
    const payload = {
      article_id: linkArticleId,
      territory_type: linkType,
      region_id: linkType === "region" ? linkRegionId : null,
      province_id: linkType === "province" ? linkProvinceId : null,
      commune_id: linkType === "commune" ? linkCommuneId : null,
    };
    try {
      const response = await fetch("/api/admin/article-territories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not link article.");
      setArticleLinks((current) => [result.data, ...current]);
      setLinkArticleId("");
      notify("success", "Article linked to territory.");
    } catch (linkError) {
      setError(messageFrom(linkError));
    } finally {
      setLinkBusy(false);
    }
  }

  async function removeArticleLink(link: ArticleTerritoryLink) {
    try {
      const response = await fetch(`/api/admin/article-territories?id=${encodeURIComponent(link.id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not remove article link.");
      setArticleLinks((current) => current.filter((item) => item.id !== link.id));
      notify("success", "Article territory link removed.");
    } catch (linkError) {
      setError(messageFrom(linkError));
    }
  }

  const inputClass = "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-100";
  const labelClass = "mb-1 block text-xs font-black text-slate-600";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">Elected officials</h2>
            <p className="mt-1 text-sm text-slate-500">Manage profiles and publication status for each territory.</p>
          </div>
          <button type="button" onClick={() => { setDraft(emptyDraft); setPhotoPreview(""); }} className="min-h-11 rounded-md bg-red-700 px-4 text-sm font-bold text-white hover:bg-red-800">New official</button>
        </div>
        <label className="mt-5 block">
          <span className={labelClass}>Search officials</span>
          <input className={inputClass} value={regionSearch} onChange={(event) => setRegionSearch(event.target.value)} placeholder="Name, role, or party" />
        </label>
        {error ? <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
        {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading officials…</p> : filteredOfficials.length ? (
          <div className="mt-5 divide-y divide-slate-100">
            {filteredOfficials.map((official) => {
              const target = official.territory_type === "region"
                ? regions.find((item) => item.id === official.region_id)?.name
                : official.territory_type === "province"
                  ? regions.flatMap((item) => item.provinces).find((item) => item.id === official.province_id)?.name
                  : regions.flatMap((item) => item.provinces.flatMap((province) => province.communes)).find((item) => item.id === official.commune_id)?.name;
              const supabase = createBrowserSupabaseClient();
              const photo = official.photo_path && supabase ? supabase.storage.from("territory-media").getPublicUrl(official.photo_path).data.publicUrl : "";
              return (
                <article key={official.id} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", official.id); event.dataTransfer.effectAllowed = "move"; }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void reorderOfficial(event.dataTransfer.getData("text/plain"), official.id); }} className="flex flex-wrap items-center gap-3 py-4">
                  {photo ? <Image src={photo} alt="" width={52} height={52} className="h-13 w-13 rounded-full object-cover" /> : <div className="flex h-13 w-13 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-slate-500">{official.full_name.slice(0, 1)}</div>}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-900">{official.full_name}</p>
                    <p className="text-xs text-slate-500">{official.role} · {target || official.territory_type}</p>
                    <p className="text-xs text-slate-500">{official.is_published ? "Published" : "Draft"}</p>
                  </div>
                  <button type="button" className="min-h-11 rounded-md border border-slate-300 px-3 text-xs font-bold" onClick={() => editOfficial(official)}>Edit</button>
                  <button type="button" className="min-h-11 rounded-md border border-red-200 px-3 text-xs font-bold text-red-700" onClick={() => void deleteOfficial(official)}>Delete</button>
                </article>
              );
            })}
          </div>
        ) : <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No officials yet. Add verified profiles from the form.</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">{draft.id ? "Edit official" : "Add official"}</h2>
        <form className="mt-5 space-y-4" onSubmit={saveOfficial}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className={labelClass}>Territory type</span><select className={inputClass} value={draft.territory_type} onChange={(event) => changeTerritoryType(event.target.value as TerritoryType)}><option value="region">Region</option><option value="province">Province / Prefecture</option><option value="commune">Commune</option></select></label>
            {draft.territory_type === "region" ? (
              <label><span className={labelClass}>Region</span><select required className={inputClass} value={draft.region_id ?? ""} onChange={(event) => setDraft((current) => ({ ...current, region_id: event.target.value }))}><option value="">Select region</option>{regions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            ) : (
              <label><span className={labelClass}>Region</span><select required className={inputClass} value={draft.region_id ?? ""} onChange={(event) => setDraft((current) => ({ ...current, region_id: event.target.value, province_id: null, commune_id: null }))}><option value="">Select region</option>{regions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            )}
          </div>
          {draft.territory_type !== "region" ? (
            <label className="block"><span className={labelClass}>Province / Prefecture</span><select required className={inputClass} value={draft.province_id ?? ""} onChange={(event) => setDraft((current) => ({ ...current, province_id: event.target.value, commune_id: null }))}><option value="">Select province</option>{provinces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          ) : null}
          {draft.territory_type === "commune" ? (
            <label className="block"><span className={labelClass}>Commune</span><select required className={inputClass} value={draft.commune_id ?? ""} onChange={(event) => setDraft((current) => ({ ...current, commune_id: event.target.value }))}><option value="">Select commune</option>{communes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className={labelClass}>Full name (FR)</span><input required maxLength={180} className={inputClass} value={draft.full_name} onChange={(event) => setDraft((current) => ({ ...current, full_name: event.target.value }))} /></label>
            <label><span className={labelClass}>Full name (AR)</span><input dir="rtl" className={inputClass} value={draft.full_name_ar ?? ""} onChange={(event) => setDraft((current) => ({ ...current, full_name_ar: event.target.value }))} /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className={labelClass}>Role / position</span><input required maxLength={180} className={inputClass} value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))} /></label>
            <label><span className={labelClass}>Political party</span><input className={inputClass} value={draft.party ?? ""} onChange={(event) => setDraft((current) => ({ ...current, party: event.target.value }))} /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className={labelClass}>House / council</span><select className={inputClass} value={draft.house ?? ""} onChange={(event) => setDraft((current) => ({ ...current, house: (event.target.value || null) as Draft["house"] }))}><option value="">Not specified</option><option value="conseil">Conseil</option><option value="chambre_representants">Chambre des représentants</option><option value="chambre_conseillers">Chambre des conseillers</option></select></label>
            <label><span className={labelClass}>Display order</span><input type="number" className={inputClass} value={draft.display_order} onChange={(event) => setDraft((current) => ({ ...current, display_order: Number(event.target.value) }))} /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className={labelClass}>Mandate start</span><input type="date" className={inputClass} value={draft.mandate_start ?? ""} onChange={(event) => setDraft((current) => ({ ...current, mandate_start: event.target.value }))} /></label>
            <label><span className={labelClass}>Mandate end</span><input type="date" className={inputClass} value={draft.mandate_end ?? ""} onChange={(event) => setDraft((current) => ({ ...current, mandate_end: event.target.value }))} /></label>
          </div>
          <label className="block"><span className={labelClass}>Biography</span><textarea rows={3} className={inputClass} value={draft.bio ?? ""} onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))} /></label>
          <div>
            <span className={labelClass}>Profile photo (JPEG / PNG / WebP, max 2 MB)</span>
            {photoPreview ? <Image src={photoPreview} alt="Official photo preview" width={88} height={88} className="mb-2 h-22 w-22 rounded-full object-cover" /> : null}
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={photoBusy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPhoto(file); event.currentTarget.value = ""; }} className="block min-h-11 w-full text-sm text-slate-600 file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:font-bold" />
            {photoBusy ? <p className="mt-1 text-xs text-slate-500">Compressing and uploading…</p> : null}
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={draft.is_published} onChange={(event) => setDraft((current) => ({ ...current, is_published: event.target.checked }))} className="h-4 w-4 accent-red-700" /> Publish this profile</label>
          <div className="flex flex-wrap gap-2">
            <button disabled={saving || photoBusy} type="submit" className="min-h-11 rounded-md bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving…" : draft.id ? "Save changes" : "Add official"}</button>
            <button type="button" className="min-h-11 rounded-md border border-slate-300 px-4 text-sm font-bold" onClick={() => { setDraft(emptyDraft); setPhotoPreview(""); }}>Clear</button>
          </div>
        </form>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-xl font-black text-slate-950">Attach news to territories</h2><p className="mt-1 text-sm text-slate-500">One article can be displayed on several territory pages. Existing legacy article location fields remain unchanged.</p></div>
        </div>
        <form onSubmit={createArticleLink} className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label><span className={labelClass}>Existing article</span><select required className={inputClass} value={linkArticleId} onChange={(event) => setLinkArticleId(event.target.value)}><option value="">Select article</option>{state.articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}</select></label>
          <label><span className={labelClass}>Territory type</span><select className={inputClass} value={linkType} onChange={(event) => { setLinkType(event.target.value as TerritoryType); setLinkProvinceId(""); setLinkCommuneId(""); }}><option value="region">Region</option><option value="province">Province / Prefecture</option><option value="commune">Commune</option></select></label>
          <label><span className={labelClass}>Region</span><select required className={inputClass} value={linkRegionId} onChange={(event) => { setLinkRegionId(event.target.value); setLinkProvinceId(""); setLinkCommuneId(""); }}><option value="">Select region</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></label>
          {linkType !== "region" ? <label><span className={labelClass}>Province / Prefecture</span><select required className={inputClass} value={linkProvinceId} onChange={(event) => { setLinkProvinceId(event.target.value); setLinkCommuneId(""); }}><option value="">Select province</option>{linkProvinces.map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}</select></label> : null}
          {linkType === "commune" ? <label><span className={labelClass}>Commune</span><select required className={inputClass} value={linkCommuneId} onChange={(event) => setLinkCommuneId(event.target.value)}><option value="">Select commune</option>{linkCommunes.map((commune) => <option key={commune.id} value={commune.id}>{commune.name}</option>)}</select></label> : null}
          <button disabled={linkBusy} type="submit" className="min-h-11 self-end rounded-md bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50">{linkBusy ? "Linking…" : "Attach article"}</button>
        </form>
        <div className="mt-5 divide-y divide-slate-100">
          {articleLinks.map((link) => {
            const article = state.articles.find((item) => item.id === link.article_id);
            const target = link.territory_type === "region"
              ? regions.find((item) => item.id === link.region_id)?.name
              : link.territory_type === "province"
                ? regions.flatMap((region) => region.provinces).find((item) => item.id === link.province_id)?.name
                : regions.flatMap((region) => region.provinces.flatMap((province) => province.communes)).find((item) => item.id === link.commune_id)?.name;
            return <div key={link.id} className="flex flex-wrap items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{article?.title ?? link.article_id}</p><p className="text-xs text-slate-500">{target ?? link.territory_type} · {link.territory_type}</p></div><button type="button" onClick={() => void removeArticleLink(link)} className="min-h-11 rounded-md border border-red-200 px-3 text-xs font-bold text-red-700">Remove link</button></div>;
          })}
          {!articleLinks.length ? <p className="py-6 text-center text-sm text-slate-500">No additional article-territory links yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
