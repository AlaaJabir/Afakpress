import type { Metadata } from "next";
import "./globals.css";
import { BreakingNewsBar } from "@/components/BreakingNewsBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { breakingNews } from "@/data/articles";

export const metadata: Metadata = {
  title: "Afakpress",
  description: "Moroccan press and regional news platform",
  openGraph: {
    title: "Afakpress",
    description: "Moroccan press and regional news platform",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <BreakingNewsBar articles={breakingNews} />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
