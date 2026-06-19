import type { Feather } from "@expo/vector-icons";
import { theme } from "./theme";

type IconName = keyof typeof Feather.glyphMap;

export type HubItem = {
  id: string;
  label: string;
  desc?: string;
  path: string;
  icon: IconName;
  color: string;
  bg: string;
};

export type HubSection = {
  id: string;
  title: string;
  subtitle?: string;
  items: HubItem[];
};

/** Quick actions — patient journey first */
export const QUICK_ACTIONS: HubItem[] = [
  {
    id: "booking",
    label: "احجز الآن",
    path: "/(tabs)/booking",
    icon: "calendar",
    color: theme.teal,
    bg: theme.tealMuted,
  },
  {
    id: "appointments",
    label: "حجوزاتي",
    path: "/appointments",
    icon: "clipboard",
    color: theme.teal,
    bg: theme.tealMuted,
  },
  {
    id: "packages",
    label: "باقات الاشتراك",
    path: "/subscriptions",
    icon: "layers",
    color: theme.purple,
    bg: theme.purpleMuted,
  },
  {
    id: "discount",
    label: "بطاقة الخصم",
    path: "/discount-card",
    icon: "credit-card",
    color: theme.gold,
    bg: theme.goldMuted,
  },
];

export const HUB_SECTIONS: HubSection[] = [
  {
    id: "discover",
    title: "اكتشف وابحث",
    subtitle: "أطباء، عروض، وتخصصات",
    items: [
      { id: "doctors", label: "دليل الأطباء", desc: "بحث حسب المدينة والتخصص", path: "/(tabs)/doctors", icon: "users", color: theme.teal, bg: theme.tealMuted },
      { id: "offers", label: "العروض", desc: "خصومات حصرية", path: "/(tabs)/offers", icon: "tag", color: "#f59e0b", bg: "#fffbeb" },
      { id: "beauty", label: "مراكز التجميل", desc: "تجميل الأسنان والابتسامة", path: "/beauty", icon: "star", color: "#db2777", bg: "#fdf2f8" },
      { id: "labs", label: "المختبرات", desc: "مختبرات طبية معتمدة", path: "/labs", icon: "activity", color: "#6366f1", bg: "#eef2ff" },
    ],
  },
  {
    id: "content",
    title: "محتوى وسوق",
    subtitle: "مجلة، سوق، وموردون",
    items: [
      { id: "market", label: "سوق ملامح", desc: "معدات، وظائف، إعلانات", path: "/(tabs)/marketplace", icon: "grid", color: "#10b981", bg: "#ecfdf5" },
      { id: "blog", label: "المجلة الطبية", desc: "مقالات ونصائح", path: "/blog", icon: "book-open", color: "#8b5cf6", bg: "#f5f3ff" },
      { id: "stores", label: "الموردون", desc: "منتجات ومعدات طبية", path: "/stores", icon: "shopping-bag", color: "#059669", bg: "#ecfdf5" },
      { id: "consult", label: "استشارات", desc: "استشارات كتابية", path: "/consultations", icon: "message-circle", color: "#0ea5e9", bg: "#f0f9ff" },
    ],
  },
  {
    id: "partners",
    title: "للأطباء والشركاء",
    subtitle: "انضم، اشترك، وأعلن",
    items: [
      { id: "packages", label: "باقات الاشتراك", desc: "الدليل · المميز · الإعلانات", path: "/subscriptions", icon: "layers", color: "#7c3aed", bg: "#f5f3ff" },
      { id: "join", label: "انضم كطبيب", desc: "أضف عيادتك للشبكة", path: "/join", icon: "user-plus", color: "#0ea5e9", bg: "#f0f9ff" },
      { id: "register", label: "تسجيل عيادة", desc: "استمارة إلكترونية", path: "/doctors/register", icon: "file-text", color: "#0d9488", bg: "#ecfdf5" },
      { id: "advertise", label: "أعلن معنا", desc: "حملات وإعلانات مميزة", path: "/advertise", icon: "volume-2", color: "#f59e0b", bg: "#fffbeb" },
    ],
  },
  {
    id: "accounts",
    title: "الحسابات",
    subtitle: "دخول الطبيب أو الإدارة",
    items: [
      { id: "doctor", label: "دخول الطبيب", desc: "لوحة العيادة والمواعيد", path: "/doctor/login", icon: "user-check", color: theme.teal, bg: theme.tealMuted },
      { id: "admin", label: "دخول الإدارة", desc: "لوحة تحكم ملامح", path: "/admin/login", icon: "shield", color: theme.navy, bg: theme.bg },
    ],
  },
  {
    id: "about",
    title: "عن التطبيق",
    items: [
      { id: "about", label: "من نحن", path: "/about", icon: "info", color: "#64748b", bg: "#f8fafc" },
      { id: "privacy", label: "سياسة الخصوصية", path: "/privacy", icon: "lock", color: "#64748b", bg: "#f8fafc" },
      { id: "terms", label: "شروط الاستخدام", path: "/terms", icon: "file", color: "#64748b", bg: "#f8fafc" },
    ],
  },
];

export const APP_META = {
  name: "ملامح",
  domain: "https://www.malamih.ps",
  tagline: "دليل فلسطين لصحة وجمال الوجه",
  version: "1.0.0",
  supportEmail: "ammar.shtayeh@gmail.com",
};
