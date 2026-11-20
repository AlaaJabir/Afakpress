export default function TerritoriesLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8" aria-label="Chargement des territoires" aria-busy="true">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="mt-4 h-10 w-64 max-w-full rounded bg-slate-200" />
      <div className="mt-3 h-5 w-full max-w-xl rounded bg-slate-100" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }, (_, index) => <div key={index} className="h-28 rounded-xl bg-slate-100" />)}
      </div>
    </div>
  );
}
