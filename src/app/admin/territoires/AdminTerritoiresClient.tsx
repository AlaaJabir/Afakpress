"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import {
  REGIONS_12_METADATA,
  getProvincesForRegion,
  getCommunesForProvince,
  type OfficialProfile,
  type TerritoryType,
} from "@/lib/territories-data";

interface AdminTerritoiresClientProps {
  adminEmail: string;
  initialOfficials: OfficialProfile[];
}

export function AdminTerritoiresClient({
  adminEmail,
  initialOfficials,
}: AdminTerritoiresClientProps) {
  const [officials, setOfficials] = useState<OfficialProfile[]>(initialOfficials);
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form states
  const [territoryType, setTerritoryType] = useState<TerritoryType>("region");
  const [selectedRegionSlug, setSelectedRegionSlug] = useState<string>("rabat-sale-kenitra");
  const [selectedProvinceSlug, setSelectedProvinceSlug] = useState<string>("");
  const [selectedCommuneSlug, setSelectedCommuneSlug] = useState<string>("");

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
  const [isUploading, setIsUploading] = useState(false);

  // Filter for the list
  const [filterType, setFilterType] = useState<string>("all");

  const provinces = getProvincesForRegion(selectedRegionSlug);
  const communes = selectedProvinceSlug ? getCommunesForProvince(selectedRegionSlug, selectedProvinceSlug) : [];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setNotice({ type: "error", message: "Le fichier dépasse 2 Mo." });
      return;
    }

    setIsUploading(true);
    setNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "officials");

      const res = await fetch("/api/territoires/upload", {
        method: "POST",
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
      setIsUploading(false);
    }
  };

  const handleAddOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setNotice({ type: "error", message: "Veuillez saisir le nom complet de l'élu." });
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
          regionSlug: selectedRegionSlug,
          provinceSlug: territoryType !== "region" ? selectedProvinceSlug : undefined,
          communeSlug: territoryType === "commune" ? selectedCommuneSlug : undefined,
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
          message: `L'élu "${data.official.fullName}" a été ajouté et apparaît désormais automatiquement sur la page publique !`,
        });
      } catch (err: unknown) {
        setNotice({ type: "error", message: err instanceof Error ? err.message : "Erreur lors de l'ajout" });
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Confirmez-vous la suppression de l'élu "${name}" ?`)) return;

    try {
      const res = await fetch(`/api/territoires/officials?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOfficials((prev) => prev.filter((o) => o.id !== id));
        setNotice({ type: "success", message: `L'élu "${name}" a été supprimé.` });
      }
    } catch {
      setNotice({ type: "error", message: "Erreur lors de la suppression." });
    }
  };

  const filteredOfficials = officials.filter((o) => {
    if (filterType === "all") return true;
    return o.territoryType === filterType;
  });

  return (
    <div className="mx-auto max-w-6xl">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif">
              Gestion des Territoires & Élus
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
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Retour Dashboard
          </Link>
          <Link
            href="/territoires"
            target="_blank"
            className="rounded-lg bg-[#A8472F] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#7E3220]"
          >
            Voir la section publique ↗
          </Link>
        </div>
      </div>

      {/* Status Notice */}
      {notice ? (
        <div
          className={`my-5 rounded-xl border p-4 text-sm font-semibold flex items-center justify-between ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-bold hover:underline"
          >
            ✕ Fermer
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[480px_minmax(0,1fr)] gap-8 mt-6">
        {/* LEFT COLUMN: Add Official Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-950 border-b border-slate-100 pb-3 font-serif">
            Ajouter un profil d’élu / dirigeant
          </h2>

          <form onSubmit={handleAddOfficial} className="mt-5 space-y-4 text-sm">
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
                value={selectedRegionSlug}
                onChange={(e) => {
                  setSelectedRegionSlug(e.target.value);
                  setSelectedProvinceSlug("");
                  setSelectedCommuneSlug("");
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#A8472F] focus:outline-none"
              >
                {REGIONS_12_METADATA.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.nameFr} ({r.nameAr})
                  </option>
                ))}
              </select>
            </div>

            {/* Province Selector (if Province or Commune) */}
            {territoryType !== "region" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Province / Préfecture</label>
                <select
                  value={selectedProvinceSlug}
                  onChange={(e) => {
                    setSelectedProvinceSlug(e.target.value);
                    setSelectedCommuneSlug("");
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#A8472F] focus:outline-none"
                >
                  <option value="">Sélectionnez une province...</option>
                  {provinces.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.nameFr} ({p.kind})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Commune Selector (if Commune) */}
            {territoryType === "commune" && selectedProvinceSlug ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Commune</label>
                <select
                  value={selectedCommuneSlug}
                  onChange={(e) => setSelectedCommuneSlug(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#A8472F] focus:outline-none"
                >
                  <option value="">Sélectionnez une commune...</option>
                  {communes.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.nameFr} ({c.kind})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#A8472F] focus:outline-none"
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#A8472F] focus:outline-none text-right font-sans"
                />
              </div>
            </div>

            {/* Role / Function */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fonction / Rôle *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#A8472F] focus:outline-none"
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
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#A8472F] focus:outline-none"
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#A8472F] focus:outline-none"
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#A8472F] focus:outline-none"
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
                    disabled={isUploading}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isUploading ? "Envoi vers Supabase Storage..." : "Max 2 Mo. Formats JPG, PNG, WebP"}
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
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#A8472F] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || isUploading}
              className="w-full min-h-12 rounded-xl bg-[#A8472F] px-4 py-2.5 text-sm font-black text-white shadow-xs transition hover:bg-[#7E3220] disabled:opacity-50 cursor-pointer"
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
                      ? "bg-[#1B2A41] text-white"
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
                const targetLink =
                  o.territoryType === "region"
                    ? `/territoires/${o.regionSlug}`
                    : o.territoryType === "province"
                    ? `/territoires/${o.regionSlug}/${o.provinceSlug}`
                    : `/territoires/${o.regionSlug}/${o.provinceSlug}/${o.communeSlug}`;

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
                        <p className="text-xs text-[#A8472F] font-semibold truncate">{o.role}</p>
                        <p className="text-[11px] text-slate-400">
                          {o.party ? `${o.party} · ` : ""}Mandat {o.mandateStart} – {o.mandateEnd}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={targetLink}
                        target="_blank"
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                      >
                        Voir public ↗
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(o.id, o.fullName)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
