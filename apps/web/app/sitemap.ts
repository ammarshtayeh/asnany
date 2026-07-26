import type { MetadataRoute } from "next";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.malamih.ps").replace(/\/$/, "");

const staticRoutes = [
  "",
  "/doctors/search",
  "/booking",
  "/appointments",
  "/subscriptions",
  "/offers",
  "/marketplace",
  "/join",
  "/advertise",
  "/about",
  "/trust",
  "/privacy",
  "/terms",
  "/blog",
  "/discount-card",
  "/stores",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  if (!isSupabaseConfigured) return staticEntries;

  try {
    const { data, error } = await supabaseAdmin
      .from("doctors")
      .select("id, created_at")
      .eq("verified", true)
      .limit(500);

    if (error) throw error;

    const doctorEntries: MetadataRoute.Sitemap = (data || []).map((doctor) => ({
      url: `${base}/doctors/${doctor.id}`,
      lastModified: doctor.created_at ? new Date(doctor.created_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...doctorEntries];
  } catch (error) {
    console.error("Sitemap doctors error:", error);
    return staticEntries;
  }
}
