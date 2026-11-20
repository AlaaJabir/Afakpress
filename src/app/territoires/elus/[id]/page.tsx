import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOfficialProfileData } from "@/lib/territories";
import { supabaseProjectUrl } from "@/lib/supabase";

type Props = PageProps<"/territoires/elus/[id]">;

function imageUrl(path: string | null) {
  const base = supabaseProjectUrl;
  return base && path ? `${base}/storage/v1/object/public/territory-media/${path.split("/").map(encodeURIComponent).join("/")}` : "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getOfficialProfileData(id);
  if (result.status !== "ok") return { title: "Élu | Afakpress" };
  return { title: `${result.data.official.full_name} | Afakpress`, description: result.data.official.bio || result.data.official.role };
}

export default async function OfficialProfilePage({ params }: Props) {
  const { id } = await params;
  const result = await getOfficialProfileData(id);
  if (result.status === "not-found") notFound();
  if (result.status !== "ok") return <div className="mx-auto max-w-3xl px-4 py-16 text-center">Le profil est temporairement indisponible.</div>;
  const { official, territory, region, province } = result.data;
  const photo = imageUrl(official.photo_path);
  const territoryHref = official.territory_type === "region"
    ? `/territoires/${encodeURIComponent(territory.slug)}`
    : official.territory_type === "province" && region
      ? `/territoires/${encodeURIComponent(region.slug)}/${encodeURIComponent(territory.slug)}`
      : official.territory_type === "commune" && region && province
        ? `/territoires/${encodeURIComponent(region.slug)}/${encodeURIComponent(province.slug)}/${encodeURIComponent(territory.slug)}`
        : "/territoires";
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6" dir="ltr">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500"><Link href="/territoires" className="hover:text-red-700">Territoires</Link> <span aria-hidden="true">/</span> <Link href={territoryHref} className="hover:text-red-700">{territory.name_fr || territory.name || territory.slug}</Link> <span aria-hidden="true">/</span> <span className="text-slate-800">{official.full_name}</span></nav>
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {photo ? <Image src={photo} alt={official.full_name} width={180} height={180} className="h-36 w-36 rounded-full object-cover sm:h-44 sm:w-44" /> : <div className="flex h-36 w-36 items-center justify-center rounded-full bg-slate-100 text-4xl font-black text-slate-500">{official.full_name.slice(0,1)}</div>}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-xs font-black uppercase tracking-wider text-red-700">Profil public</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{official.full_name}</h1>
            {official.full_name_ar ? <p dir="rtl" className="mt-2 text-xl text-slate-600">{official.full_name_ar}</p> : null}
            <p className="mt-3 text-lg font-bold text-red-700">{official.role}</p>
            {official.party ? <p className="mt-2 text-sm text-slate-600">{official.party}</p> : null}
            <p className="mt-3 text-sm text-slate-500">{territory.name_fr || territory.name} · {official.territory_type}</p>
          </div>
        </div>
        <dl className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div><dt className="text-xs font-bold text-slate-500">Début du mandat</dt><dd className="mt-1 font-bold text-slate-900">{official.mandate_start || "Non renseigné"}</dd></div>
          <div><dt className="text-xs font-bold text-slate-500">Fin du mandat</dt><dd className="mt-1 font-bold text-slate-900">{official.mandate_end || "Non renseignée"}</dd></div>
          <div><dt className="text-xs font-bold text-slate-500">Institution</dt><dd className="mt-1 font-bold text-slate-900">{official.house?.replaceAll("_", " ") || "Non renseignée"}</dd></div>
        </dl>
        {official.bio ? <section className="mt-8 border-t border-slate-100 pt-6"><h2 className="text-xl font-black text-slate-950">Biographie</h2><p className="mt-3 whitespace-pre-line text-sm leading-8 text-slate-700">{official.bio}</p></section> : null}
      </article>
      <Link href={territoryHref} className="mt-5 inline-flex min-h-11 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:border-red-300 hover:text-red-700">Retour au territoire</Link>
    </div>
  );
}
