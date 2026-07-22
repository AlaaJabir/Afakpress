"use client";

import "./globals.css";
import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white">
          <section className="max-w-lg text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-red-300">Afakpress</p>
            <h1 className="mt-4 text-3xl font-black">The site hit a recoverable error.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">Reload the page data without leaving Afakpress.</p>
            <button className="mt-6 bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-red-100" onClick={() => unstable_retry()} type="button">
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
