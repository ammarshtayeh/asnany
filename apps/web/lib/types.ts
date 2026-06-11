export type Doctor = {
  id: string;
  name: string;
  category?: 'أسنان' | 'عيون' | 'أنف وأذن وحنجرة' | 'جلدية' | 'تجميل';
  specialty: string[];
  city: string;
  area?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  lat?: number;
  lng?: number;
  working_hours?: Record<string, string>;
  is_available?: boolean;
  availability_note?: string;
  accepts_discount_card?: boolean;
  discount_value?: string;
  discount_note?: string;
  accepts_insurance: boolean;
  insurance_list?: string[];
  image_url?: string;
  clinic_photos?: string[];
  bio?: string;
  rating: number;
  is_featured: boolean;
  featured_until?: string;
  verified: boolean;
  created_at: string;
  distance?: number; // for frontend sorting
};

export type Advertisement = {
  id: string;
  advertiser_name: string;
  advertiser_type: 'doctor' | 'store';
  ad_type: 'featured' | 'banner' | 'sidebar';
  image_url: string;
  link_url: string;
  whatsapp?: string;
  target_region?: string;
  target_specialty?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  clicks: number;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  doctor_id: string;
  doctor_name: string;
  discount_percentage: number;
  original_price?: number;
  discounted_price?: number;
  image_url: string;
  valid_until: string;
};

export type Store = {
  id: string;
  name: string;
  category: string; // e.g. "أجهزة ومعدات", "مواد استهلاكية"
  city: string;
  description: string;
  logo_url: string;
  phone: string;
  whatsapp: string;
  website?: string;
};

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  doctor_id: string;
  doctor_name: string;
  category: string;
  date: string;
  read_time: string;
};

export type MarketplaceAd = {
  id: string;
  title: string;
  type: "equipment" | "job";
  category: string;
  price?: string;
  salary?: string;
  publisher: string;
  city: string;
  date: string;
  is_featured: boolean;
  image_url?: string;
  description: string;
  phone: string;
};

export type Review = {
  id: string;
  doctor_id: string;
  patient_name: string;
  rating: number;
  comment?: string;
  is_approved: boolean;
  created_at: string;
};

export type DoctorAccount = {
  id: string;
  doctor_id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  doctors?: Doctor;
};

export type AppointmentRecord = {
  id: string;
  doctor_id: string;
  patient_name: string;
  patient_full_name?: string;
  patient_email?: string;
  patient_phone: string;
  patient_identity?: string;
  patient_address?: string;
  date: string;
  time?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  created_at: string;
};

export type MedicalServiceType = "beauty" | "lab" | "consultation" | "partner" | "media" | "booking";

export type MedicalService = {
  id: string;
  service_type: MedicalServiceType;
  name: string;
  category?: string;
  city?: string;
  area?: string;
  description?: string;
  services?: string[];
  price_range?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  image_url?: string;
  gallery?: string[];
  address?: string;
  lat?: number;
  lng?: number;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
};
