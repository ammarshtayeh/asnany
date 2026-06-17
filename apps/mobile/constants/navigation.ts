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

export const QUICK_ACTIONS: HubItem[] = [
  {
    id: "booking",
    label: "احجز الآن",
    path: "/booking",
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
    id: "discount",
    label: "بطاقة الخصم",
    path: "/discount-card",
    icon: "credit-card",
    color: theme.purple,
    bg: theme.purpleMuted,
  },
];

export const HUB_SECTIONS: HubSection[] = [
  {
    id: "medical",
    title: "الخدمات الطبية",
    subtitle: "حجز، تجميل، مختبرات، واستشارات",
    items: [
      { id: "beauty", label: "مراكز التجميل", desc: "تجميل الأسنان والابتسامة", path: "/beauty", icon: "star", color: "#db2777", bg: "#fdf2f8" },
      { id: "labs", label: "المختبرات", desc: "مختبرات طبية معتمدة", path: "/labs", icon: "activity", color: "#6366f1", bg: "#eef2ff" },
      { id: "consult", label: "استشارات طبية", desc: "استشارات كتابية سريعة", path: "/consultations", icon: "message-circle", color: "#0ea5e9", bg: "#f0f9ff" },
      { id: "stores", label: "الموردون والمتاجر", desc: "منتجات ومعدات طبية", path: "/stores", icon: "shopping-bag", color: "#059669", bg: "#ecfdf5" },
    ],
  },
  {
    id: "discover",
    title: "اكتشف ملامح",
    subtitle: "عروض، سوق، مجلة، وميديا",
    items: [
      { id: "offers", label: "العروض", desc: "خصومات وعروض حصرية", path: "/(tabs)/offers", icon: "tag", color: "#f59e0b", bg: "#fffbeb" },
      { id: "market", label: "سوق ملامح", desc: "معدات، وظائف، وإعلانات", path: "/(tabs)/marketplace", icon: "grid", color: "#10b981", bg: "#ecfdf5" },
      { id: "blog", label: "المجلة الطبية", desc: "مقالات ونصائح طبية", path: "/blog", icon: "book-open", color: "#8b5cf6", bg: "#f5f3ff" },
      { id: "media", label: "الميديا", desc: "أخبار ومقاطع فيديو", path: "/media", icon: "film", color: "#ef4444", bg: "#fef2f2" },
      { id: "partners", label: "الشركاء", desc: "شركات ومنتجات معتمدة", path: "/partners", icon: "briefcase", color: "#0f172a", bg: "#f8fafc" },
    ],
  },
  {
    id: "partners",
    title: "للأطباء والشركاء",
    subtitle: "انضم، اشترك، وأعلن معنا",
    items: [
      { id: "join", label: "انضم كطبيب", desc: "أضف عيادتك للشبكة", path: "/join", icon: "user-plus", color: "#0ea5e9", bg: "#f0f9ff" },
      { id: "packages", label: "باقات الاشتراك", desc: "الدليل · المميز · الإعلانات", path: "/subscriptions", icon: "layers", color: "#7c3aed", bg: "#f5f3ff" },
      { id: "register", label: "تسجيل عيادة", desc: "استمارة تسجيل إلكترونية", path: "/doctors/register", icon: "file-text", color: "#0d9488", bg: "#ecfdf5" },
      { id: "advertise", label: "أعلن معنا", desc: "حملات وإعلانات مميزة", path: "/advertise", icon: "volume-2", color: "#f59e0b", bg: "#fffbeb" },
    ],
  },
  {
    id: "accounts",
    title: "الحسابات",
    subtitle: "دخول الطبيب أو الإدارة",
    items: [
      { id: "doctor", label: "دخول الطبيب", desc: "إدارة العيادة والمواعيد", path: "/doctor/login", icon: "user-check", color: theme.teal, bg: theme.tealMuted },
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
  domain: "https://malamih.ps",
  tagline: "دليل فلسطين لصحة وجمال الوجه",
  version: "1.0.0",
  supportEmail: "ammar.shtayeh@gmail.com",
};
