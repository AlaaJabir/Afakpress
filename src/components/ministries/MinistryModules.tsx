"use client";

import Image from "next/image";
import { useState } from "react";
import { Building2, ExternalLink, Globe, Landmark, ShieldCheck, UserCheck, X } from "lucide-react";
import type { MinistryItem } from "@/lib/ministries-data";
import type { MinistryPageContent, MinistryProfile } from "@/lib/ministries-db";

export function MinistryOfficialsSection({
  ministryName,
  profiles,
}: {
  ministryName: string;
  profiles: MinistryProfile[];
}) {
  const [selectedProfile, setSelectedProfile] = useState<MinistryProfile | null>(null);

  return (
    <div className="mb-8" dir="rtl">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-[#b91c1c] pb-3">
          <div className="flex items-center gap-2.5">
            <UserCheck className="size-5 text-[#b91c1c]" />
            <h2 className="text-xl font-black text-[#0b1930]">
              الوزير والمسؤولون عن القطاع
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#b91c1c]">
            <span className="size-1.5 rounded-full bg-[#b91c1c]" />
            {profiles.length > 0 ? `${profiles.length} ملف` : ministryName}
          </span>
        </div>

        {profiles.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-6 text-center">
            <p className="text-sm font-bold text-slate-600">
              لم يتم تسجيل ملف الوزير أو المسؤول عن {ministryName} بعد.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              بمجرد إضافة بروفايل الوزير وصورته ومساره من لوحة التحكم سيظهر تلقائياً هنا فوق المقالات المرتبطة به.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {profiles.map((profile) => {
              const displayName = profile.fullNameAr || profile.fullName;
              const secondaryName =
                profile.fullNameAr && profile.fullName !== profile.fullNameAr
                  ? profile.fullName
                  : null;
              const initials = displayName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("");

              return (
                <article
                  key={profile.id}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 transition duration-200 hover:border-[#b91c1c]/40 hover:bg-white hover:shadow-md"
                >
                  {/* Portrait Photo */}
                  <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-2xs">
                    {profile.photoUrl ? (
                      <Image
                        src={profile.photoUrl}
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
                      {profile.role}
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
                      {profile.party ? `${profile.party} · ` : ""}
                      الولاية {profile.mandateStart} – {profile.mandateEnd}
                    </p>
                    {profile.bio ? (
                      <button
                        type="button"
                        onClick={() => setSelectedProfile(profile)}
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
      </section>

      {/* Bio Modal */}
      {selectedProfile ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {selectedProfile.photoUrl ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-slate-200">
                    <Image
                      src={selectedProfile.photoUrl}
                      alt={selectedProfile.fullNameAr || selectedProfile.fullName}
                      fill
                      sizes="64px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <span className="inline-block rounded-md bg-red-50 px-2.5 py-0.5 text-xs font-black text-[#b91c1c]">
                    {selectedProfile.role}
                  </span>
                  <h3 className="mt-1.5 text-2xl font-black text-[#0b1930]">
                    {selectedProfile.fullNameAr || selectedProfile.fullName}
                  </h3>
                  {selectedProfile.fullNameAr &&
                  selectedProfile.fullName !== selectedProfile.fullNameAr ? (
                    <p className="text-sm font-bold text-slate-500" dir="ltr">
                      {selectedProfile.fullName}
                    </p>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              <p className="font-bold text-[#0b1930]">
                {selectedProfile.party ? `الانتماء الحزبي: ${selectedProfile.party} · ` : ""}
                الولاية: {selectedProfile.mandateStart} – {selectedProfile.mandateEnd}
              </p>
              <p className="whitespace-pre-line text-slate-600">{selectedProfile.bio}</p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
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

export function MinistryInfoSidebarCard({
  ministry,
  content,
  profilesCount,
  articlesCount,
}: {
  ministry: MinistryItem;
  content: MinistryPageContent | null;
  profilesCount: number;
  articlesCount: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" dir="rtl">
      <div className="flex items-center justify-between gap-2 border-b-4 border-[#b91c1c] pb-3">
        <h2 className="flex items-center gap-2 text-lg font-black text-[#0b1930]">
          <Landmark className="size-4 shrink-0 text-[#b91c1c]" />
          <span>بطاقة الوزارة</span>
        </h2>
        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-black text-[#b91c1c] tabular-nums">
          #{String(ministry.number).padStart(2, "0")}
        </span>
      </div>

      {content?.emblemUrl ? (
        <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
          <Image
            src={content.emblemUrl}
            alt={ministry.nameAr}
            fill
            sizes="300px"
            className="object-contain p-3"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
        <div>
          <p className="text-lg font-black text-[#0b1930] tabular-nums">{profilesCount}</p>
          <p className="text-[10px] font-bold text-slate-500">ملف مسؤول</p>
        </div>
        <div>
          <p className="text-lg font-black text-[#0b1930] tabular-nums">{articlesCount}</p>
          <p className="text-[10px] font-bold text-slate-500">مقال وتغطية</p>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-xs leading-6 text-slate-600">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-1 size-3.5 shrink-0 text-[#b91c1c]" />
          <div>
            <p className="font-black text-[#0b1930]">القطب الحكومي</p>
            <p>{ministry.groupNameAr}</p>
          </div>
        </div>

        {content?.mission ? (
          <div className="flex items-start gap-2 border-t border-slate-100 pt-3">
            <Landmark className="mt-1 size-3.5 shrink-0 text-[#b91c1c]" />
            <div>
              <p className="font-black text-[#0b1930]">الاختصاصات الرئيسية</p>
              <p className="whitespace-pre-line">{content.mission}</p>
            </div>
          </div>
        ) : null}

        <div className="flex items-start gap-2 border-t border-slate-100 pt-3">
          <Building2 className="mt-1 size-3.5 shrink-0 text-[#b91c1c]" />
          <div>
            <p className="font-black text-[#0b1930]">المقر الرسمي</p>
            <p>{content?.headquarters || "الرباط — المملكة المغربية"}</p>
          </div>
        </div>

        {content?.officialWebsite ? (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
            <Globe className="size-3.5 shrink-0 text-[#b91c1c]" />
            <a
              href={content.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#b91c1c] hover:underline truncate"
            >
              <span className="truncate">البوابة الرسمية للوزارة</span>
              <ExternalLink className="size-3 shrink-0" />
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
