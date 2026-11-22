"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Edit3, ExternalLink, MapPin, Plus, Search, Trash2, Upload, UserCheck } from "lucide-react";
import { useCms } from "@/lib/cms-store";
import { loadCmsCommunes, loadCmsProvinces, loadCmsRegions } from "@/lib/supabase-cms";
import { REGIONS_12_METADATA, normalizeTerritorySlug, type OfficialProfile, type TerritoryType } from "@/lib/territories-data";

const inputClass =
  "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-red-700 focus:ring-4 focus:ring-red-100";
const buttonClass =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-sm font-black text-slate-900 transition hover:border-red-700 hover:text-red-700 cursor-pointer";
const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400 cursor-pointer";

type GeoOption = { id: string; name: string; slug: string };

const ROLE_OPTIONS = [
  { value: "Président du Conseil de la région", label: "رئيس مجلس الجهة / Président du Conseil de la région" },
  { value: "Wali de la région et Gouverneur", label: "والي الجهة / Wali de la région" },
  { value: "Gouverneur de la province", label: "عامل الإقليم / Gouverneur" },
  { value: "Président du Conseil provincial", label: "رئيس المجلس الإقليمي / Président du Conseil provincial" },
  { value: "Président du Conseil préfectoral", label: "رئيس مجلس العمالة / Président du Conseil préfectoral" },
  { value: "Président du Conseil communal", label: "رئيس المجلس الجماعي / Président du Conseil communal" },
  { value: "Député parlementaire", label: "نائب برلماني / Député parlementaire" },
  { value: "Conseiller parlementaire", label: "مستشار برلماني / Conseiller parlementaire" },
  { value: "custom", label: "وظيفة مخصصة / Autre rôle..." },
];

