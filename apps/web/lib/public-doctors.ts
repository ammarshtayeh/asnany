import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabase";

/**
 * Public doctor listing shared by GET /api/doctors and the server-rendered homepage.
 *
 * Listing order (when the visitor has not asked for "nearest"):
 *   tier 2 — premium / featured-ads package, or manually featured by admin
 *   tier 1 — directory package
 *   tier 0 — everyone else
 * and by rating inside each tier. An expired package gives no priority.
 */

const PUBLIC_DOCTOR_FIELDS =
  "id, name, category, specialty, city, area, address, phone, whatsapp, bio, lat, lng, image_url, clinic_photos, rating, verified, is_featured, accepts_insurance, insurance_list, working_hours, is_available, availability_note, active_package_slug, package_expires_at";

const TOP_PACKAGE_SLUGS = new Set(["premium", "featured-ads"]);

export type ListingTier = 0 | 1 | 2;

type RankableDoctor = {
  is_featured?: boolean | null;
  active_package_slug?: string | null;
  package_expires_at?: string | null;
};

function packageIsCurrent(expiresAt: string | null | undefined, now: number) {
  if (!expiresAt) return true;
  const expires = Date.parse(expiresAt);
  return Number.isNaN(expires) || expires > now;
}

export function listingTier(doctor: RankableDoctor, now: number = Date.now()): ListingTier {
  const slug = String(doctor.active_package_slug || "");
  const current = packageIsCurrent(doctor.package_expires_at, now);

  // is_featured is switched on by a top package, so an expired top package must not keep it.
  if (TOP_PACKAGE_SLUGS.has(slug)) return current ? 2 : 0;
  if (doctor.is_featured) return 2;
  if (slug && current) return 1;
  return 0;
}

async function activeBookableDoctorIds() {
  const { data, error } = await supabaseAdmin
    .from("doctor_accounts")
    .select("doctor_id")
    .eq("is_active", true);
  if (error) throw error;
  return new Set((data || []).map((row) => row.doctor_id as string));
}

/** Verified doctors, ranked. Throws when the database query fails. */
export async function fetchPublicDoctors(): Promise<any[]> {
  if (!isSupabaseConfigured) return [];

  const query = supabase.from("doctors").select(PUBLIC_DOCTOR_FIELDS).eq("verified", true);
  const [{ data, error }, bookableIds] = await Promise.all([query, activeBookableDoctorIds()]);
  if (error) throw error;

  const now = Date.now();
  const doctors = (data || []).map((row: any) => {
    // The expiry date is only needed for ranking; it is not part of the public payload.
    const { package_expires_at, ...doc } = row;
    return {
      ...doc,
      can_book_online: bookableIds.has(doc.id) || doc.active_package_slug === "premium",
      listing_tier: listingTier(row, now),
    };
  });

  doctors.sort(
    (a: any, b: any) => b.listing_tier - a.listing_tier || (Number(b.rating) || 0) - (Number(a.rating) || 0)
  );

  return doctors;
}
