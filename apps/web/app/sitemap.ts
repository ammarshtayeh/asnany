import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.malamih.ps").replace(/\/$/, "");

const staticRoutes = [
  "",
  "/doctors/search",
  "/booking",
  "/subscriptions",
  "/offers",
  "/marketplace",
  "/join",
  "/advertise",
  "/about",
  "/privacy",
  "/terms",
  "/blog",
  "/beauty",
  "/labs",
  "/consultations",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
