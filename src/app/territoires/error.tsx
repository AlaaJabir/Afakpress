"use client";

export default function TerritoriesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center" role="alert">
      <h1 className="text-2xl font-black text-slate-950">Impossible de charger les territoires</h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">Une erreur est survenue pendant le chargement. Vos données n’ont pas été modifiées.</p>
      <button type="button" onClick={() => reset()} className="mt-6 inline-flex min-h-11 items-center rounded-md bg-red-700 px-5 text-sm font-bold text-white hover:bg-red-800">Réessayer</button>
    </div>
  );
}
