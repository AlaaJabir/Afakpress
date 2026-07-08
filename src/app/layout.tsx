import type { Metadata } from "next";
import "./globals.css";
import { CmsShell } from "@/components/CmsShell";

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CmsShell>{children}</CmsShell>
      </body>
    </html>
  );
}