export function OfficialsPanel() {
  const { state, notify } = useCms();

  const [officials, setOfficials] = useState<OfficialProfile[]>([]);
  const [isLoadingOfficials, setIsLoadingOfficials] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Live Supabase territory options
  const [regions, setRegions] = useState<GeoOption[]>([]);
  const [provinces, setProvinces] = useState<GeoOption[]>([]);
  const [communes, setCommunes] = useState<GeoOption[]>([]);

  // Search & list filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | TerritoryType>("all");
  const [filterRegionSlug, setFilterRegionSlug] = useState<string>("");

  // Editor form state
  const [editingId, setEditingId] = useState<string>("");
  const [territoryType, setTerritoryType] = useState<TerritoryType>("region");
  const [regionId, setRegionId] = useState<string>("");
  const [provinceId, setProvinceId] = useState<string>("");
  const [communeId, setCommuneId] = useState<string>("");

  const [fullNameAr, setFullNameAr] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Président du Conseil de la région");
  const [customRole, setCustomRole] = useState("");
  const [house, setHouse] = useState<"conseil" | "chambre_representants" | "chambre_conseillers">("conseil");
  const [party, setParty] = useState("");
  const [mandateStart, setMandateStart] = useState("2021");
  const [mandateEnd, setMandateEnd] = useState("2026");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState<boolean>(true);

  const loadOfficialsList = async () => {
    setIsLoadingOfficials(true);
    try {
      const res = await fetch("/api/territoires/officials", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.officials)) {
        setOfficials(data.officials);
      }
    } catch {
      notify("error", "Could not load elected officials from server.");
    } finally {
      setIsLoadingOfficials(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetch("/api/territoires/officials", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data?.officials)) {
          setOfficials(data.officials);
        }
      })
      .catch(() => {
        if (active) notify("error", "Could not load elected officials from server.");
      })
      .finally(() => {
        if (active) setIsLoadingOfficials(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load regions from Supabase (with CMS fallback)
  useEffect(() => {
    let active = true;
    void loadCmsRegions()
      .then((rawRows) => {
        if (!active) return;
        const rows = (rawRows ?? []) as Array<{ id: string; name: string | null; slug: string | null }>;
        if (rows.length > 0) {
          const mapped = rows.map((r) => ({
            id: r.id,
            name: r.name || r.slug || r.id,
            slug: r.slug || r.id,
          }));
          setRegions(mapped);
          setRegionId((prev) => prev || mapped[0]?.id || "");
          return;
        }
        const fallback = state.regions.map((r) => ({ id: r.id, name: r.name, slug: r.slug }));
        setRegions(fallback);
        setRegionId((prev) => prev || fallback[0]?.id || "");
      })
      .catch(() => {
        if (!active) return;
        const fallback = state.regions.map((r) => ({ id: r.id, name: r.name, slug: r.slug }));
        setRegions(fallback);
        setRegionId((prev) => prev || fallback[0]?.id || "");
      });
    return () => {
      active = false;
    };
  }, [state.regions]);

  // Load provinces when region changes
  useEffect(() => {
    if (!regionId) return;
    let active = true;
    void loadCmsProvinces(regionId)
      .then((rawRows) => {
        if (!active) return;
        const rows = (rawRows ?? []) as Array<{ id: string; name: string | null; slug: string | null }>;
        if (rows.length > 0) {
          setProvinces(
            rows.map((p) => ({
              id: p.id,
              name: p.name || p.slug || p.id,
              slug: p.slug || p.id,
            }))
          );
          return;
        }
        const localReg = state.regions.find((r) => r.id === regionId);
        setProvinces(localReg?.provinces.map((p) => ({ id: p.id, name: p.name, slug: p.slug })) ?? []);
      })
      .catch(() => {
        if (!active) return;
        const localReg = state.regions.find((r) => r.id === regionId);
        setProvinces(localReg?.provinces.map((p) => ({ id: p.id, name: p.name, slug: p.slug })) ?? []);
      });
    return () => {
      active = false;
    };
  }, [regionId, state.regions]);

  // Load communes when province changes
  useEffect(() => {
    if (!provinceId) return;
    let active = true;
    void loadCmsCommunes(provinceId)
      .then((rawRows) => {
        if (!active) return;
        const rows = (rawRows ?? []) as Array<{ id: string; name: string | null; slug: string | null }>;
        if (rows.length > 0) {
          setCommunes(
            rows.map((c) => ({
              id: c.id,
              name: c.name || c.slug || c.id,
              slug: c.slug || c.id,
            }))
          );
          return;
        }
        const localProv = state.regions.flatMap((r) => r.provinces).find((p) => p.id === provinceId);
        setCommunes(localProv?.communes.map((c) => ({ id: c.id, name: c.name, slug: c.slug })) ?? []);
      })
      .catch(() => {
        if (!active) return;
        const localProv = state.regions.flatMap((r) => r.provinces).find((p) => p.id === provinceId);
        setCommunes(localProv?.communes.map((c) => ({ id: c.id, name: c.name, slug: c.slug })) ?? []);
      });
    return () => {
      active = false;
    };
  }, [provinceId, state.regions]);

  const selectedRegion = regions.find((r) => r.id === regionId);
  const selectedProvince = provinces.find((p) => p.id === provinceId);
  const selectedCommune = communes.find((c) => c.id === communeId);

  const placementPreviewUrl = useMemo(() => {
    if (territoryType === "commune" && selectedCommune) {
      return `/commune/${selectedCommune.slug}`;
    }
    if (territoryType === "province" && selectedProvince) {
      return `/province/${selectedProvince.slug}`;
    }
    if (selectedRegion) {
      return `/region/${selectedRegion.slug}`;
    }
    return "/region/...";
  }, [territoryType, selectedRegion, selectedProvince, selectedCommune]);

  const resetForm = () => {
    setEditingId("");
    setFullName("");
    setFullNameAr("");
    setCustomRole("");
    setParty("");
    setMandateStart("2021");
    setMandateEnd("2026");
    setBio("");
    setPhotoUrl("");
    setDisplayOrder(officials.length + 1);
    setIsPublished(true);
  };

  const handlePhotoUpload = async (file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      notify("error", "Photo must be 2MB or smaller.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      notify("error", "Photo must be JPG, PNG, or WebP.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "officials");

      const res = await fetch("/api/territoires/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed.");
      }
      setPhotoUrl(data.url);
      notify("success", "Profile photo uploaded to Supabase Storage.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Photo upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedName = fullName.trim() || fullNameAr.trim();
    if (!resolvedName) {
      notify("error", "Please enter the official's name (Arabic or French/Latin).");
      return;
    }
    if (territoryType === "region" && !selectedRegion) {
      notify("error", "Please select the target Region.");
      return;
    }
    if (territoryType === "province" && !selectedProvince) {
      notify("error", "Please select the target Province or Prefecture.");
      return;
    }
    if (territoryType === "commune" && !selectedCommune) {
      notify("error", "Please select the target Commune.");
      return;
    }

    const effectiveRole = role === "custom" ? customRole.trim() : role;
    if (!effectiveRole) {
      notify("error", "Please select or enter the role/title.");
      return;
    }

    setIsSaving(true);
    try {
      const isUuid = (v?: string) => Boolean(v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v));
      const payload = {
        id: editingId || undefined,
        territoryType,
        regionId: territoryType === "region" && isUuid(selectedRegion?.id) ? selectedRegion?.id : undefined,
        provinceId: territoryType === "province" && isUuid(selectedProvince?.id) ? selectedProvince?.id : undefined,
        communeId: territoryType === "commune" && isUuid(selectedCommune?.id) ? selectedCommune?.id : undefined,
        regionSlug: selectedRegion?.slug,
        provinceSlug: territoryType !== "region" ? selectedProvince?.slug : undefined,
        communeSlug: territoryType === "commune" ? selectedCommune?.slug : undefined,
        fullName: resolvedName,
        fullNameAr: fullNameAr.trim() || undefined,
        role: effectiveRole,
        house,
        party: party.trim() || undefined,
        mandateStart: mandateStart.trim() || "2021",
        mandateEnd: mandateEnd.trim() || "2026",
        bio: bio.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
        displayOrder: Number(displayOrder) || 1,
        isPublished,
      };

      const res = await fetch("/api/territoires/officials", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not save official profile.");
      }

      setOfficials((prev) => {
        const exists = prev.some((item) => item.id === data.official.id);
        return exists
          ? prev.map((item) => (item.id === data.official.id ? data.official : item))
          : [data.official, ...prev];
      });
      notify("success", editingId ? "Official profile updated on public page." : "Official profile published to public page!");
      resetForm();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Failed to save official profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (official: OfficialProfile) => {
    setEditingId(official.id);
    setTerritoryType(official.territoryType);

    const matchedReg = regions.find(
      (r) =>
        r.id === official.regionId ||
        r.slug === official.regionSlug ||
        (official.regionSlug && normalizeTerritorySlug(r.slug) === normalizeTerritorySlug(official.regionSlug))
    );
    if (matchedReg) setRegionId(matchedReg.id);
    if (official.provinceId) setProvinceId(official.provinceId);
    if (official.communeId) setCommuneId(official.communeId);

    setFullName(official.fullName || "");
    setFullNameAr(official.fullNameAr || "");
    const knownRole = ROLE_OPTIONS.some((opt) => opt.value === official.role);
    if (knownRole) {
      setRole(official.role);
      setCustomRole("");
    } else {
      setRole("custom");
      setCustomRole(official.role || "");
    }
    setHouse(official.house || "conseil");
    setParty(official.party || "");
    setMandateStart(official.mandateStart || "2021");
    setMandateEnd(official.mandateEnd || "2026");
    setBio(official.bio || "");
    setPhotoUrl(official.photoUrl || "");
    setDisplayOrder(official.displayOrder || 1);
    setIsPublished(official.isPublished);
  };

  const handleDelete = async (official: OfficialProfile) => {
    try {
      const res = await fetch(`/api/territoires/officials?id=${encodeURIComponent(official.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      setOfficials((prev) => prev.filter((item) => item.id !== official.id));
      if (editingId === official.id) resetForm();
      notify("warning", `Removed "${official.fullNameAr || official.fullName}".`);
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Could not delete profile.");
    }
  };

  const publicHrefForOfficial = (o: OfficialProfile) => {
    if (o.territoryType === "commune" && o.communeSlug) {
      return `/commune/${encodeURIComponent(o.communeSlug)}`;
    }
    if (o.territoryType === "province" && o.provinceSlug) {
      return `/province/${encodeURIComponent(o.provinceSlug)}`;
    }
    if (o.regionSlug) {
      const regMatch = REGIONS_12_METADATA.find(
        (r) => r.slug === normalizeTerritorySlug(o.regionSlug || "") || r.arabicSlug === o.regionSlug
      );
      return `/region/${encodeURIComponent(regMatch?.arabicSlug || o.regionSlug)}`;
    }
    return "/";
  };

  const filteredOfficials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return officials.filter((o) => {
      if (filterType !== "all" && o.territoryType !== filterType) return false;
      if (filterRegionSlug && normalizeTerritorySlug(o.regionSlug || "") !== normalizeTerritorySlug(filterRegionSlug)) {
        return false;
      }
      if (!q) return true;
      return (
        o.fullName.toLowerCase().includes(q) ||
        (o.fullNameAr || "").toLowerCase().includes(q) ||
        o.role.toLowerCase().includes(q) ||
        (o.party || "").toLowerCase().includes(q) ||
        (o.regionSlug || "").toLowerCase().includes(q) ||
        (o.provinceSlug || "").toLowerCase().includes(q) ||
        (o.communeSlug || "").toLowerCase().includes(q)
      );
    });
  }, [officials, filterType, filterRegionSlug, searchQuery]);

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_520px]">
      {/* LEFT: Published Officials List */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950">
              <UserCheck className="size-5 text-red-700" />
              <span>Elected Officials & Profiles ({filteredOfficials.length})</span>
            </h2>
            <p className="mt-1 text-xs font-bold text-slate-500">
              Every profile added here renders automatically on its Region, Province/Prefecture, or Commune page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadOfficialsList()}
            className={buttonClass}
          >
            Refresh list
          </button>
        </div>

        {/* Filters */}
        <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, role, party, territory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | TerritoryType)}
            className={inputClass}
          >
            <option value="all">All levels</option>
            <option value="region">Regions</option>
            <option value="province">Provinces / Pref.</option>
            <option value="commune">Communes</option>
          </select>
          <select
            value={filterRegionSlug}
            onChange={(e) => setFilterRegionSlug(e.target.value)}
            className={inputClass}
          >
            <option value="">All 12 regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {isLoadingOfficials ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
            Loading official profiles…
          </div>
        ) : filteredOfficials.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
            No profiles match the current filter. Use the editor on the right to add an official.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredOfficials.map((o) => {
              const targetHref = publicHrefForOfficial(o);
              const placementLabel = [o.regionSlug, o.provinceSlug, o.communeSlug].filter(Boolean).join(" / ");
              return (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3.5">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {o.photoUrl ? (
                        <Image
                          src={o.photoUrl}
                          alt={o.fullNameAr || o.fullName}
                          fill
                          sizes="56px"
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-900 text-xs font-black text-white">
                          {(o.fullNameAr || o.fullName).slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-black text-slate-950" dir="auto">
                          {o.fullNameAr || o.fullName}
                        </p>
                        {o.fullNameAr && o.fullName !== o.fullNameAr ? (
                          <span className="text-xs font-bold text-slate-400">({o.fullName})</span>
                        ) : null}
                        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-black uppercase text-red-700">
                          {o.territoryType}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs font-bold text-slate-700" dir="auto">
                        {o.role} {o.party ? `· ${o.party}` : ""} · {o.mandateStart}–{o.mandateEnd}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-slate-500" dir="auto">
                        <MapPin className="size-3 shrink-0 text-red-700" />
                        <span>{placementLabel || "Morocco"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={targetHref}
                      target="_blank"
                      className={buttonClass}
                    >
                      <ExternalLink className="size-3.5" />
                      <span>View</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleEdit(o)}
                      className={buttonClass}
                    >
                      <Edit3 className="size-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(o)}
                      className={buttonClass}
                    >
                      <Trash2 className="size-3.5 text-red-700" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* RIGHT: Add / Edit Profile & Exact Placement Form */}
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm self-start">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-black text-slate-950">
            {editingId ? "Edit official profile" : "Add official profile"}
          </h2>
          {editingId ? (
            <button type="button" onClick={resetForm} className={buttonClass}>
              + New profile
            </button>
          ) : null}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 grid gap-4">
          {/* 1. EXACT PLACEMENT */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wide text-red-700">
                1. Exact Placement (Emplacement exact)
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Target page: <code className="text-slate-900">{placementPreviewUrl}</code>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(["region", "province", "commune"] as TerritoryType[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setTerritoryType(lvl);
                    if (lvl === "region") setRole("Président du Conseil de la région");
                    if (lvl === "province") setRole("Président du Conseil provincial");
                    if (lvl === "commune") setRole("Président du Conseil communal");
                  }}
                  className={`min-h-10 rounded-md px-2 text-xs font-black uppercase transition cursor-pointer ${
                    territoryType === lvl
                      ? "bg-red-700 text-white shadow-xs"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-red-700"
                  }`}
                >
                  {lvl === "region" ? "Region" : lvl === "province" ? "Province / Pref." : "Commune"}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                Region *
              </label>
              <select
                value={regionId}
                onChange={(e) => {
                  setRegionId(e.target.value);
                  setProvinceId("");
                  setCommuneId("");
                }}
                className={inputClass}
                dir="auto"
              >
                <option value="">Select Region...</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {territoryType !== "region" ? (
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                  Province / Prefecture *
                </label>
                <select
                  value={provinceId}
                  onChange={(e) => {
                    setProvinceId(e.target.value);
                    setCommuneId("");
                  }}
                  className={inputClass}
                  dir="auto"
                >
                  <option value="">Select Province / Prefecture...</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {territoryType === "commune" ? (
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                  Commune *
                </label>
                <select
                  value={communeId}
                  onChange={(e) => setCommuneId(e.target.value)}
                  disabled={!provinceId}
                  className={inputClass}
                  dir="auto"
                >
                  <option value="">{provinceId ? "Select Commune..." : "Select Province first"}</option>
                  {communes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {/* 2. PHOTO UPLOAD */}
          <div>
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
              2. Profile Photo (Supabase Storage)
            </span>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt="Profile preview"
                    fill
                    sizes="64px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-black text-slate-400">
                    IMG
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <label className={buttonClass}>
                    <Upload className="size-3.5" />
                    <span>{isUploading ? "Uploading…" : "Upload Photo"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isUploading}
                      className="sr-only"
                      onChange={(e) => {
                        void handlePhotoUpload(e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {photoUrl ? (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl("")}
                      className={buttonClass}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  type="url"
                  placeholder="Or paste image URL (https://...)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="min-h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-red-700"
                />
              </div>
            </div>
          </div>

          {/* 3. NAMES & ROLE */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                Full Name (Arabic) *
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="مثال: الخطاط ينجا"
                value={fullNameAr}
                onChange={(e) => setFullNameAr(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                Full Name (French / Latin)
              </label>
              <input
                type="text"
                placeholder="Ex: El Khattat Yanja"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
              Role / Title *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {role === "custom" ? (
              <input
                type="text"
                dir="auto"
                required
                placeholder="Enter custom role (e.g. رئيس جماعة...)"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className={`${inputClass} mt-2`}
              />
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                Body / Chamber
              </label>
              <select
                value={house}
                onChange={(e) => setHouse(e.target.value as "conseil" | "chambre_representants" | "chambre_conseillers")}
                className={inputClass}
              >
                <option value="conseil">Conseil / Executive</option>
                <option value="chambre_representants">Chambre des représentants</option>
                <option value="chambre_conseillers">Chambre des conseillers</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                Political Party
              </label>
              <input
                type="text"
                dir="auto"
                placeholder="RNI, PAM, الاستقلال..."
                value={party}
                onChange={(e) => setParty(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-3 grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                Start
              </label>
              <input
                type="text"
                value={mandateStart}
                onChange={(e) => setMandateStart(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                End
              </label>
              <input
                type="text"
                value={mandateEnd}
                onChange={(e) => setMandateEnd(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                Order #
              </label>
              <input
                type="number"
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
              Biography / Career Notes
            </label>
            <textarea
              rows={3}
              dir="auto"
              placeholder="المسار المهني والسياسي..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`${inputClass} min-h-20 py-2.5`}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-bold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            <span>Publish immediately on public territory page</span>
          </label>

          <button
            type="submit"
            disabled={isSaving || isUploading}
            className={`${primaryButtonClass} min-h-12 w-full`}
          >
            <Plus className="size-4" />
            <span>
              {isSaving
                ? "Saving to Supabase…"
                : editingId
                ? "Update official profile"
                : "Save & Publish official"}
            </span>
          </button>
        </form>
      </aside>
    </div>
  );
}
