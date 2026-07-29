import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CmsShell } from "@/components/CmsShell";
import { loadSupabaseCmsStateServer } from "@/lib/supabase-cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Afakpress",
  description: "Moroccan press and regional news platform",
  icons: {
    icon: "/afakpress-logo.png",
    shortcut: "/afakpress-logo.png",
    apple: "/afakpress-logo.png",
  },
  openGraph: {
    title: "Afakpress",
    description: "Moroccan press and regional news platform",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let cmsState = null;
  try {
    cmsState = await loadSupabaseCmsStateServer();
  } catch (error) {
    console.error("[RootLayout] Initial Supabase CMS load failed:", error);
  }

  return (
    <html lang="en">
      <body>
        <CmsShell initialState={cmsState ?? undefined} initiallyLoaded={Boolean(cmsState)}>{children}</CmsShell>
      </body>
    </html>
  );
}
