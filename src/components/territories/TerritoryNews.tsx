"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { TerritoryArticle } from "@/lib/territories-data";

interface TerritoryNewsProps {
  title?: string;
  articles: TerritoryArticle[];
  territoryName?: string;
}

export function TerritoryNews({
  title = "Actualités du territoire",
  articles,
  territoryName,
}: TerritoryNewsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tout");

  const categories = ["Tout", "Politique", "Économie", "Société"];

  const filtered =
    selectedCategory === "Tout"
      ? articles
      : articles.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase());

  if (!articles || articles.length === 0) {
    return (
      <section id="actus" className="px-4 py-12 sm:px-8 lg:px-20 border-t border-[#E0D8C8]">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1B2A41] mb-2">{title}</h2>
        <p className="text-sm text-[#5B6472]">Aucune actualité publiée pour ce territoire pour l’instant.</p>
      </section>
    );
  }

  const featured = filtered[0] || articles[0];
  const sideArticles = filtered.slice(1, 4);

  return (
    <section id="actus" className="px-4 py-12 sm:px-8 lg:px-20 border-t border-[#E0D8C8]">
      {/* Section Header with category filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1B2A41]">{title}</h2>
          {territoryName ? (
            <p className="text-sm text-[#5B6472] mt-0.5">Dernières dépêches et reportages</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-10 px-4 py-1.5 rounded-full text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-[#1B2A41] text-[#F6F2EA]"
                    : "bg-transparent text-[#1B2A41] border border-[#CFC5B1] hover:bg-black/5"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Featured Story (left) + Secondary List (right) */}
      <div className="flex flex-wrap gap-8 items-start">
        {/* Featured Card */}
        {featured ? (
          <article className="flex-1 min-w-[320px] max-w-2xl flex flex-col gap-4">
            <Link
              href={`/article/${encodeURIComponent(featured.slug)}`}
              className="group block overflow-hidden rounded-2xl bg-[#E6DECB] relative aspect-video"
            >
              {featured.image ? (
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  sizes="(min-width: 1024px) 680px, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background: "repeating-linear-gradient(135deg, #E0D8C8 0 9px, #EBE4D6 9px 18px)",
                  }}
                  aria-label="Image à venir"
                />
              )}
            </Link>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#A8472F]">
                {featured.category} · {featured.publishedAt.split("T")[0]}
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-snug text-[#1B2A41] mt-2 transition hover:text-[#A8472F]">
                <Link href={`/article/${encodeURIComponent(featured.slug)}`}>
                  {featured.title}
                </Link>
              </h3>
              <p className="text-[#5B6472] text-sm sm:text-base leading-relaxed mt-2.5 line-clamp-3">
                {featured.excerpt}
              </p>
            </div>
          </article>
        ) : null}

        {/* Side Column List */}
        <div className="flex-1 min-w-[280px] max-w-md flex flex-col divide-y divide-[#E0D8C8]">
          {sideArticles.map((item) => (
            <article key={item.id} className="py-5 first:pt-0 flex gap-4 items-center">
              <Link
                href={`/article/${encodeURIComponent(item.slug)}`}
                className="group relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[#E6DECB]"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="112px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: "repeating-linear-gradient(135deg, #E0D8C8 0 6px, #EBE4D6 6px 12px)",
                    }}
                    aria-label="Image à venir"
                  />
                )}
              </Link>
              <div className="min-w-0 flex-1 flex flex-col gap-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#A8472F]">
                  {item.category} · {item.publishedAt.split("T")[0]}
                </p>
                <h4 className="font-serif text-base sm:text-lg font-bold leading-snug text-[#1B2A41] line-clamp-2 hover:text-[#A8472F] transition">
                  <Link href={`/article/${encodeURIComponent(item.slug)}`}>
                    {item.title}
                  </Link>
                </h4>
              </div>
            </article>
          ))}

          <Link
            href="/"
            className="mt-4 pt-3 inline-flex items-center text-sm font-semibold text-[#A8472F] hover:text-[#7E3220] transition"
          >
            Voir toute l’actualité nationale et régionale →
          </Link>
        </div>
      </div>
    </section>
  );
}
