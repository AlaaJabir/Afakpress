import Link from "next/link";

export default function TerritoryNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-xs font-black uppercase tracking-wider text-red-700">Afakpress · Maroc</p>
      <h1 className="mt-3 text-3xl font-black text-slate-950">Territoire introuvable</h1>
      <p className="mt-3 text-sm text-slate-600">Ce territoire n’existe pas ou son adresse a changé.</p>
      <Link href="/territoires" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-red-700 px-5 text-sm font-bold text-white">Explorer les territoires</Link>
    </div>
  );
}
