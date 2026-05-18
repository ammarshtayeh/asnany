import {
  demoAdvertisements,
  demoAppointments,
  demoDoctors,
  demoStores,
  Doctor,
  Appointment,
  Advertisement,
  Store
} from "@pal-dental/shared";
import { supabase as rawSupabase } from "./supabase";
import { Offer, Article, MarketplaceAd, Review } from "./types";

// Fallback to demo data if Supabase is not configured
const supabase = rawSupabase!;
const USE_DEMO = !rawSupabase;

export async function getDoctors(city?: string, specialty?: string): Promise<Doctor[]> {
  if (USE_DEMO) {
    let result = demoDoctors;
    if (city) result = result.filter((d) => d.city === city);
    if (specialty) result = result.filter((d) => d.specialty === specialty);
    return result;
  }

  try {
    let query = supabase.from("doctors").select("*").eq("verified", true);
    if (city) query = query.eq("city", city);
    if (specialty) query = query.eq("specialty", specialty);

    const { data, error } = await query;
    if (error) throw error;
    return (data as Doctor[]) || [];
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return demoDoctors;
  }
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  if (USE_DEMO) {
    return demoDoctors.find((doctor) => doctor.id === id);
  }

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
    return demoDoctors.find((d) => d.id === id);
  }
}

export async function getDashboardSnapshot() {
  if (USE_DEMO) {
    return {
      doctors: demoDoctors.length,
      featuredDoctors: demoDoctors.filter((doctor) => doctor.isFeatured).length,
      pendingAppointments: demoAppointments.filter(
        (appointment) => appointment.status === "pending"
      ).length,
      activeAds: demoAdvertisements.filter((ad) => ad.isActive).length
    };
  }

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
  if (USE_DEMO) return demoAppointments;

  try {
    const { data, error } = await supabase.from("appointments").select("*");
    if (error) throw error;
    return (data as Appointment[]) || [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return demoAppointments;
  }
}

export async function createAppointment(appointment: Omit<Appointment, "id">) {
  if (USE_DEMO) {
    return { id: `apt-${Date.now()}`, ...appointment };
  }

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
  if (USE_DEMO) return demoAdvertisements;

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
    return demoAdvertisements;
  }
}

export async function trackAdClick(adId: string) {
  if (USE_DEMO) return;

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
  if (USE_DEMO) return demoStores;

  try {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;
    return (data as Store[]) || [];
  } catch (error) {
    console.error("Error fetching stores:", error);
    return demoStores;
  }
}

// ==========================================
// 🏷️ OFFERS HANDLERS & DEMO DATA
// ==========================================
export const demoOffers: Offer[] = [
  {
    id: "o1",
    title: "خصم 30% على زراعة الأسنان الألمانية فورية",
    description: "زرعة ألمانية مع كفالة مدى الحياة مع طاقم طبي متخصص وخبرة سنوات، تشتمل الصورة البانورامية والاستشارة المجانية.",
    doctor_id: "1",
    doctor_name: "د. أحمد محمود",
    discount_percentage: 30,
    original_price: 3500,
    discounted_price: 2450,
    image_url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=400&auto=format&fit=crop",
    valid_until: new Date(Date.now() + 86400000 * 7).toISOString()
  },
  {
    id: "o2",
    title: "فحص مجاني وتبييض ليزر بخصم 40% بمناسبة الصيف",
    description: "احصل على ابتسامة أحلامك بجلسة واحدة آمنة وسريعة باستخدام أحدث أجهزة الليزر البارد وتبييض Zoom الشهير.",
    doctor_id: "3",
    doctor_name: "د. خالد عبد الله",
    discount_percentage: 40,
    original_price: 1200,
    discounted_price: 720,
    image_url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=400&auto=format&fit=crop",
    valid_until: new Date(Date.now() + 86400000 * 3).toISOString()
  }
];

export async function getOffers(): Promise<Offer[]> {
  if (USE_DEMO) return demoOffers;

  try {
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .gte("valid_until", new Date().toISOString());

    if (error) throw error;
    return (data as Offer[]) || [];
  } catch (error) {
    console.error("Error fetching offers:", error);
    return demoOffers;
  }
}

