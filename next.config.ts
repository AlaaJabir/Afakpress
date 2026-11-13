import type { NextConfig } from "next";

const defaultSupabaseHostname = "zqzwevynueggpyieabzi.supabase.co";
const supabaseHostname = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).hostname : defaultSupabaseHostname;
  } catch {
    return defaultSupabaseHostname;
  }
})();

const geographyRedirects = [
  ["/region/rabat-sale-kenitra", "/region/جهة-الرباط-سلا-القنيطرة"],
  ["/region/casablanca-settat", "/region/جهة-الدار-البيضاء-سطات"],
  ["/region/tanger-tetouan-al-hoceima", "/region/جهة-طنجة-تطوان-الحسيمة"],
  ["/province/rabat", "/province/عمالة-الرباط"],
  ["/province/tanger-assilah", "/province/عمالة-طنجة-ا-صيلة"],
  ["/commune/tanger", "/commune/طنجة"],
] as const;

const nextConfig: NextConfig = {
  async redirects() {
    return geographyRedirects.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "13emeregion.vercel.app",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
