"use client";

import Link from "next/link";
import { useState } from "react";

export function TerritoriesHeader() {
  const [lang, setLang] = useState<"fr" | "ar">("fr");

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E0D8C8] px-4 py-4 sm:px-8 lg:px-20 bg-[#F6F2EA]">
      {/* Brand logo & title */}
      <Link
        href="/territoires"
        className="flex items-center gap-2.5 text-[#1B2A41] transition hover:opacity-90"
      >
        <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" className="shrink-0">
          <path
            d="M13 1l3.2 6.8L24 8.9l-5.6 5.1L19.9 22 13 18.2 6.1 22l1.5-8L2 8.9l7.8-1.1z"
            fill="none"
            stroke="#A8472F"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-serif text-2xl font-bold tracking-tight text-[#1B2A41]">
          Territoires
        </span>
      </Link>

      {/* Nav Links */}
      <nav aria-label="Navigation des territoires" className="flex flex-wrap items-center gap-6 sm:gap-7 text-[15px] font-medium text-[#1B2A41]">
        <Link href="/territoires#carte" className="text-[#1B2A41] transition hover:text-[#A8472F]">
          Régions
        </Link>
        <Link href="/territoires#elus" className="text-[#1B2A41] transition hover:text-[#A8472F]">
          Élus
        </Link>
        <Link href="/territoires#actus" className="text-[#1B2A41] transition hover:text-[#A8472F]">
          Actualités
        </Link>
        <Link href="/" className="text-[#5B6472] transition hover:text-[#1B2A41]">
          Afakpress (Journal)
        </Link>
        <Link href="/admin/territoires" className="text-xs font-bold text-[#A8472F] border border-[#A8472F]/40 rounded-md px-2.5 py-1 hover:bg-[#A8472F] hover:text-white transition">
          Admin
        </Link>
      </nav>

      {/* Language switcher */}
      <div className="flex items-center gap-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setLang("fr")}
          className={`min-h-10 min-w-10 rounded-lg px-3 py-1.5 transition cursor-pointer ${
            lang === "fr" ? "bg-[#1B2A41] text-[#F6F2EA]" : "bg-transparent text-[#1B2A41] hover:bg-black/5"
          }`}
        >
          FR
        </button>
        <button
          type="button"
          lang="ar"
          onClick={() => setLang("ar")}
          className={`min-h-10 min-w-10 rounded-lg px-3 py-1.5 font-sans text-base transition cursor-pointer ${
            lang === "ar" ? "bg-[#1B2A41] text-[#F6F2EA]" : "bg-transparent text-[#1B2A41] hover:bg-black/5"
          }`}
        >
          عربي
        </button>
      </div>
    </header>
  );
}
