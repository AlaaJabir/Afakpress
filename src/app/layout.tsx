import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { CmsShell } from "@/components/CmsShell";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={`${cairo.className} font-sans antialiased`}>
        <CmsShell>{children}</CmsShell>
      </body>
    </html>
  );
}
