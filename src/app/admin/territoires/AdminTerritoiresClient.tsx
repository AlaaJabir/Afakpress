"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Map as MapIcon,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import type {
  OfficialProfile,
  TerritoryMapEntry,
  TerritoryType,
} from "@/lib/territories-data";
import { REGIONS_12_METADATA, normalizeTerritorySlug } from "@/lib/territories-data";
import type { AdminTerritoryNode } from "@/lib/territories-db";

interface AdminTerritoiresClientProps {
  adminEmail: string;
  initialOfficials: OfficialProfile[];
  initialMaps: TerritoryMapEntry[];
  regionsTree: AdminTerritoryNode[];
}

function isUuid(value?: string) {
  return Boolean(
    value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

function publicLocationHref(
  item: {
    territoryType: TerritoryType;
    regionSlug?: string;
    provinceSlug?: string;
    communeSlug?: string;
  },
  regionsTree: AdminTerritoryNode[]
) {
  if (item.territoryType === "commune" && item.communeSlug) {
    return `/commune/${encodeURIComponent(item.communeSlug)}`;
  }
  if (item.territoryType === "province" && item.provinceSlug) {
    return `/province/${encodeURIComponent(item.provinceSlug)}`;
  }
  const regionSlug = item.regionSlug;
  if (regionSlug) {
    const treeMatch = regionsTree.find(
      (r) =>
        r.slug === regionSlug ||
        normalizeTerritorySlug(r.slug) === normalizeTerritorySlug(regionSlug)
    );
    const metaMatch = REGIONS_12_METADATA.find(
      (r) =>
        r.slug === normalizeTerritorySlug(regionSlug) ||
        r.arabicSlug === regionSlug
    );
    const finalSlug = treeMatch?.slug || metaMatch?.arabicSlug || regionSlug;
    return `/region/${encodeURIComponent(finalSlug)}`;
  }
  return "/";
}

export function AdminTerritoiresClient({
  adminEmail,
  initialOfficials,
  initialMaps,
  regionsTree,
}: AdminTerritoiresClientProps) {
  const [activeTab, setActiveTab] = useState<"officials" | "maps">("officials");
  const [officials, setOfficials] = useState<OfficialProfile[]>(initialOfficials);
  const [maps, setMaps] = useState<TerritoryMapEntry[]>(initialMaps);
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string; href?: string } | null>(null);

  // Shared territory selector state
  const [territoryType, setTerritoryType] = useState<TerritoryType>("region");
  const [selectedRegionId, setSelectedRegionId] = useState<string>(regionsTree[0]?.id ?? "");
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [selectedCommuneId, setSelectedCommuneId] = useState<string>("");

  // Official form states
  const [fullName, setFullName] = useState("");
  const [fullNameAr, setFullNameAr] = useState("");
  const [role, setRole] = useState("Président du Conseil de la région");
  const [customRole, setCustomRole] = useState("");
  const [house, setHouse] = useState<"conseil" | "chambre_representants" | "chambre_conseillers">("conseil");
  const [party, setParty] = useState("RNI");
  const [mandateStart, setMandateStart] = useState("2021");
  const [mandateEnd, setMandateEnd] = useState("2026");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Map form states
  const [mapUrl, setMapUrl] = useState("");
  const [mapCaption, setMapCaption] = useState("");
  const [isUploadingMap, setIsUploadingMap] = useState(false);

  // Filters & inline delete confirmations
  const [filterType, setFilterType] = useState<string>("all");
  const [mapFilterType, setMapFilterType] = useState<string>("all");
  const [confirmDeleteOfficialId, setConfirmDeleteOfficialId] = useState<string | null>(null);
  const [confirmDeleteMapId, setConfirmDeleteMapId] = useState<string | null>(null);

  const activeRegion = regionsTree.find((r) => r.id === selectedRegionId) ?? regionsTree[0];
  const provinces = activeRegion?.provinces ?? [];
  const activeProvince = provinces.find((p) => p.id === selectedProvinceId);
  const communes = activeProvince?.communes ?? [];
  const activeCommune = communes.find((c) => c.id === selectedCommuneId);

  const activePublicHref =
    territoryType === "commune" && activeCommune
      ? `/commune/${encodeURIComponent(activeCommune.slug)}`
      : territoryType === "province" && activeProvince
      ? `/province/${encodeURIComponent(activeProvince.slug)}`
      : activeRegion
      ? `/region/${encodeURIComponent(activeRegion.slug)}`
      : "/";

  const activeTerritoryName =
    territoryType === "commune" && activeCommune
      ? activeCommune.name
      : territoryType === "province" && activeProvince
      ? activeProvince.name
      : activeRegion?.name || "";

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setNotice({ type: "error", message: "Le fichier dépasse 5 Mo." });
      return;
    }

    setIsUploadingPhoto(true);
    setNotice(null);

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
        throw new Error(data.error || "Échec du téléversement");
      }

      setPhotoUrl(data.url);
      setNotice({ type: "success", message: "Photo téléversée avec succès dans Supabase Storage !" });
    } catch (err: unknown) {
      setNotice({ type: "error", message: err instanceof Error ? err.message : "Erreur de téléversement" });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleMapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setNotice({ type: "error", message: "L'image de la carte dépasse 5 Mo." });
      return;
    }

    setIsUploadingMap(true);
    setNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "maps");

      const res = await fetch("/api/territoires/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec du téléversement de la carte");
      }

      setMapUrl(data.url);
      setNotice({ type: "success", message: "Carte téléversée dans Supabase Storage ! Cliquez sur Enregistrer pour la publier." });
    } catch (err: unknown) {
      setNotice({ type: "error", message: err instanceof Error ? err.message : "Erreur de téléversement" });
    } finally {
      setIsUploadingMap(false);
    }
  };

  const handleAddOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setNotice({ type: "error", message: "Veuillez saisir le nom complet de l'élu." });
      return;
    }

    if (territoryType !== "region" && !activeProvince) {
      setNotice({ type: "error", message: "Veuillez sélectionner une province ou préfecture." });
      return;
    }

    if (territoryType === "commune" && !activeCommune) {
      setNotice({ type: "error", message: "Veuillez sélectionner une commune." });
      return;
    }

    const effectiveRole = role === "custom" ? customRole : role;
    if (!effectiveRole.trim()) {
      setNotice({ type: "error", message: "Veuillez préciser la fonction / rôle de l'élu." });
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          territoryType,
          regionId: territoryType === "region" && isUuid(activeRegion?.id) ? activeRegion?.id : undefined,
          provinceId: territoryType === "province" && isUuid(activeProvince?.id) ? activeProvince?.id : undefined,
          communeId: territoryType === "commune" && isUuid(activeCommune?.id) ? activeCommune?.id : undefined,
          regionSlug: activeRegion?.slug,
          provinceSlug: territoryType !== "region" ? activeProvince?.slug : undefined,
          communeSlug: territoryType === "commune" ? activeCommune?.slug : undefined,
          fullName: fullName.trim(),
          fullNameAr: fullNameAr.trim() || undefined,
          role: effectiveRole.trim(),
          house,
          party: party.trim() || undefined,
          mandateStart,
          mandateEnd,
          bio: bio.trim() || undefined,
          photoUrl: photoUrl || undefined,
          displayOrder: officials.length + 1,
          isPublished: true,
        };

        const res = await fetch("/api/territoires/officials", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Erreur lors de l'enregistrement");
        }

        setOfficials((prev) => [data.official, ...prev]);
        setFullName("");
        setFullNameAr("");
        setBio("");
        setPhotoUrl("");
        setNotice({
          type: "success",
          message: `L'élu "${data.official.fullName}" a été ajouté et apparaît désormais automatiquement sur la page publique.`,
          href: activePublicHref,
        });
      } catch (err: unknown) {
        setNotice({ type: "error", message: err instanceof Error ? err.message : "Erreur lors de l'ajout" });
      }
    });
  };

  const handleSaveMap = async (e: React.FormEvent) => {
    e.preventDefault();

    if (territoryType !== "region" && !activeProvince) {
      setNotice({ type: "error", message: "Veuillez sélectionner une province ou préfecture." });
      return;
    }

    if (territoryType === "commune" && !activeCommune) {
      setNotice({ type: "error", message: "Veuillez sélectionner une commune." });
      return;
    }

    if (!mapUrl.trim()) {
      setNotice({ type: "error", message: "Veuillez téléverser l'image de la carte du territoire." });
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          territoryType,
          regionId: isUuid(activeRegion?.id) ? activeRegion?.id : undefined,
          provinceId: territoryType !== "region" && isUuid(activeProvince?.id) ? activeProvince?.id : undefined,
          communeId: territoryType === "commune" && isUuid(activeCommune?.id) ? activeCommune?.id : undefined,
          regionSlug: activeRegion?.slug,
          provinceSlug: territoryType !== "region" ? activeProvince?.slug : undefined,
          communeSlug: territoryType === "commune" ? activeCommune?.slug : undefined,
          territoryName: activeTerritoryName,
          mapUrl: mapUrl.trim(),
          caption: mapCaption.trim() || undefined,
        };

        const res = await fetch("/api/territoires/maps", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Erreur lors de l'enregistrement de la carte");
        }

        const savedMap = data.map as TerritoryMapEntry;
        setMaps((prev) => {
          const remaining = prev.filter((item) => item.id !== savedMap.id);
          return [savedMap, ...remaining];
        });
        setMapUrl("");
        setMapCaption("");
        setNotice({
          type: "success",
          message: `La carte de "${savedMap.territoryName || activeTerritoryName}" a été enregistrée et s'affiche désormais dans sa barre latérale.`,
          href: publicLocationHref(savedMap, regionsTree),
        });
      } catch (err: unknown) {
        setNotice({ type: "error", message: err instanceof Error ? err.message : "Erreur lors de l'enregistrement" });
      }
    });
  };

  const handleDeleteOfficial = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/territoires/officials?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setOfficials((prev) => prev.filter((o) => o.id !== id));
        setConfirmDeleteOfficialId(null);
        setNotice({ type: "success", message: `L'élu "${name}" a été supprimé.` });
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la suppression.");
      }
    } catch (err: unknown) {
      setNotice({ type: "error", message: err instanceof Error ? err.message : "Erreur lors de la suppression." });
    }
  };

  const handleDeleteMap = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/territoires/maps?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMaps((prev) => prev.filter((m) => m.id !== id));
        setConfirmDeleteMapId(null);
        setNotice({ type: "success", message: `La carte de "${name}" a été supprimée.` });
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la suppression.");
      }
    } catch (err: unknown) {
      setNotice({ type: "error", message: err instanceof Error ? err.message : "Erreur lors de la suppression." });
    }
  };

  const filteredOfficials = officials.filter((o) => {
    if (filterType === "all") return true;
    return o.territoryType === filterType;
  });

  const filteredMaps = maps.filter((m) => {
    if (mapFilterType === "all") return true;
    return m.territoryType === mapFilterType;
  });

  const renderTerritorySelectors = () => (
    <>
      {/* Territory Level Select */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
          1. Échelon administratif
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["region", "province", "commune"] as TerritoryType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setTerritoryType(type);
                if (type === "region") {
                  setRole("Président du Conseil de la région");
                } else if (type === "province") {
                  setRole("Président du Conseil provincial");
                } else {
                  setRole("Président du Conseil communal");
                }
              }}
              className={`min-h-10 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                territoryType === type
                  ? "bg-[#1B2A41] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {type === "region" ? "Région" : type === "province" ? "Province" : "Commune"}
            </button>
          ))}
        </div>
      </div>

      {/* Region Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Région</label>
        <select
          value={activeRegion?.id ?? ""}
          onChange={(e) => {
            setSelectedRegionId(e.target.value);
            setSelectedProvinceId("");
            setSelectedCommuneId("");
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
        >
          {regionsTree.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Province Selector (if Province or Commune) */}
      {territoryType !== "region" ? (
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Province / Préfecture</label>
          <select
            value={selectedProvinceId}
            onChange={(e) => {
              setSelectedProvinceId(e.target.value);
              setSelectedCommuneId("");
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
          >
            <option value="">Sélectionnez une province...</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Commune Selector (if Commune) */}
      {territoryType === "commune" && selectedProvinceId ? (
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Commune</label>
          <select
            value={selectedCommuneId}
            onChange={(e) => setSelectedCommuneId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
          >
            <option value="">Sélectionnez une commune...</option>
            {communes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </>
  );

  return (
    <div className="mx-auto max-w-6xl" dir="ltr">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif">
              Gestion des Territoires, Élus & Cartes
            </h1>
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              Supabase Connecté
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Connecté en tant que <span className="font-semibold text-slate-900">{adminEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="size-3.5" />
            <span>Retour Dashboard</span>
          </Link>
          <Link
            href={activePublicHref}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#b91c1c] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#991b1b]"
          >
            <span>Voir la page publique</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab("officials");
            setNotice(null);
          }}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition cursor-pointer ${
            activeTab === "officials"
              ? "bg-[#0b1930] text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Users className="size-4" />
          <span>Élus & Dirigeants ({officials.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("maps");
            setNotice(null);
          }}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition cursor-pointer ${
            activeTab === "maps"
              ? "bg-[#b91c1c] text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <MapIcon className="size-4" />
          <span>Cartes des Territoires — Sidebar ({maps.length})</span>
        </button>
      </div>

      {/* Status Notice */}
      {notice ? (
        <div
          className={`my-5 rounded-xl border p-4 text-sm font-semibold flex flex-wrap items-center justify-between gap-3 ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{notice.message}</span>
          </div>
          <div className="flex items-center gap-3">
            {notice.href ? (
              <Link
                href={notice.href}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              >
                <span>Voir sur le site</span>
                <ExternalLink className="size-3" />
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="inline-flex items-center gap-1 text-xs font-bold hover:underline cursor-pointer"
            >
              <X className="size-3.5" />
              <span>Fermer</span>
            </button>
          </div>
        </div>
      ) : null}

      {activeTab === "officials" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[480px_minmax(0,1fr)] gap-8 mt-6">
          {/* LEFT COLUMN: Add Official Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-950 border-b border-slate-100 pb-3 font-serif">
              Ajouter un profil d’élu / dirigeant
            </h2>

            <form onSubmit={handleAddOfficial} className="mt-5 space-y-4 text-sm">
              {renderTerritorySelectors()}

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom et prénom (FR) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Aziz Rebbah"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom en arabe (AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مثال: عزيز رباح"
                    value={fullNameAr}
                    onChange={(e) => setFullNameAr(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none text-right font-sans"
                  />
                </div>
              </div>

              {/* Role / Function */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fonction / Rôle *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                >
                  <option value="Président du Conseil de la région">Président du Conseil de la région</option>
                  <option value="Wali de la région et Gouverneur">Wali de la région et Gouverneur</option>
                  <option value="Gouverneur de la province">Gouverneur de la province</option>
                  <option value="Président du Conseil provincial">Président du Conseil provincial</option>
                  <option value="Président du Conseil préfectoral">Président du Conseil préfectoral</option>
                  <option value="Président du Conseil communal">Président du Conseil communal</option>
                  <option value="Député parlementaire">Député parlementaire</option>
                  <option value="Conseiller parlementaire">Conseiller parlementaire</option>
                  <option value="custom">Autre rôle personnalisé...</option>
                </select>
                {role === "custom" ? (
                  <input
                    type="text"
                    required
                    placeholder="Saisissez la fonction personnalisée"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                  />
                ) : null}
              </div>

              {/* House & Party */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instance</label>
                  <select
                    value={house}
                    onChange={(e) => setHouse(e.target.value as "conseil" | "chambre_representants" | "chambre_conseillers")}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                  >
                    <option value="conseil">Conseil élu / Autorité</option>
                    <option value="chambre_representants">Chambre des représentants</option>
                    <option value="chambre_conseillers">Chambre des conseillers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parti politique</label>
                  <input
                    type="text"
                    placeholder="Ex: RNI, PAM, PI..."
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>
              </div>

              {/* Mandate Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Début de mandat</label>
                  <input
                    type="text"
                    value={mandateStart}
                    onChange={(e) => setMandateStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fin de mandat</label>
                  <input
                    type="text"
                    value={mandateEnd}
                    onChange={(e) => setMandateEnd(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              {/* Photo Upload to Supabase Storage */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Photo de profil (Supabase Storage)
                </label>
                <div className="flex items-center gap-4">
                  {photoUrl ? (
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-slate-200">
                      <Image
                        src={photoUrl}
                        alt="Aperçu"
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhoto}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isUploadingPhoto ? "Envoi vers Supabase Storage..." : "Max 5 Mo. Formats JPG, PNG, WebP"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Biographie / Présentation</label>
                <textarea
                  rows={3}
                  placeholder="Parcours politique, réalisations majeures..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || isUploadingPhoto}
                className="w-full min-h-12 rounded-xl bg-[#b91c1c] px-4 py-2.5 text-sm font-black text-white shadow-xs transition hover:bg-[#991b1b] disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Enregistrement en cours..." : "Enregistrer et publier l’élu"}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Officials List */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-black text-slate-950 font-serif">
                Profils enregistrés ({filteredOfficials.length})
              </h2>

              {/* Filter buttons */}
              <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                {["all", "region", "province", "commune"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer capitalize ${
                      filterType === t
                        ? "bg-[#0b1930] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t === "all" ? "Tous" : t}
                  </button>
                ))}
              </div>
            </div>

            {filteredOfficials.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                Aucun profil d’élu trouvé dans cette catégorie.
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredOfficials.map((o) => {
                  const targetLink = publicLocationHref(o, regionsTree);
                  const isConfirming = confirmDeleteOfficialId === o.id;

                  return (
                    <div
                      key={o.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative size-13 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                          {o.photoUrl ? (
                            <Image
                              src={o.photoUrl}
                              alt={o.fullName}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-serif text-sm font-bold text-slate-400">
                              {o.fullName.slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm truncate">{o.fullName}</h3>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                              {o.territoryType}
                            </span>
                          </div>
                          <p className="text-xs text-[#b91c1c] font-semibold truncate">{o.role}</p>
                          <p className="text-[11px] text-slate-400">
                            {o.party ? `${o.party} · ` : ""}Mandat {o.mandateStart} – {o.mandateEnd}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={targetLink}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                        >
                          <span>Voir public</span>
                          <ExternalLink className="size-3" />
                        </Link>
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDeleteOfficial(o.id, o.fullName)}
                              className="rounded-lg bg-[#b91c1c] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#991b1b] cursor-pointer"
                            >
                              Confirmer
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteOfficialId(null)}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteOfficialId(o.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                            <span>Supprimer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[480px_minmax(0,1fr)] gap-8 mt-6">
          {/* LEFT COLUMN: Upload Territory Sidebar Map Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-950 border-b border-slate-100 pb-3 font-serif">
              Carte spécifique du territoire (Sidebar)
            </h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Sélectionnez une Région, Province/Préfecture ou Commune et téléversez sa carte dédiée. Elle remplacera automatiquement la carte générale dans la barre latérale de ce territoire.
            </p>

            <form onSubmit={handleSaveMap} className="mt-5 space-y-4 text-sm">
              {renderTerritorySelectors()}

              {/* Target summary */}
              {activeTerritoryName ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs">
                  <span className="font-semibold text-slate-500">Territoire ciblé : </span>
                  <span className="font-black text-[#0b1930]">{activeTerritoryName}</span>
                </div>
              ) : null}

              {/* Map Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Image de la carte (Supabase Storage) *
                </label>

                {mapUrl ? (
                  <div className="mb-3 relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <Image
                      src={mapUrl}
                      alt="Aperçu de la carte"
                      fill
                      className="object-contain p-2"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setMapUrl("")}
                      aria-label="Retirer l'image"
                      className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow-xs border border-slate-200 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : null}

                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-4 py-5 text-center transition hover:border-[#b91c1c]/60 hover:bg-red-50/30 cursor-pointer">
                  <Upload className="size-5 text-[#b91c1c]" />
                  <span className="text-xs font-bold text-slate-700">
                    {isUploadingMap
                      ? "Téléversement vers Supabase Storage..."
                      : mapUrl
                      ? "Changer l’image de la carte"
                      : "Choisir l’image de la carte (JPG, PNG, WebP · max 5 Mo)"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleMapUpload}
                    disabled={isUploadingMap}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Optional Caption */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Légende / Description (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Découpage territorial et limites administratives"
                  value={mapCaption}
                  onChange={(e) => setMapCaption(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || isUploadingMap || !mapUrl}
                className="w-full min-h-12 rounded-xl bg-[#b91c1c] px-4 py-2.5 text-sm font-black text-white shadow-xs transition hover:bg-[#991b1b] disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Enregistrement en cours..." : "Enregistrer et publier la carte"}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Published Territory Maps List */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-black text-slate-950 font-serif">
                Cartes publiées ({filteredMaps.length})
              </h2>

              <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                {["all", "region", "province", "commune"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMapFilterType(t)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer capitalize ${
                      mapFilterType === t
                        ? "bg-[#0b1930] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t === "all" ? "Tous" : t}
                  </button>
                ))}
              </div>
            </div>

            {filteredMaps.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                <MapIcon className="mx-auto size-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">
                  Aucune carte spécifique enregistrée pour le moment.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Ajoutez la carte d’une région, province ou commune à gauche pour l’afficher dans sa barre latérale.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredMaps.map((m) => {
                  const targetLink = publicLocationHref(m, regionsTree);
                  const displayTitle =
                    m.territoryName ||
                    m.communeSlug ||
                    m.provinceSlug ||
                    m.regionSlug ||
                    "Territoire";
                  const isConfirming = confirmDeleteMapId === m.id;

                  return (
                    <div
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-200">
                          <Image
                            src={m.mapUrl}
                            alt={displayTitle}
                            fill
                            className="object-contain p-1"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm truncate">
                              {displayTitle}
                            </h3>
                            <span className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-[#b91c1c] uppercase">
                              {m.territoryType}
                            </span>
                          </div>
                          {m.caption ? (
                            <p className="mt-1 text-xs text-slate-500 line-clamp-1">{m.caption}</p>
                          ) : (
                            <p className="mt-1 text-[11px] text-slate-400">
                              Affichée dans la barre latérale du territoire
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={targetLink}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                        >
                          <span>Voir public</span>
                          <ExternalLink className="size-3" />
                        </Link>
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDeleteMap(m.id, displayTitle)}
                              className="rounded-lg bg-[#b91c1c] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#991b1b] cursor-pointer"
                            >
                              Confirmer
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteMapId(null)}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteMapId(m.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                            <span>Supprimer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
