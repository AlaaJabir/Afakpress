import type { NextConfig } from "next";

const supabaseHostname = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
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
  output: "standalone",
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
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              port: "",
              pathname: "/storage/v1/object/public/media/**",
            },
          ]
        : []),
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
