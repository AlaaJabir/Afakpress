import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Landmark, Newspaper } from "lucide-react";
import { GeographicArticleList } from "@/components/PublicRouteViews";
import {
  MinistryInfoSidebarCard,
  MinistryOfficialsSection,
} from "@/components/ministries/MinistryModules";
import {
  MINISTRY_GROUPS,
  MOROCCAN_MINISTRIES,
  getMinistryBySlug,
} from "@/lib/ministries-data";
import {
  getArticlesForMinistry,
  getMinistryPageDetails,
  getProfilesForMinistry,
} from "@/lib/ministries-db";

export const revalidate = 60;
export const dynamicParams = true;

export default async function MinistryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ministry = getMinistryBySlug(slug);
  if (!ministry) notFound();

  const groupMeta = MINISTRY_GROUPS.find((g) => g.id === ministry.groupId);
  const siblingMinistries = MOROCCAN_MINISTRIES.filter(
    (m) => m.groupId === ministry.groupId
  );

  const [profiles, pageContent] = await Promise.all([
    getProfilesForMinistry(ministry.slug),
    getMinistryPageDetails(ministry.slug),
  ]);

  const articles = await getArticlesForMinistry(ministry, profiles);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]" dir="rtl">
      <section className="min-w-0">
        {/* Breadcrumb */}
        <nav
          aria-label="مسار التنقل"
          className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-500"
        >
          <Link href="/" className="hover:text-[#b91c1c] transition">
            الرئيسية
          </Link>
          <ChevronLeft className="size-3.5 text-slate-400" />
          <span className="text-slate-600">الوزارات</span>
          <ChevronLeft className="size-3.5 text-slate-400" />
          <span className="text-[#b91c1c]">{ministry.groupNameAr}</span>
        </nav>

        {/* Ministry Hero Header & Content Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#b91c1c]">
              <Landmark className="size-3.5" />
              <span>{ministry.groupNameAr}</span>
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 tabular-nums">
              رقم {String(ministry.number).padStart(2, "0")}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight text-[#0b1930] sm:text-4xl">
            {ministry.nameAr}
          </h1>

          {pageContent?.overview ? (
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-sm leading-7 text-slate-700 whitespace-pre-line sm:text-base">
              {pageContent.overview}
            </div>
          ) : groupMeta ? (
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              متابعة أخبار، قرارات، وبلاغات {ministry.nameAr} ومشاريعها الوطنية والجهوية ({groupMeta.descriptionAr}).
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Newspaper className="size-3.5 text-[#b91c1c]" />
              <span>{articles.length} مقال مرتبط بهذا القطاع</span>
            </span>
          </div>
        </div>

        {/* Minister / Sector Officials Profiles ABOVE the Articles */}
        <div className="mt-8">
          <MinistryOfficialsSection
            ministryName={ministry.nameAr}
            profiles={profiles}
          />
        </div>

        {/* Articles Feed */}
        <div className="mt-8">
          <div className="mb-5 flex items-center justify-between border-b-4 border-[#b91c1c] pb-3">
            <h2 className="text-xl font-black text-[#0b1930]">
              أخبار وتغطيات {ministry.nameAr}
            </h2>
          </div>

          {articles.length > 0 ? (
            <GeographicArticleList articles={articles} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-600">
              <Landmark className="mx-auto size-8 text-slate-300 mb-3" />
              <p className="text-base font-bold text-slate-700">
                لا توجد مقالات منشورة مخصصة لـ «{ministry.nameAr}» حالياً.
              </p>
              <p className="mt-1.5 text-xs text-slate-500">
                أي مقال جديد يتم نشره حول هذه الوزارة أو وزيرها سيظهر تلقائياً في هذه الصفحة.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Sidebar: Ministry Card, Sibling Ministries & Other Poles */}
      <aside className="space-y-6 self-start">
        <MinistryInfoSidebarCard
          ministry={ministry}
          content={pageContent}
          profilesCount={profiles.length}
          articlesCount={articles.length}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="border-b-4 border-[#b91c1c] pb-3 text-lg font-black text-[#0b1930]">
            {ministry.groupNameAr}
          </h2>
          <ul className="mt-4 space-y-2">
            {siblingMinistries.map((item) => {
              const isCurrent = item.slug === ministry.slug;
              return (
                <li key={item.slug}>
                  <Link
                    href={`/ministere/${encodeURIComponent(item.slug)}`}
                    className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold leading-5 transition ${
                      isCurrent
                        ? "bg-[#b91c1c] text-white shadow-xs"
                        : "bg-slate-50/70 text-slate-700 hover:bg-red-50 hover:text-[#b91c1c]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black tabular-nums ${
                        isCurrent
                          ? "bg-white/20 text-white"
                          : "bg-slate-200/80 text-slate-600"
                      }`}
                    >
                      {String(item.number).padStart(2, "0")}
                    </span>
                    <span>{item.nameAr}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="border-b-4 border-[#0b1930] pb-3 text-lg font-black text-[#0b1930]">
            باقي الأقطاب الوزارية
          </h2>
          <div className="mt-4 grid gap-2">
            {MINISTRY_GROUPS.filter((g) => g.id !== ministry.groupId).map((group) => {
              const firstInGroup = MOROCCAN_MINISTRIES.find((m) => m.groupId === group.id);
              if (!firstInGroup) return null;
              return (
                <Link
                  key={group.id}
                  href={`/ministere/${encodeURIComponent(firstInGroup.slug)}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-xs font-black text-[#0b1930] transition hover:border-red-200 hover:bg-red-50/60 hover:text-[#b91c1c]"
                >
                  <span>{group.nameAr}</span>
                  <ChevronLeft className="size-4 text-slate-400" />
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
