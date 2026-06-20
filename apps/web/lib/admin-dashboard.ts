import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export type AdminDashboardStats = {
  totalDoctors: number;
  verifiedDoctors: number;
  pendingDoctors: number;
  activeAds: number;
  activeStores: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalServices: number;
};

const empty: AdminDashboardStats = {
  totalDoctors: 0,
  verifiedDoctors: 0,
  pendingDoctors: 0,
  activeAds: 0,
  activeStores: 0,
  totalAppointments: 0,
  pendingAppointments: 0,
  totalServices: 0,
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  if (!isSupabaseConfigured) return empty;

  try {
    const today = new Date().toISOString().split("T")[0];
    const [doctorsRes, appointmentsRes, adsRes, storesRes, servicesRes] = await Promise.all([
      supabaseAdmin.from("doctors").select("id, verified"),
      supabaseAdmin.from("appointments").select("id, status"),
      supabaseAdmin.from("advertisements").select("id").eq("is_active", true).gte("end_date", today),
      supabaseAdmin.from("stores").select("id").eq("is_active", true),
      supabaseAdmin.from("medical_services").select("id"),
    ]);

    if (doctorsRes.error) throw doctorsRes.error;
    if (appointmentsRes.error) throw appointmentsRes.error;
    if (adsRes.error) throw adsRes.error;
    if (storesRes.error) throw storesRes.error;
    if (servicesRes.error) throw servicesRes.error;

    const doctors = doctorsRes.data || [];
    const appointments = appointmentsRes.data || [];

    return {
      totalDoctors: doctors.length,
      verifiedDoctors: doctors.filter((row) => row.verified).length,
      pendingDoctors: doctors.filter((row) => !row.verified).length,
      activeAds: adsRes.data?.length || 0,
      activeStores: storesRes.data?.length || 0,
      totalAppointments: appointments.length,
      pendingAppointments: appointments.filter((row) => row.status === "pending").length,
      totalServices: servicesRes.data?.length || 0,
    };
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    return empty;
  }
}

export async function getAdminRecentDoctors(limit = 5) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabaseAdmin
    .from("doctors")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Admin recent doctors error:", error);
    return [];
  }
  return data || [];
}

export async function getAdminRecentStores(limit = 5) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabaseAdmin
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Admin recent stores error:", error);
    return [];
  }
  return data || [];
}
