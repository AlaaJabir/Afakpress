"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileText,
  Landmark,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  MINISTRY_GROUPS,
  MOROCCAN_MINISTRIES,
} from "@/lib/ministries-data";
import type {
  MinistryPageContent,
  MinistryProfile,
} from "@/lib/ministries-db";

interface AdminMinisteresClientProps {
  adminEmail: string;
  initialProfiles: MinistryProfile[];
  initialContents: MinistryPageContent[];
}

const MINISTER_ROLE_OPTIONS = [
  "وزير",
  "وزيرة",
  "رئيس الحكومة",
  "رئيسة الحكومة",
  "الأمين العام للحكومة",
  "وزير منتدب",
  "وزيرة منتدبة",
  "كاتب الدولة",
  "كاتبة الدولة",
  "custom",
];

export function AdminMinisteresClient({
  adminEmail,
  initialProfiles,
  initialContents,
}: AdminMinisteresClientProps) {
  const [activeTab, setActiveTab] = useState<"profiles" | "content">("profiles");
  const [profiles, setProfiles] = useState<MinistryProfile[]>(initialProfiles);
  const [contents, setContents] = useState<MinistryPageContent[]>(initialContents);
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
    href?: string;
  } | null>(null);

  // Minister Profile Form State
  const [editingProfileId, setEditingProfileId] = useState<string>("");
  const [profileMinistrySlug, setProfileMinistrySlug] = useState<string>(
    MOROCCAN_MINISTRIES[2]?.slug || MOROCCAN_MINISTRIES[0].slug
  );
  const [fullNameAr, setFullNameAr] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("وزير");
  const [customRole, setCustomRole] = useState("");
  const [party, setParty] = useState("");
  const [mandateStart, setMandateStart] = useState("2021");
  const [mandateEnd, setMandateEnd] = useState("2026");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Profile list filters & delete confirmation
  const [profileSearch, setProfileSearch] = useState("");
  const [filterGroupId, setFilterGroupId] = useState<string>("all");
  const [confirmDeleteProfileId, setConfirmDeleteProfileId] = useState<string | null>(null);

  // Ministry Page Content Form State
  const [contentMinistrySlug, setContentMinistrySlug] = useState<string>(
    MOROCCAN_MINISTRIES[2]?.slug || MOROCCAN_MINISTRIES[0].slug
  );
  const initialSelectedContent = contents.find(
    (c) => c.slug === (MOROCCAN_MINISTRIES[2]?.slug || MOROCCAN_MINISTRIES[0].slug)
  );
  const [overview, setOverview] = useState(initialSelectedContent?.overview || "");
  const [mission, setMission] = useState(initialSelectedContent?.mission || "");
  const [headquarters, setHeadquarters] = useState(
    initialSelectedContent?.headquarters || ""
  );
  const [officialWebsite, setOfficialWebsite] = useState(
    initialSelectedContent?.officialWebsite || ""
  );
  const [emblemUrl, setEmblemUrl] = useState(initialSelectedContent?.emblemUrl || "");
  const [isUploadingEmblem, setIsUploadingEmblem] = useState(false);

  const ministryBySlug = useMemo(
    () => new Map(MOROCCAN_MINISTRIES.map((m) => [m.slug, m])),
    []
  );

  const contentBySlug = useMemo(
    () => new Map(contents.map((c) => [c.slug, c])),
    [contents]
  );

  const activePublicHref =
    activeTab === "profiles"
      ? `/ministere/${encodeURIComponent(profileMinistrySlug)}`
      : `/ministere/${encodeURIComponent(contentMinistrySlug)}`;

  const resetProfileForm = () => {
    setEditingProfileId("");
    setFullNameAr("");
    setFullName("");
    setRole("وزير");
    setCustomRole("");
    setParty("");
    setMandateStart("2021");
    setMandateEnd("2026");
    setBio("");
    setPhotoUrl("");
    setDisplayOrder(1);
    setIsPublished(true);
  };

  const selectMinistryForContent = (slug: string) => {
    setContentMinistrySlug(slug);
    const existing = contentBySlug.get(slug);
    setOverview(existing?.overview || "");
    setMission(existing?.mission || "");
    setHeadquarters(existing?.headquarters || "");
    setOfficialWebsite(existing?.officialWebsite || "");
    setEmblemUrl(existing?.emblemUrl || "");
  };

  const handleUploadImage = async (
    file: File | undefined,
    folder: "ministers" | "ministries",
    onSuccess: (url: string) => void,
    setBusy: (busy: boolean) => void
  ) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setNotice({ type: "error", message: "L'image dépasse 5 Mo." });
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/territoires/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec du téléversement.");
      }
      onSuccess(data.url);
      setNotice({
        type: "success",
        message: "Image téléversée avec succès dans Supabase Storage.",
      });
    } catch (err: unknown) {
      setNotice({
        type: "error",
        message: err instanceof Error ? err.message : "Erreur de téléversement.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveName = fullName.trim() || fullNameAr.trim();
    const effectiveRole = role === "custom" ? customRole.trim() : role;

    if (!effectiveName) {
      setNotice({
        type: "error",
        message: "Veuillez saisir le nom du ministre (en arabe ou en français).",
      });
      return;
    }
    if (!effectiveRole) {
      setNotice({
        type: "error",
        message: "Veuillez préciser la fonction du ministre.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/ministeres/profiles", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProfileId || undefined,
            ministrySlug: profileMinistrySlug,
            fullName: effectiveName,
            fullNameAr: fullNameAr.trim() || undefined,
            role: effectiveRole,
            party: party.trim() || undefined,
            mandateStart: mandateStart.trim() || "2021",
            mandateEnd: mandateEnd.trim() || "2026",
            bio: bio.trim() || undefined,
            photoUrl: photoUrl.trim() || undefined,
            displayOrder: Number(displayOrder) || 1,
            isPublished,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Erreur lors de l'enregistrement du profil.");
        }

        const saved = data.profile as MinistryProfile;
        setProfiles((prev) => {
          const exists = prev.some((p) => p.id === saved.id);
          return exists
            ? prev.map((p) => (p.id === saved.id ? saved : p))
            : [saved, ...prev];
        });

        const mName = ministryBySlug.get(saved.ministrySlug)?.nameAr || saved.ministrySlug;
        setNotice({
          type: "success",
          message: `Le profil "${saved.fullNameAr || saved.fullName}" a été publié sur la page "${mName}" au-dessus des articles.`,
          href: `/ministere/${encodeURIComponent(saved.ministrySlug)}`,
        });
        resetProfileForm();
      } catch (err: unknown) {
        setNotice({
          type: "error",
          message: err instanceof Error ? err.message : "Erreur lors de l'enregistrement.",
        });
      }
    });
  };

  const handleEditProfile = (profile: MinistryProfile) => {
    setEditingProfileId(profile.id);
    setProfileMinistrySlug(profile.ministrySlug);
    setFullNameAr(profile.fullNameAr || "");
    setFullName(profile.fullName || "");
    if (MINISTER_ROLE_OPTIONS.includes(profile.role)) {
      setRole(profile.role);
      setCustomRole("");
    } else {
      setRole("custom");
      setCustomRole(profile.role);
    }
    setParty(profile.party || "");
    setMandateStart(profile.mandateStart || "2021");
    setMandateEnd(profile.mandateEnd || "2026");
    setBio(profile.bio || "");
    setPhotoUrl(profile.photoUrl || "");
    setDisplayOrder(profile.displayOrder || 1);
    setIsPublished(profile.isPublished);
    setActiveTab("profiles");
  };

  const handleDeleteProfile = async (id: string, label: string) => {
    try {
      const res = await fetch(`/api/ministeres/profiles?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Suppression échouée.");

      setProfiles((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteProfileId(null);
      if (editingProfileId === id) resetProfileForm();
      setNotice({ type: "success", message: `Le profil "${label}" a été supprimé.` });
    } catch (err: unknown) {
      setNotice({
        type: "error",
        message: err instanceof Error ? err.message : "Erreur lors de la suppression.",
      });
    }
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/api/ministeres/content", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: contentMinistrySlug,
            overview: overview.trim() || undefined,
            mission: mission.trim() || undefined,
            headquarters: headquarters.trim() || undefined,
            officialWebsite: officialWebsite.trim() || undefined,
            emblemUrl: emblemUrl.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Erreur lors de l'enregistrement.");
        }

        const saved = data.content as MinistryPageContent;
        setContents((prev) => {
          const exists = prev.some((c) => c.slug === saved.slug);
          return exists
            ? prev.map((c) => (c.slug === saved.slug ? saved : c))
            : [saved, ...prev];
        });

        const mName = ministryBySlug.get(saved.slug)?.nameAr || saved.slug;
        setNotice({
          type: "success",
          message: `Le contenu de la page "${mName}" a été enregistré et publié.`,
          href: `/ministere/${encodeURIComponent(saved.slug)}`,
        });
      } catch (err: unknown) {
        setNotice({
          type: "error",
          message: err instanceof Error ? err.message : "Erreur lors de l'enregistrement.",
        });
      }
    });
  };

  const filteredProfiles = useMemo(() => {
    const q = profileSearch.trim().toLowerCase();
    return profiles.filter((p) => {
      const ministry = ministryBySlug.get(p.ministrySlug);
      if (filterGroupId !== "all" && ministry?.groupId !== filterGroupId) {
        return false;
      }
      if (!q) return true;
      return (
        p.fullName.toLowerCase().includes(q) ||
        (p.fullNameAr || "").toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        (p.party || "").toLowerCase().includes(q) ||
        (ministry?.nameAr || "").toLowerCase().includes(q)
      );
    });
  }, [profiles, filterGroupId, profileSearch, ministryBySlug]);

  return (
    <div className="mx-auto max-w-6xl" dir="ltr">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif">
              Gestion des Ministères & Profils des Ministres
            </h1>
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              31 Ministères
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Connecté en tant que{" "}
            <span className="font-semibold text-slate-900">{adminEmail}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="size-3.5" />
            <span>Retour Dashboard</span>
          </Link>
          <Link
            href="/admin/territoires"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <span>Territoires & Élus</span>
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

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab("profiles");
            setNotice(null);
          }}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition cursor-pointer ${
            activeTab === "profiles"
              ? "bg-[#0b1930] text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Users className="size-4" />
          <span>Profils des Ministres ({profiles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("content");
            setNotice(null);
          }}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition cursor-pointer ${
            activeTab === "content"
              ? "bg-[#b91c1c] text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <FileText className="size-4" />
          <span>Contenu des Pages Ministères ({contents.length}/31)</span>
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

      {activeTab === "profiles" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[480px_minmax(0,1fr)] gap-8 mt-6">
          {/* LEFT: Minister Profile Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm self-start">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-950 font-serif">
                {editingProfileId
                  ? "Modifier le profil du ministre"
                  : "Ajouter un profil de ministre"}
              </h2>
              {editingProfileId ? (
                <button
                  type="button"
                  onClick={resetProfileForm}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  + Nouveau
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4 text-sm">
              {/* Target Ministry Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  1. Ministère ciblé *
                </label>
                <select
                  value={profileMinistrySlug}
                  onChange={(e) => setProfileMinistrySlug(e.target.value)}
                  dir="rtl"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                >
                  {MINISTRY_GROUPS.map((group) => (
                    <optgroup key={group.id} label={group.nameAr}>
                      {MOROCCAN_MINISTRIES.filter((m) => m.groupId === group.id).map(
                        (m) => (
                          <option key={m.slug} value={m.slug}>
                            {String(m.number).padStart(2, "0")}. {m.nameAr}
                          </option>
                        )
                      )}
                    </optgroup>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  Page publique : <code>/ministere/{profileMinistrySlug}</code>
                </p>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom du ministre (AR) *
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مثال: عبد الوافي لفتيت"
                    value={fullNameAr}
                    onChange={(e) => setFullNameAr(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom complet (FR)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Abdelouafi Laftit"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>
              </div>

              {/* Role / Function */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fonction / Qualité *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  dir="auto"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                >
                  {MINISTER_ROLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "custom" ? "Autre fonction personnalisée..." : opt}
                    </option>
                  ))}
                </select>
                {role === "custom" ? (
                  <input
                    type="text"
                    dir="auto"
                    required
                    placeholder="Ex: وزير الداخلية / Ministre délégué..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                  />
                ) : null}
              </div>

              {/* Party & Mandate */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parti
                  </label>
                  <input
                    type="text"
                    dir="auto"
                    placeholder="RNI, PAM, مستقل..."
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Début
                  </label>
                  <input
                    type="text"
                    value={mandateStart}
                    onChange={(e) => setMandateStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fin
                  </label>
                  <input
                    type="text"
                    value={mandateEnd}
                    onChange={(e) => setMandateEnd(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Photo officielle (Supabase Storage)
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
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isUploadingPhoto}
                      onChange={(e) => {
                        void handleUploadImage(
                          e.target.files?.[0],
                          "ministers",
                          setPhotoUrl,
                          setIsUploadingPhoto
                        );
                        e.target.value = "";
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                    />
                    <input
                      type="url"
                      placeholder="Ou collez l'URL de la photo (https://...)"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Biographie & Parcours (AR / FR)
                </label>
                <textarea
                  rows={4}
                  dir="auto"
                  placeholder="السيرة الذاتية والمسار المهني والسياسي للوزير..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 items-center gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ordre d’affichage
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <label className="flex items-center gap-2 pt-5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                  />
                  <span>Publier sur la page</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isPending || isUploadingPhoto}
                className="w-full min-h-12 rounded-xl bg-[#b91c1c] px-4 py-2.5 text-sm font-black text-white shadow-xs transition hover:bg-[#991b1b] disabled:opacity-50 cursor-pointer"
              >
                {isPending
                  ? "Enregistrement..."
                  : editingProfileId
                  ? "Mettre à jour le profil"
                  : "Enregistrer et publier le ministre"}
              </button>
            </form>
          </div>

          {/* RIGHT: Minister Profiles List */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-black text-slate-950 font-serif">
                Profils des ministres ({filteredProfiles.length})
              </h2>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un ministre, parti, ministère..."
                  value={profileSearch}
                  onChange={(e) => setProfileSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                />
              </div>
              <select
                value={filterGroupId}
                onChange={(e) => setFilterGroupId(e.target.value)}
                dir="auto"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
              >
                <option value="all">Tous les pôles (7)</option>
                {MINISTRY_GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nameAr}
                  </option>
                ))}
              </select>
            </div>

            {filteredProfiles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                <Users className="mx-auto size-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">
                  Aucun profil de ministre enregistré pour le moment.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Ajoutez un ministre à gauche pour l’afficher automatiquement en haut de la page de son ministère.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredProfiles.map((p) => {
                  const ministry = ministryBySlug.get(p.ministrySlug);
                  const isConfirming = confirmDeleteProfileId === p.id;
                  return (
                    <div
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          {p.photoUrl ? (
                            <Image
                              src={p.photoUrl}
                              alt={p.fullNameAr || p.fullName}
                              fill
                              sizes="56px"
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#0b1930] text-xs font-black text-white">
                              {(p.fullNameAr || p.fullName).slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm truncate" dir="auto">
                              {p.fullNameAr || p.fullName}
                            </h3>
                            <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-[#b91c1c]">
                              {p.role}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 truncate" dir="rtl">
                            {ministry?.nameAr || p.ministrySlug}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {p.party ? `${p.party} · ` : ""}
                            Mandat {p.mandateStart} – {p.mandateEnd}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/ministere/${encodeURIComponent(p.ministrySlug)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                        >
                          <span>Voir public</span>
                          <ExternalLink className="size-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEditProfile(p)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <Edit3 className="size-3" />
                          <span>Modifier</span>
                        </button>
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                void handleDeleteProfile(p.id, p.fullNameAr || p.fullName)
                              }
                              className="rounded-lg bg-[#b91c1c] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#991b1b] cursor-pointer"
                            >
                              Confirmer
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteProfileId(null)}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-600 cursor-pointer"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteProfileId(p.id)}
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
          {/* LEFT: Ministry Content Editor */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm self-start">
            <h2 className="text-lg font-black text-slate-950 border-b border-slate-100 pb-3 font-serif">
              Contenu & Présentation du Ministère
            </h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Personnalisez la présentation éditoriale, les attributions et les coordonnées officielles affichées sur la page dédiée de chaque ministère.
            </p>

            <form onSubmit={handleSaveContent} className="mt-5 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ministère *
                </label>
                <select
                  value={contentMinistrySlug}
                  onChange={(e) => selectMinistryForContent(e.target.value)}
                  dir="rtl"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                >
                  {MINISTRY_GROUPS.map((group) => (
                    <optgroup key={group.id} label={group.nameAr}>
                      {MOROCCAN_MINISTRIES.filter((m) => m.groupId === group.id).map(
                        (m) => (
                          <option key={m.slug} value={m.slug}>
                            {String(m.number).padStart(2, "0")}. {m.nameAr}
                          </option>
                        )
                      )}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Présentation / Contenu principal de la page (AR)
                </label>
                <textarea
                  rows={4}
                  dir="rtl"
                  placeholder="نبذة تعريفية ومحتوى الصفحة الخاصة بالوزارة..."
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attributions & Missions clés (Sidebar)
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  placeholder="أبرز اختصاصات ومهام القطاع الوزاري..."
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Siège officiel (AR)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: حي الرياض، الرباط — المملكة المغربية"
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Site web officiel
                </label>
                <input
                  type="url"
                  placeholder="https://www.exemple.gov.ma"
                  value={officialWebsite}
                  onChange={(e) => setOfficialWebsite(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#b91c1c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Emblème / Visuel du ministère (optionnel)
                </label>
                {emblemUrl ? (
                  <div className="mb-2 relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <Image
                      src={emblemUrl}
                      alt="Visuel ministère"
                      fill
                      className="object-contain p-2"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setEmblemUrl("")}
                      className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-xs border border-slate-200 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : null}
                <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 hover:border-[#b91c1c] cursor-pointer">
                  <Upload className="size-4 text-[#b91c1c]" />
                  <span>
                    {isUploadingEmblem ? "Téléversement..." : "Téléverser un logo / visuel"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isUploadingEmblem}
                    onChange={(e) => {
                      void handleUploadImage(
                        e.target.files?.[0],
                        "ministries",
                        setEmblemUrl,
                        setIsUploadingEmblem
                      );
                      e.target.value = "";
                    }}
                    className="sr-only"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isPending || isUploadingEmblem}
                className="w-full min-h-12 rounded-xl bg-[#b91c1c] px-4 py-2.5 text-sm font-black text-white shadow-xs transition hover:bg-[#991b1b] disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Enregistrement..." : "Enregistrer le contenu de la page"}
              </button>
            </form>
          </div>

          {/* RIGHT: All 31 Ministries Pages Directory */}
          <div>
            <h2 className="text-lg font-black text-slate-950 font-serif mb-4">
              Pages des 31 Ministères
            </h2>
            <div className="grid gap-2.5">
              {MOROCCAN_MINISTRIES.map((m) => {
                const hasContent = contentBySlug.has(m.slug);
                const profileCount = profiles.filter(
                  (p) => p.ministrySlug === m.slug
                ).length;
                const isSelected = contentMinistrySlug === m.slug;

                return (
                  <div
                    key={m.slug}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 transition ${
                      isSelected
                        ? "border-[#b91c1c] bg-red-50/30"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-700 tabular-nums">
                          {String(m.number).padStart(2, "0")}
                        </span>
                        <span className="text-[11px] font-bold text-[#b91c1c]">
                          {m.groupNameAr}
                        </span>
                        {hasContent ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Contenu configuré
                          </span>
                        ) : null}
                        {profileCount > 0 ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                            {profileCount} ministre(s)
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-bold text-slate-900" dir="rtl">
                        {m.nameAr}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => selectMinistryForContent(m.slug)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <Landmark className="size-3" />
                        <span>Éditer</span>
                      </button>
                      <Link
                        href={`/ministere/${encodeURIComponent(m.slug)}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        <span>Voir</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
