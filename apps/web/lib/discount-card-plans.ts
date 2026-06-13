export type DiscountCardPlan = {
  id: string;
  name: string;
  subtitle?: string | null;
  price: number;
  currency: string;
  duration_months: number;
  badge?: string | null;
  benefits: string[];
  limits?: string[] | null;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export const defaultDiscountCardPlans: DiscountCardPlan[] = [
  {
    id: "starter",
    name: "بطاقة أسناني الأساسية",
    subtitle: "للمتابعة والكشف والخدمات الخفيفة",
    price: 49,
    currency: "₪",
    duration_months: 3,
    badge: "بداية ذكية",
    benefits: ["خصومات عند العيادات المشاركة", "إظهار البطاقة الرقمية داخل التطبيق", "متابعة الشركاء والخصومات من مكان واحد"],
    limits: ["صالحة لمدة 3 أشهر", "لا تجمع مع عروض أخرى إلا بموافقة الشريك"],
    sort_order: 1,
    is_featured: false,
    is_active: true,
  },
  {
    id: "plus",
    name: "بطاقة أسناني بلس",
    subtitle: "الخيار الأفضل للعائلة والاستخدام المتكرر",
    price: 99,
    currency: "₪",
    duration_months: 12,
    badge: "الأكثر طلباً",
    benefits: ["خصومات أعلى عند الشركاء", "أولوية في عروض التبييض والتنظيف", "بطاقة رقمية برقم عضوية جاهز للتحقق", "تنبيهات بالعروض الجديدة"],
    limits: ["صالحة لمدة سنة كاملة", "البطاقة شخصية ولا تنقل لشخص آخر"],
    sort_order: 2,
    is_featured: true,
    is_active: true,
  },
  {
    id: "family",
    name: "بطاقة العائلة",
    subtitle: "لأكثر من فرد داخل نفس البيت",
    price: 179,
    currency: "₪",
    duration_months: 12,
    badge: "قيمة أعلى",
    benefits: ["تغطية حتى 4 أفراد", "خصومات على الكشف والتنظيف والخدمات التجميلية", "متابعة كل البطاقات من نفس رقم الهاتف", "مناسبة للعائلات والأطفال"],
    limits: ["صالحة لمدة سنة", "يتم تسجيل أسماء أفراد العائلة عند التفعيل"],
    sort_order: 3,
    is_featured: false,
    is_active: true,
  },
];

function toList(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanNumber(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

export function normalizeDiscountCardPlan(body: any) {
  return {
    name: String(body.name || "").trim(),
    subtitle: String(body.subtitle || "").trim(),
    price: cleanNumber(body.price),
    currency: String(body.currency || "₪").trim() || "₪",
    duration_months: cleanNumber(body.duration_months, 12),
    badge: String(body.badge || "").trim(),
    benefits: toList(body.benefits),
    limits: toList(body.limits),
    sort_order: cleanNumber(body.sort_order),
    is_featured: Boolean(body.is_featured),
    is_active: body.is_active === undefined ? true : Boolean(body.is_active),
    updated_at: new Date().toISOString(),
  };
}

export function isMissingDiscountPlanTable(error: any) {
  return error?.code === "42P01" || String(error?.message || "").includes("discount_card_plans");
}
