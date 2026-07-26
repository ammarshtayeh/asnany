export type NavLink = {
  href: string;
  label: string;
  description?: string;
};

export type NavLinkWithIcon = NavLink & {
  icon: string;
  color?: string;
  active?: string;
  highlight?: boolean;
};

export type NavSection = {
  id: string;
  title: string;
  links: NavLink[];
};

/** Primary navbar — focused journey: discover → book → offers */
export const SITE_NAV_PRIMARY: NavLinkWithIcon[] = [
  { href: "/", label: "الرئيسية", icon: "Sparkles", color: "text-amber-600", active: "bg-amber-50 text-amber-700 border-amber-100" },
  { href: "/doctors/search", label: "الأطباء", icon: "Stethoscope", color: "text-teal-600", active: "bg-teal-50 text-teal-700 border-teal-100" },
  { href: "/booking", label: "الحجز", icon: "CalendarCheck2", color: "text-emerald-600", active: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { href: "/offers", label: "العروض", icon: "Tags", color: "text-rose-600", active: "bg-rose-50 text-rose-700 border-rose-100" },
];

/** Grouped secondary links — shown under «المزيد» */
export const SITE_NAV_MORE_SECTIONS: NavSection[] = [
  {
    id: "patient",
    title: "خدمات المريض",
    links: [
      { href: "/appointments", label: "حجوزاتي", description: "تتبّع مواعيدك" },
      { href: "/discount-card", label: "بطاقة الخصم", description: "خصومات حصرية" },
      { href: "/trust", label: "كيف نختار الأطباء", description: "منهجية التوثيق" },
    ],
  },
  {
    id: "specialties",
    title: "التخصصات",
    links: [
      { href: "/beauty", label: "التجميل", description: "مراكز تجميل وابتسامة" },
      { href: "/labs", label: "المختبرات", description: "تحاليل ومعامل" },
    ],
  },
  {
    id: "discover",
    title: "اكتشف ومحتوى",
    links: [
      { href: "/marketplace", label: "سوق ملامح", description: "معدات ووظائف" },
      { href: "/stores", label: "الموردون", description: "متاجر طبية" },
      { href: "/blog", label: "المجلة الطبية", description: "مقالات ونصائح" },
      { href: "/subscriptions", label: "باقات الاشتراك", description: "للعيادات والشركاء" },
    ],
  },
  {
    id: "partners",
    title: "للأطباء والشركاء",
    links: [
      { href: "/join", label: "انضم كطبيب", description: "أضف عيادتك" },
      { href: "/advertise", label: "أعلن معنا", description: "حملات مميزة" },
      { href: "/doctors/register", label: "تسجيل عيادة", description: "استمارة إلكترونية" },
      { href: "/about", label: "عن ملامح", description: "رؤيتنا ورسالتنا" },
    ],
  },
];

export const SITE_NAV_MOBILE_BOTTOM = [
  { href: "/", label: "الرئيسية", icon: "Home" },
  { href: "/doctors/search", label: "الأطباء", icon: "Stethoscope" },
  { href: "/booking", label: "حجز", icon: "CalendarCheck2" },
  { href: "/offers", label: "عروض", icon: "Tags" },
  { href: "/appointments", label: "حجوزاتي", icon: "CalendarCheck2" },
] as const;

export type SubscriptionPackage = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string | null;
  price_usd: number;
  original_price_usd?: number | null;
  billing_period: "monthly" | "yearly" | "per_ad";
  features?: string[] | null;
  sort_order?: number | null;
  is_active?: boolean | null;
};

export const SUBSCRIPTION_PERIOD_LABELS: Record<SubscriptionPackage["billing_period"], string> = {
  monthly: "شهرياً",
  yearly: "سنوياً",
  per_ad: "لكل إعلان",
};

/** Recommended package slug for highlighting */
export const RECOMMENDED_PACKAGE_SLUG = "premium";
