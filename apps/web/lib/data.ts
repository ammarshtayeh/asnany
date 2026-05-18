import {
  Doctor,
  Appointment,
  Advertisement,
  Store
} from "@pal-dental/shared";
import { supabase } from "./supabase";
import { Offer, Article, MarketplaceAd, Review } from "./types";

// Force database execution globally
const USE_DEMO = false;

export async function getDoctors(city?: string, specialty?: string): Promise<Doctor[]> {
  try {
    let query = supabase.from("doctors").select("*").eq("verified", true);
    if (city) query = query.eq("city", city);
    if (specialty) query = query.eq("specialty", specialty);

    const { data, error } = await query;
    if (error) throw error;
    return (data as Doctor[]) || [];
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Doctor;
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return undefined;
  }
}

export async function getDashboardSnapshot() {
  try {
    const [doctorsRes, appointmentsRes, adsRes] = await Promise.all([
      supabase.from("doctors").select("id").eq("verified", true),
      supabase.from("appointments").select("id").eq("status", "pending"),
      supabase.from("advertisements").select("id").eq("is_active", true)
    ]);

    return {
      doctors: doctorsRes.data?.length || 0,
      featuredDoctors: doctorsRes.data?.filter((d: any) => d.is_featured).length || 0,
      pendingAppointments: appointmentsRes.data?.length || 0,
      activeAds: adsRes.data?.length || 0
    };
  } catch (error) {
    console.error("Error fetching dashboard snapshot:", error);
    return {
      doctors: 0,
      featuredDoctors: 0,
      pendingAppointments: 0,
      activeAds: 0
    };
  }
}

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase.from("appointments").select("*");
    if (error) throw error;
    return (data as Appointment[]) || [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

export async function createAppointment(appointment: Omit<Appointment, "id">) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .insert([appointment])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}

export async function getAdvertisements(): Promise<Advertisement[]> {
  try {
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString().split("T")[0]);

    if (error) throw error;
    return (data as Advertisement[]) || [];
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    return [];
  }
}

export async function trackAdClick(adId: string) {
  try {
    const { data, error } = await supabase
      .from("advertisements")
      .select("clicks")
      .eq("id", adId)
      .single();

    if (!error && data) {
      await supabase
        .from("advertisements")
        .update({ clicks: (data.clicks || 0) + 1 })
        .eq("id", adId);
    }
  } catch (error) {
    console.error("Error tracking ad click:", error);
  }
}

export async function getStores(): Promise<Store[]> {
  try {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;
    return (data as Store[]) || [];
  } catch (error) {
    console.error("Error fetching stores:", error);
    return [];
  }
}

export async function getOffers(): Promise<Offer[]> {
  try {
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .gte("valid_until", new Date().toISOString());

    if (error) throw error;
    return (data as Offer[]) || [];
  } catch (error) {
    console.error("Error fetching offers:", error);
    return [];
  }
}

export async function getArticles(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as Article[]) || [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Article;
  } catch (error) {
    console.error("Error fetching article by id:", error);
    return undefined;
  }
}

export async function getMarketplaceAds(): Promise<MarketplaceAd[]> {
  try {
    const { data, error } = await supabase
      .from("marketplace_ads")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false });

    if (error) throw error;
    return (data as MarketplaceAd[]) || [];
  } catch (error) {
    console.error("Error fetching marketplace ads:", error);
    return [];
  }
}

export async function getReviewsByDoctorId(doctorId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as Review[]) || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function createReview(review: Omit<Review, "id" | "is_approved" | "created_at">) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert([{ ...review, is_approved: false }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
}

export async function createStore(store: any) {
  try {
    const dbStore = {
      store_name: store.storeName || store.store_name,
      description: store.description,
      city: store.city,
      phone: store.phone,
      whatsapp: store.whatsapp,
      website: store.website,
      logo_url: store.logoUrl || store.logo_url,
      specialization: store.specialization,
      is_active: false // Admin must approve
    };
    const { data, error } = await supabase.from("stores").insert([dbStore]).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating store:", error);
    throw error;
  }
}

export async function createMarketplaceAd(ad: any) {
  try {
    const dbAd = {
      ...ad,
      is_active: false // Admin must approve
    };
    const { data, error } = await supabase.from("marketplace_ads").insert([dbAd]).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating marketplace ad:", error);
    throw error;
  }
}

export async function createOffer(offer: Omit<Offer, "id">) {
  try {
    const { data, error } = await supabase.from("offers").insert([offer]).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating offer:", error);
    throw error;
  }
}
