export type Doctor = {
  id: string;
  name: string;
  specialty?: string[] | null;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  bio?: string | null;
  image_url?: string | null;
  is_featured?: boolean | null;
  verified?: boolean | null;
  is_available?: boolean | null;
  availability_note?: string | null;
  accepts_discount_card?: boolean | null;
  discount_note?: string | null;
  discount_value?: string | null;
  working_hours?: Record<string, string> | null;
  workingHours?: Record<string, string> | null;
  rating?: number | null;
  accepts_insurance?: boolean | null;
  acceptsInsurance?: boolean | null;
  insurance_list?: string[] | null;
  insuranceList?: string[] | null;
};

export type AppointmentRecord = {
  id: string;
  doctor_id: string;
  patient_name?: string | null;
  patient_full_name?: string | null;
  patient_phone?: string | null;
  patient_identity?: string | null;
  patient_address?: string | null;
  date?: string | null;
  time?: string | null;
  notes?: string | null;
  status?: string | null;
  created_at?: string | null;
  doctor?: Doctor | null;
  discount_card_status?: "active" | "none" | null;
  discount_card_member?: {
    id: string;
    full_name: string;
    phone: string;
    city?: string | null;
    status: string;
    expires_at?: string | null;
  } | null;
};

export type DoctorAccount = {
  id: string;
  doctor_id: string;
  email: string;
  is_active: boolean;
  doctors?: Pick<Doctor, "name" | "city" | "phone"> | null;
};

export type ApiResponse<T> = {
  success?: boolean;
  error?: string;
  message?: string;
} & T;
