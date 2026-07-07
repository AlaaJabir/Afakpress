export function Newsletter() {
  return (
    <section className="border border-slate-200 bg-slate-950 p-6 text-white">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <h2 className="text-2xl font-black">The Afakpress briefing</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Daily regional and national headlines prepared for readers who follow Morocco closely.</p>
        </div>
        <form className="flex flex-col gap-3 sm:flex-row">
          <input aria-label="Email address" className="min-h-12 flex-1 border border-slate-700 bg-white px-4 text-slate-950 outline-none focus:border-red-500" placeholder="reader@example.com" type="email" />
          <button className="min-h-12 bg-red-700 px-5 text-sm font-black text-white transition hover:bg-red-800" type="submit">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

