export interface Doctor {
  id: string;
  name: string;
  specialty: string[];
  city: string;
  area: string;
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
  discount_pct: number;
  valid_until: string;
  image_url: string;
}

export interface MarketplaceAd {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  phone: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export interface Review {
  id: string;
  doctor_id: string;
  name: string;
  rating: number;
  text: string;
  is_approved: boolean;
  created_at: string;
}
