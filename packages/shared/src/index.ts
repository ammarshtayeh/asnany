export type WorkingHours = Record<
  string,
  {
    open: string;
    close: string;
    closed?: boolean;
  }
>;

export type Doctor = {
  id: string;
  name: string;
  category?: 'أسنان' | 'عيون' | 'أنف وأذن وحنجرة' | 'جلدية' | 'تجميل';
  specialty: string | string[];
  city: string;
  area: string;
  address: string;
  phone: string;
  whatsapp?: string;
  lat: number;
  lng: number;
  working_hours?: WorkingHours;
  workingHours?: WorkingHours;
  is_available?: boolean;
  availability_note?: string;
  accepts_discount_card?: boolean;
  discount_value?: string;
  discount_note?: string;
  accepts_insurance?: boolean;
  acceptsInsurance?: boolean;
  insurance_list?: string[];
  insuranceList?: string[];
  image_url?: string;
  imageUrl?: string;
  rating: number;
  is_featured?: boolean;
  isFeatured?: boolean;
  verified: boolean;
  created_at?: string;
};

export type Appointment = {
  id: string;
  doctor_id?: string;
  doctorId?: string;
  patient_name?: string;
  patient_full_name?: string;
  patientName: string;
  patient_phone?: string;
  patientPhone: string;
  patient_identity?: string;
  patient_address?: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  created_at?: string;
};

export type AppointmentInput = Omit<Appointment, "id" | "created_at">;

export type Advertisement = {
  id: string;
  advertiser_name?: string;
  advertiserName?: string;
  advertiser_type?: "doctor" | "store";
  advertiserType?: "doctor" | "store";
  ad_type?: "featured" | "banner" | "sidebar";
  adType?: "featured" | "banner" | "sidebar";
  image_url?: string;
  imageUrl?: string;
  link_url?: string;
  linkUrl?: string;
  target_region?: string;
  targetRegion?: string;
  target_specialty?: string;
  targetSpecialty?: string;
  is_active?: boolean;
  isActive?: boolean;
  clicks?: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
};

export type Store = {
  id: string;
  store_name?: string;
  storeName?: string;
  description?: string;
  city: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  logo_url?: string;
  logoUrl?: string;
  specialization?: string;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
};

export type Review = {
  id: string;
  doctor_id: string;
  patient_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  doctor_id?: string;
  created_at: string;
};

// Demo data
export const demoDoctors: Doctor[] = [
  {
    id: "dr-lina-khalil",
    name: "د. لينا خليل",
    category: "أسنان",
    specialty: ["تقويم الأسنان"],
    city: "Ramallah",
    area: "الماسيون",
    address: "شارع الإرسال، رام الله",
    phone: "+970599000111",
    whatsapp: "+970599000111",
    lat: 31.9074,
    lng: 35.2044,
    workingHours: {
      sunday: { open: "09:00", close: "17:00" },
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "15:00" },
      friday: { open: "00:00", close: "00:00", closed: true },
      saturday: { open: "10:00", close: "14:00" }
    },
    acceptsInsurance: true,
    insuranceList: ["NatHealth", "Palestine Insurance"],
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
    rating: 4.8,
    isFeatured: true,
    verified: true
  },
  {
    id: "dr-rania-jaber",
    name: "د. رانيا جابر",
    category: "جلدية",
    specialty: ["جلدية وتجميل", "ليزر وإزالة شعر"],
    city: "Ramallah",
    area: "البيرة",
    address: "شارع القدس، البيرة",
    phone: "+970599111222",
    whatsapp: "+970599111222",
    lat: 31.9022,
    lng: 35.2011,
    workingHours: {
      sunday: { open: "09:00", close: "17:00" },
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "15:00" },
      friday: { open: "00:00", close: "00:00", closed: true },
      saturday: { open: "10:00", close: "14:00" }
    },
    acceptsInsurance: true,
    insuranceList: ["NatHealth"],
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
    rating: 4.9,
    isFeatured: true,
    verified: true
  },
  {
    id: "dr-tareq-kanaan",
    name: "د. طارق كنعان",
    category: "عيون",
    specialty: ["طب وجراحة العيون", "تصحيح نظر بالليزك"],
    city: "Nablus",
    area: "رفيديا",
    address: "شارع رفيديا الرئيسي، نابلس",
    phone: "+970599333444",
    whatsapp: "+970599333444",
    lat: 32.2211,
    lng: 35.2544,
    workingHours: {
      sunday: { open: "09:00", close: "16:00" },
      monday: { open: "09:00", close: "16:00" },
      tuesday: { open: "09:00", close: "16:00" },
      wednesday: { open: "09:00", close: "16:00" },
      thursday: { open: "09:00", close: "14:00" },
      friday: { open: "00:00", close: "00:00", closed: true },
      saturday: { open: "09:00", close: "14:00" }
    },
    acceptsInsurance: false,
    insuranceList: [],
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d",
    rating: 4.7,
    isFeatured: false,
    verified: true
  },
  {
    id: "dr-fadi-hasan",
    name: "د. فادي الحسن",
    category: "تجميل",
    specialty: ["جراحة التجميل والترميم", "حقن فيلر وبوتوكس"],
    city: "Jerusalem",
    area: "بيت حنينا",
    address: "الشارع الرئيسي، بيت حنينا",
    phone: "+970599555666",
    whatsapp: "+970599555666",
    lat: 31.8514,
    lng: 35.2365,
    workingHours: {
      sunday: { open: "10:00", close: "18:00" },
      monday: { open: "10:00", close: "18:00" },
      tuesday: { open: "10:00", close: "18:00" },
      wednesday: { open: "10:00", close: "18:00" },
      thursday: { open: "10:00", close: "15:00" },
      friday: { open: "00:00", close: "00:00", closed: true },
      saturday: { open: "10:00", close: "16:00" }
    },
    acceptsInsurance: false,
    insuranceList: [],
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
    rating: 4.8,
    isFeatured: true,
    verified: true
  },
  {
    id: "dr-reem-sharif",
    name: "د. ريم الشريف",
    category: "أنف وأذن وحنجرة",
    specialty: ["جراحة أنف وأذن وحنجرة", "تجميل الأنف"],
    city: "Hebron",
    area: "رأس الجورة",
    address: "مدخل الخليل، رأس الجورة",
    phone: "+970599777888",
    whatsapp: "+970599777888",
    lat: 31.5326,
    lng: 35.0998,
    workingHours: {
      sunday: { open: "09:00", close: "17:00" },
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "14:00" },
      friday: { open: "00:00", close: "00:00", closed: true },
      saturday: { open: "09:00", close: "15:00" }
    },
    acceptsInsurance: true,
    insuranceList: ["Arab Orient"],
    imageUrl: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787",
    rating: 4.6,
    isFeatured: false,
    verified: true
  }
];

