import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://malamih.ps";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/doctor/", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
