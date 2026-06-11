export interface Doctor {
  id: string;
  name: string;
  category?: 'أسنان' | 'عيون' | 'أنف وأذن وحنجرة' | 'جلدية' | 'تجميل';
  specialty: string[];
  city: string;
  area: string;
  address?: string;
  phone: string;
  whatsapp: string;
  bio: string;
  lat: number;
  lng: number;
  image_url: string;
  clinic_photos: string[];
  insurance_list: string[];
  working_hours: any;
  verified: boolean;
  is_featured: boolean;
  rating: number;
  accepts_insurance: boolean;
}

export interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
}

export interface Store {
  id: string;
  store_name: string;
  description: string;
  city: string;
  phone: string;
  whatsapp: string;
  website: string;
  logo_url: string;
  specialization: string;
  is_active: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount_pct?: number;
  discount_percentage?: number;
  doctor_name?: string;
  doctor_id?: string;
  original_price?: number;
  discounted_price?: number;
  valid_until: string;
  image_url: string;
}

export interface MarketplaceAd {
  id: string;
  title: string;
  description: string;
  type?: "equipment" | "job";
  category?: string;
  price?: string | number;
  salary?: string;
  publisher?: string;
  city: string;
  phone: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
}

export interface Article {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  author?: string;
  doctor_id?: string;
  doctor_name?: string;
  category?: string;
  image_url?: string;
  date?: string;
  read_time?: string;
  created_at: string;
}

export interface Review {
  id: string;
  doctor_id: string;
  name?: string;
  patient_name?: string;
  rating: number;
  text?: string;
  comment?: string;
  is_approved: boolean;
  created_at: string;
}

export type MedicalServiceType = "beauty" | "lab" | "consultation" | "partner" | "media" | "booking";

export interface MedicalService {
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
  address?: string;
  rating?: number;
  is_featured?: boolean;
  is_active?: boolean;
}
