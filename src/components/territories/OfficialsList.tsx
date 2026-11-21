"use client";

import Image from "next/image";
import { useState } from "react";
import type { OfficialProfile } from "@/lib/territories-data";

interface OfficialsListProps {
  title?: string;
  subtitle?: string;
  officials: OfficialProfile[];
  territoryTitle?: string;
}

export function OfficialsList({
  title = "À la tête du territoire",
  subtitle,
  officials,
  territoryTitle,
}: OfficialsListProps) {
  const displaySubtitle = subtitle || (territoryTitle ? `Les élus et dirigeants de ${territoryTitle}` : "Les élus et dirigeants en fonction");
  const [selectedOfficial, setSelectedOfficial] = useState<OfficialProfile | null>(null);

  if (!officials || officials.length === 0) {
    return (
      <section id="elus" className="px-4 py-10 sm:px-8 lg:px-20">
        <div className="mb-7">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1B2A41]">{title}</h2>
          <p className="mt-1 text-sm text-[#5B6472]">{displaySubtitle}</p>
        </div>
        <div className="rounded-2xl border border-dashed border-[#CFC5B1] bg-white/70 p-8 text-center text-[#5B6472]">
          <p className="font-medium">Aucun élu enregistré pour le moment.</p>
          <p className="mt-1 text-xs">Les profils ajoutés depuis le back-office apparaîtront automatiquement ici.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="elus" className="px-4 py-10 sm:px-8 lg:px-20">
      <div className="mb-7">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1B2A41]">{title}</h2>
        <p className="mt-1 text-sm text-[#5B6472]">{displaySubtitle}</p>
      </div>

      <div className="flex flex-wrap gap-6">
        {officials.map((e) => (
          <article
            key={e.id}
            className="group flex flex-1 min-w-[300px] sm:min-w-[400px] max-w-[620px] items-center gap-6 rounded-2xl border border-[#E0D8C8] bg-white p-6 sm:p-7 shadow-xs transition duration-200 hover:border-[#A8472F] hover:shadow-md"
          >
            {/* Photo / Avatar with fallback */}
            <div className="relative h-40 w-32 shrink-0 overflow-hidden rounded-xl bg-[#E6DECB] shadow-xs">
              {e.photoUrl ? (
                <Image
                  src={e.photoUrl}
                  alt={e.fullName}
                  fill
                  sizes="128px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="h-full w-full flex flex-col items-center justify-center p-3 text-center"
                  style={{
                    background: "repeating-linear-gradient(135deg, #E0D8C8 0 7px, #EBE4D6 7px 14px)",
                  }}
                  aria-label="Photo à venir"
                >
                  <span className="font-serif text-2xl font-bold text-[#1B2A41]/40">
                    {e.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#A8472F] line-clamp-1">
                {e.role}
              </p>
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug text-[#1B2A41]">
                {e.fullName}
              </h3>
              {e.fullNameAr ? (
                <p dir="rtl" className="font-sans text-sm text-[#5B6472]">
                  {e.fullNameAr}
                </p>
              ) : null}
              <p className="text-sm text-[#5B6472]">
                {e.party ? `${e.party} · ` : ""}Mandat {e.mandateStart} – {e.mandateEnd}
              </p>
              {e.bio ? (
                <button
                  type="button"
                  onClick={() => setSelectedOfficial(e)}
                  className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-[#A8472F] hover:text-[#7E3220] transition cursor-pointer self-start"
                >
                  Voir le profil complet →
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {/* Modal Profile Details */}
      {selectedOfficial ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setSelectedOfficial(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#E0D8C8] bg-white p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#A8472F]">
                  {selectedOfficial.role}
                </p>
                <h3 className="font-serif text-2xl font-bold text-[#1B2A41] mt-1">
                  {selectedOfficial.fullName}
                </h3>
                {selectedOfficial.fullNameAr ? (
                  <p dir="rtl" className="font-sans text-base text-[#5B6472]">
                    {selectedOfficial.fullNameAr}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelectedOfficial(null)}
                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 border-t border-[#E0D8C8] pt-4 text-sm leading-relaxed text-[#1B2A41]">
              <p className="font-semibold text-[#5B6472] mb-2">
                {selectedOfficial.party ? `Parti politique : ${selectedOfficial.party} · ` : ""}
                Mandat {selectedOfficial.mandateStart} – {selectedOfficial.mandateEnd}
              </p>
              <p className="whitespace-pre-line text-[#5B6472] leading-relaxed">
                {selectedOfficial.bio}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOfficial(null)}
                className="min-h-11 rounded-xl bg-[#1B2A41] px-5 text-sm font-semibold text-white transition hover:bg-[#152234] cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function ParliamentariansRow({
  officials,
}: {
  officials: OfficialProfile[];
}) {
  if (!officials || officials.length === 0) return null;

  return (
    <section className="px-4 py-8 sm:px-8 lg:px-20 border-t border-[#E0D8C8]/60">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1B2A41]">
          Parlementaires de la province
        </h3>
        <span className="text-sm font-semibold text-[#5B6472] tabular-nums">
          {officials.length} parlementaires
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {officials.map((p) => {
          const houseLabel =
            p.house === "chambre_conseillers"
              ? "Chambre des conseillers"
              : "Chambre des représentants";

          return (
            <div
              key={p.id}
              className="flex items-center gap-3.5 rounded-xl border border-[#E0D8C8] bg-white p-3.5 shadow-2xs"
            >
              <div
                className="size-11 shrink-0 rounded-full bg-[#E0D8C8] flex items-center justify-center font-serif text-sm font-bold text-[#1B2A41]/60"
                style={{
                  background: "repeating-linear-gradient(135deg, #E0D8C8 0 5px, #EBE4D6 5px 10px)",
                }}
              >
                {p.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1B2A41] line-clamp-1">{p.fullName}</p>
                <p className="text-xs text-[#5B6472] line-clamp-1">
                  {houseLabel} {p.party ? `· ${p.party}` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