export const demoAppointments: Appointment[] = [
  {
    id: "apt-001",
    doctorId: "dr-lina-khalil",
    patientName: "Ahmad Darwish",
    patientPhone: "+970598111111",
    date: "2026-05-20",
    time: "11:00",
    status: "pending",
    notes: "First consultation for braces"
  },
  {
    id: "apt-002",
    doctorId: "dr-aya-nassar",
    patientName: "Mariam Odeh",
    patientPhone: "+970598222222",
    date: "2026-05-21",
    time: "13:30",
    status: "confirmed",
    notes: "Child cleaning and checkup"
  },
  {
    id: "apt-003",
    doctorId: "dr-samer-haddad",
    patientName: "Rami Shalabi",
    patientPhone: "+970598333333",
    date: "2026-05-22",
    time: "09:00",
    status: "pending",
    notes: "Possible extraction"
  }
];

export const demoAdvertisements: Advertisement[] = [
  {
    id: "ad-001",
    advertiserName: "Dr. Lina Khalil",
    advertiserType: "doctor",
    adType: "featured",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
    linkUrl: "/doctors/dr-lina-khalil",
    targetRegion: "Ramallah",
    targetSpecialty: "Orthodontics",
    isActive: true
  },
  {
    id: "ad-002",
    advertiserName: "Smile Supply Center",
    advertiserType: "store",
    adType: "banner",
    imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5",
    linkUrl: "/",
    targetRegion: "All",
    targetSpecialty: "General",
    isActive: true
  },
  {
    id: "ad-003",
    advertiserName: "Dr. Aya Nassar",
    advertiserType: "doctor",
    adType: "sidebar",
    imageUrl: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe",
    linkUrl: "/doctors/dr-aya-nassar",
    targetRegion: "Hebron",
    targetSpecialty: "Pediatric Dentistry",
    isActive: true
  }
];

export const demoStores: Store[] = [
  {
    id: "store-001",
    storeName: "Smile Supply Center",
    description: "Dental chairs, sterilization tools, and clinic supplies.",
    city: "Ramallah",
    phone: "+970597100100",
    whatsapp: "+970597100100",
    website: "https://example.com/smile-supply",
    logoUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514",
    specialization: "Equipment and supplies",
    isActive: true
  },
  {
    id: "store-002",
    storeName: "Ortho Market Palestine",
    description: "Orthodontic materials and accessories for clinics.",
    city: "Nablus",
    phone: "+970597200200",
    whatsapp: "+970597200200",
    website: "https://example.com/ortho-market",
    logoUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074",
    specialization: "Orthodontic supplies",
    isActive: true
  }
];
