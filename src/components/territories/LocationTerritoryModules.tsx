"use client";

import Image from "next/image";
import { useState } from "react";
import { Building2, Globe, MapPin, Maximize2, Phone, UserCheck, Users, X } from "lucide-react";
import {
  REGIONS_12_METADATA,
  normalizeTerritorySlug,
  type OfficialProfile,
  type TerritoryMapEntry,
} from "@/lib/territories-data";

const ROLE_AR_LABELS: Record<string, string> = {
  "Président du Conseil de la région": "رئيس مجلس الجهة",
  "Wali de la région et Gouverneur de la préfecture de Rabat": "والي الجهة وعامل عمالة الرباط",
  "Wali de la région et Gouverneur": "والي الجهة",
  "Gouverneur de la province": "عامل الإقليم",
  "Président du Conseil provincial": "رئيس المجلس الإقليمي",
  "Président du Conseil préfectoral": "رئيس مجلس العمالة",
  "Président du Conseil communal": "رئيس المجلس الجماعي",
  "Député parlementaire": "نائب برلماني",
  "Conseiller parlementaire": "مستشار برلماني",
};

function formatRoleLabel(role: string) {
  return ROLE_AR_LABELS[role] || role;
}

export function LocationOfficialsSection({
  kind,
  locationName,
  officials,
}: {
  kind: "Region" | "Province / Prefecture" | "Commune";
  locationName: string;
  officials: OfficialProfile[];
}) {
  const [selectedOfficial, setSelectedOfficial] = useState<OfficialProfile | null>(null);

  const executiveOfficials = officials.filter(
    (o) => o.house !== "chambre_representants" && o.house !== "chambre_conseillers"
  );
  const parliamentarians = officials.filter(
    (o) => o.house === "chambre_representants" || o.house === "chambre_conseillers"
  );

  const sectionTitle =
    kind === "Region"
      ? "رؤساء ومسؤولو الجهة"
      : kind === "Commune"
      ? "رئيس وأعضاء المجلس الجماعي"
      : "مسؤولو العمالة أو الإقليم";

  return (
    <div className="mb-8 space-y-6" dir="rtl">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-[#b91c1c] pb-3">
          <div className="flex items-center gap-2.5">
            <UserCheck className="size-5 text-[#b91c1c]" />
            <h2 className="text-xl font-black text-[#0b1930]">{sectionTitle}</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#b91c1c]">
            <span className="size-1.5 rounded-full bg-[#b91c1c]" />
            {officials.length > 0 ? `${officials.length} ملف` : locationName}
          </span>
        </div>

        {executiveOfficials.length === 0 && parliamentarians.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-6 text-center">
            <p className="text-sm font-bold text-slate-600">
              لا توجد ملفات منشورة للمسؤولين والمنتخبين في {locationName} حالياً.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              بمجرد إضافة ملف رئيس المجلس أو المسؤول الترابي من لوحة التحكم سيظهر تلقائياً هنا.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {(executiveOfficials.length > 0 ? executiveOfficials : officials).map((official) => {
              const displayName = official.fullNameAr || official.fullName;
              const secondaryName =
                official.fullNameAr && official.fullName !== official.fullNameAr
                  ? official.fullName
                  : null;
              const initials = official.fullName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("");

              return (
                <article
                  key={official.id}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 transition duration-200 hover:border-[#b91c1c]/40 hover:bg-white hover:shadow-md"
                >
                  {/* Portrait Photo */}
                  <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-2xs">
                    {official.photoUrl ? (
                      <Image
                        src={official.photoUrl}
                        alt={displayName}
                        fill
                        sizes="96px"
                        className="object-cover transition duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0b1930] to-[#1e3a5f] text-lg font-black text-white">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 text-right">
                    <span className="inline-block rounded-md bg-red-50 px-2.5 py-0.5 text-[11px] font-black text-[#b91c1c]">
                      {formatRoleLabel(official.role)}
                    </span>
                    <h3 className="mt-1.5 text-lg font-black leading-snug text-[#0b1930] line-clamp-1">
                      {displayName}
                    </h3>
                    {secondaryName ? (
                      <p className="text-xs font-semibold text-slate-500 line-clamp-1" dir="ltr">
                        {secondaryName}
                      </p>
                    ) : null}
                    <p className="mt-1.5 text-xs font-bold text-slate-600">
                      {official.party ? `${official.party} · ` : ""}
                      الولاية {official.mandateStart} – {official.mandateEnd}
                    </p>
                    {official.bio ? (
                      <button
                        type="button"
                        onClick={() => setSelectedOfficial(official)}
                        className="mt-2 inline-flex min-h-9 items-center gap-1 text-xs font-black text-[#b91c1c] transition hover:text-[#991b1b] cursor-pointer"
                      >
                        <span>عرض المسار والسيرة</span>
                        <span aria-hidden="true">←</span>
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Parliamentarians Row (Province pages) */}
        {kind === "Province / Prefecture" && parliamentarians.length > 0 ? (
          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-black text-[#0b1930]">
                <Users className="size-4 text-[#b91c1c]" />
                <span>البرلمانيون وممثلو الإقليم</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {parliamentarians.length} برلماني
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {parliamentarians.map((p) => {
                const houseAr =
                  p.house === "chambre_conseillers" ? "مجلس المستشارين" : "مجلس النواب";
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0b1930] text-xs font-black text-white">
                      {(p.fullNameAr || p.fullName).slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#0b1930]">
                        {p.fullNameAr || p.fullName}
                      </p>
                      <p className="truncate text-[11px] font-bold text-slate-500">
                        {houseAr} {p.party ? `· ${p.party}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      {/* Bio Modal */}
      {selectedOfficial ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedOfficial(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="inline-block rounded-md bg-red-50 px-2.5 py-0.5 text-xs font-black text-[#b91c1c]">
                  {formatRoleLabel(selectedOfficial.role)}
                </span>
                <h3 className="mt-2 text-2xl font-black text-[#0b1930]">
                  {selectedOfficial.fullNameAr || selectedOfficial.fullName}
                </h3>
                {selectedOfficial.fullNameAr && selectedOfficial.fullName !== selectedOfficial.fullNameAr ? (
                  <p className="text-sm font-bold text-slate-500" dir="ltr">
                    {selectedOfficial.fullName}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelectedOfficial(null)}
                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              <p className="font-bold text-[#0b1930]">
                {selectedOfficial.party ? `الانتماء الحزبي: ${selectedOfficial.party} · ` : ""}
                الولاية: {selectedOfficial.mandateStart} – {selectedOfficial.mandateEnd}
              </p>
              <p className="whitespace-pre-line text-slate-600">{selectedOfficial.bio}</p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOfficial(null)}
                className="min-h-10 rounded-xl bg-[#0b1930] px-5 text-xs font-black text-white transition hover:bg-[#1e3a5f] cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function LocationTerritoryMapCard({
  kind,
  entityName,
  entitySlug,
  regionSlug,
  provincesCount,
  communesCount,
  territoryMap,
}: {
  kind: "Region" | "Province / Prefecture" | "Commune";
  entityName: string;
  entitySlug: string;
  regionSlug?: string;
  provincesCount?: number;
  communesCount?: number;
  territoryMap?: TerritoryMapEntry | null;
}) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const activeRegionNorm = normalizeTerritorySlug(regionSlug || (kind === "Region" ? entitySlug : ""));
  const currentRegionMeta = REGIONS_12_METADATA.find(
    (r) =>
      r.slug === activeRegionNorm ||
      r.arabicSlug === (regionSlug || entitySlug) ||
      normalizeTerritorySlug(r.arabicSlug) === activeRegionNorm
  );

  const cardTitle =
    kind === "Region"
      ? "خريطة الجهة"
      : kind === "Commune"
      ? "خريطة الجماعة"
      : "خريطة العمالة / الإقليم";

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" dir="rtl">
      <div className="flex items-center justify-between gap-2 border-b-4 border-[#b91c1c] pb-3">
        <h2 className="flex items-center gap-2 text-lg font-black text-[#0b1930]">
          <MapPin className="size-4 shrink-0 text-[#b91c1c]" />
          <span>{cardTitle}</span>
        </h2>
        <span className="truncate max-w-[140px] rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-black text-[#b91c1c]">
          {entityName}
        </span>
      </div>

      {/* Key Stats */}
      {kind === "Region" && currentRegionMeta ? (
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
          <div>
            <p className="text-lg font-black text-[#0b1930] tabular-nums">
              {provincesCount ?? currentRegionMeta.provincesCount}
            </p>
            <p className="text-[10px] font-bold text-slate-500">الأقاليم</p>
          </div>
          <div>
            <p className="text-lg font-black text-[#0b1930] tabular-nums">
              {communesCount ?? currentRegionMeta.communesCount}
            </p>
            <p className="text-[10px] font-bold text-slate-500">الجماعات</p>
          </div>
          <div>
            <p className="text-lg font-black text-[#0b1930] tabular-nums">
              {(currentRegionMeta.population / 1000000).toFixed(1)}M
            </p>
            <p className="text-[10px] font-bold text-slate-500">السكان</p>
          </div>
        </div>
      ) : kind === "Province / Prefecture" && typeof communesCount === "number" ? (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-xs">
          <span className="font-bold text-slate-600">الجماعات الترابية التابعة</span>
          <span className="font-black text-[#0b1930] tabular-nums">{communesCount} جماعة</span>
        </div>
      ) : null}

      {/* Specific Uploaded Territory Map */}
      <div className="mt-4">
        {territoryMap?.mapUrl ? (
          <div>
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              aria-label={`تكبير خريطة ${entityName}`}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
            >
              <Image
                src={territoryMap.mapUrl}
                alt={`خريطة ${entityName}`}
                fill
                sizes="(min-width: 1024px) 320px, 100vw"
                className="object-contain p-1.5 transition duration-300 group-hover:scale-[1.03]"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-lg bg-[#0b1930]/85 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs transition group-hover:bg-[#b91c1c]">
                <Maximize2 className="size-3" />
                <span>تكبير</span>
              </span>
            </button>
            {territoryMap.caption ? (
              <p className="mt-2.5 text-xs font-medium leading-5 text-slate-600">
                {territoryMap.caption}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-7 text-center">
            <MapPin className="mx-auto size-6 text-slate-400" />
            <p className="mt-2 text-xs font-bold text-slate-600">
              لم يتم رفع خريطة خاصة بـ {entityName} بعد.
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              تُرفع الخريطة من لوحة التحكم لتظهر تلقائياً في هذه البطاقة.
            </p>
          </div>
        )}
      </div>

      {/* Commune practical info */}
      {kind === "Commune" ? (
        <div className="mt-4 space-y-2.5 border-t border-slate-200 pt-4 text-xs">
          <p className="font-black text-[#0b1930]">معلومات عملية — {entityName}</p>
          <div className="flex items-start gap-2 text-slate-600">
            <Building2 className="mt-0.5 size-3.5 shrink-0 text-[#b91c1c]" />
            <span>مقر الجماعة الترابية، {entityName}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="size-3.5 shrink-0 text-[#b91c1c]" />
            <span dir="ltr">+212 5 37 00 00 00</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Globe className="size-3.5 shrink-0 text-[#b91c1c]" />
            <span className="truncate text-[#b91c1c]">www.collectivites-territoriales.gov.ma</span>
          </div>
        </div>
      ) : null}

      {/* Fullscreen Map Zoom Lightbox */}
      {isZoomOpen && territoryMap?.mapUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`خريطة ${entityName}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-black text-[#b91c1c]">{cardTitle}</p>
                <h3 className="text-lg font-black text-[#0b1930]">{entityName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                aria-label="إغلاق"
                className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-50">
              <Image
                src={territoryMap.mapUrl}
                alt={`خريطة ${entityName}`}
                fill
                sizes="(min-width: 768px) 720px, 100vw"
                className="object-contain p-2"
                referrerPolicy="no-referrer"
              />
            </div>
            {territoryMap.caption ? (
              <p className="mt-3 text-sm font-medium text-slate-600">{territoryMap.caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