// ==========================================
// 📝 MEDICAL ARTICLES (BLOG) HANDLERS & DEMO
// ==========================================
export const demoArticles: Article[] = [
  {
    id: "a1",
    title: "أسباب ألم ضرس العقل ومدى خطورة تأخير إزالته",
    excerpt: "تعرف على الأعراض الشائعة لالتهاب ضرس العقل المطمور والخيارات العلاجية الفعالة والجراحية المتاحة بالعيادات.",
    content: "ضرس العقل هو آخر الضروس التي تنمو في الفم وعادة ما يظهر بين عمر 17 و 25 سنة. في كثير من الأحيان، لا يجد ضرس العقل مساحة كافية للنمو بشكل طبيعي مما يجعله مطموراً جزئياً أو كلياً تحت اللثة.\n\n**الأعراض الشائعة لمشاكل ضرس العقل:**\n1. ألم حاد نابض في زاوية الفك يمتد أحياناً للأذن أو الصدغ.\n2. تورم واحمرار لثة ضرس العقل وصعوبة بالغة بفتح الفم بالكامل.\n3. رائحة فم غير مستحبة ناتجة عن تجمع بقايا الطعام.\n\n**لماذا لا يجب تأخير العلاج؟**\nتأخير علاج ضرس العقل المطمور قد يسبب تآكل جذور الضروس المجاورة أو تشكل أكياس مائية حول السن مما يضعف عظم الفك. لذلك، الفحص المبكر وصورة الأشعة البانورامية بالعيادة هي الخطوة الأولى والأساسية لتحديد الحاجة للإزالة الجراحية الميسرة.",
    image_url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=400&auto=format&fit=crop",
    doctor_id: "1",
    doctor_name: "د. أحمد محمود",
    category: "جراحة الفكين",
    date: "15 مايو 2026",
    read_time: "4 دقائق"
  },
  {
    id: "a2",
    title: "كيف تختار نوع تقويم الأسنان المناسب لك؟",
    excerpt: "مقارنة شاملة بين التقويم المعدني التقليدي، التقويم الخزفي التجميلي، والتقويم الشفاف الحديث وفوائد كل نوع.",
    content: "تقويم الأسنان ليس تجميلياً فحسب، بل هو علاج وظيفي يعيد تنظيم إطباق الفكين وتصحيح العضة مما يسهل مضغ الطعام ويحمي مفصل الفك.\n\n**الأنواع المتاحة بالعيادات الفسطينية حالياً:**\n1. **التقويم المعدني التقليدي:** الأكثر متانة والأوفر تكلفة، ومناسب لحالات الاعوجاج الشديدة.\n2. **التقويم الخزفي (السيراميك):** يتميز بلونه القريب جداً من الأسنان الطبيعية مما يجعله خياراً تجميلياً رائعاً.\n3. **التقويم الشفاف (Clear Aligners):** أحدث صيحة علاجية، يمتاز بأنه غير مرئي وقابل للإزالة عند تناول الطعام مما يحافظ على صحة اللثة.\n\nتواصل مع أخصائي التقويم لتحديد الخطة المناسبة لحالتك وعمل الطبعة الرقمية ثلاثية الأبعاد لبدء رحلتك لابتسامة مثالية.",
    image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    doctor_id: "2",
    doctor_name: "د. سارة عيسى",
    category: "تقويم الأسنان",
    date: "10 مايو 2026",
    read_time: "5 دقائق"
  }
];

export async function getArticles(): Promise<Article[]> {
  if (USE_DEMO) return demoArticles;

  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as Article[]) || [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return demoArticles;
  }
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  if (USE_DEMO) return demoArticles.find(a => a.id === id);

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
    return demoArticles.find(a => a.id === id);
  }
}

// ==========================================
// 🛒 B2B MARKETPLACE HANDLERS & DEMO DATA
// ==========================================
export const demoMarketplaceAds: MarketplaceAd[] = [
  {
    id: "1",
    title: "كرسي أسنان إيطالي مستعمل بحالة ممتازة (Anthos)",
    type: "equipment",
    category: "كراسي أسنان",
    price: "12,500 شيكل",
    publisher: "عيادة د. رمزي للأشعة والأسنان",
    city: "رام الله",
    date: "أمس",
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=400&auto=format&fit=crop",
    description: "كرسي أسنان إيطالي Anthos كامل مع ملحقاته وجهاز التعقيم، صيانة دورية ممتازة، شغال 100% والبيع بسبب التحديث لعيادة أوسع.",
    phone: "+970599000000"
  },
  {
    id: "2",
    title: "مطلوب طبيب أسنان ممارس عام لعيادة في نابلس",
    type: "job",
    category: "أطباء أسنان",
    salary: "حسب النسبة والاتفاق",
    publisher: "مجمع نابلس التخصصي لطب الأسنان",
    city: "نابلس",
    date: "قبل يومين",
    is_featured: true,
    description: "نبحث عن طبيب أسنان بخبرة لا تقل عن سنتين للعمل في الفترة المسائية، يفضل من يجيد علاج العصب والتركيبات الأساسية.",
    phone: "+970599111111"
  }
];

export async function getMarketplaceAds(): Promise<MarketplaceAd[]> {
  if (USE_DEMO) return demoMarketplaceAds;

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
    return demoMarketplaceAds;
  }
}

// ==========================================
// ⭐ REVIEWS & RATINGS HANDLERS
// ==========================================
export async function getReviewsByDoctorId(doctorId: string): Promise<Review[]> {
  if (USE_DEMO) {
    return [
      { id: "r1", doctor_id: doctorId, patient_name: "سامر أبو فؤاد", rating: 5, comment: "دكتور ممتاز ومحترف جداً، العيادة مجهزة بأحدث التقنيات والمعاملة رائعة.", is_approved: true, created_at: new Date().toISOString() },
      { id: "r2", doctor_id: doctorId, patient_name: "نهى المصري", rating: 4, comment: "الخدمة ممتازة ودقة في المواعيد، أنصح به بشدة لعلاج عصب الأسنان.", is_approved: true, created_at: new Date().toISOString() }
    ];
  }

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
  if (USE_DEMO) {
    return { id: `rev-${Date.now()}`, ...review, is_approved: false, created_at: new Date().toISOString() };
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert([review])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
}


export async function createStore(store: Omit<Store, "id">) {
  if (USE_DEMO) {
    return { id: `store-${Date.now()}`, ...store };
  }

  try {
    const { data, error } = await supabase.from("stores").insert([store]).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating store:", error);
    throw error;
  }
}

export async function createMarketplaceAd(ad: Omit<MarketplaceAd, "id" | "date" | "is_featured">) {
  if (USE_DEMO) {
    return { id: `ad-${Date.now()}`, date: "الآن", is_featured: false, ...ad };
  }

  try {
    const { data, error } = await supabase.from("marketplace_ads").insert([{ ...ad, is_active: true }]).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating marketplace ad:", error);
    throw error;
  }
}

export async function createOffer(offer: Omit<Offer, "id">) {
  if (USE_DEMO) {
    return { id: `off-${Date.now()}`, ...offer };
  }

  try {
    const { data, error } = await supabase.from("offers").insert([offer]).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating offer:", error);
    throw error;
  }
}

