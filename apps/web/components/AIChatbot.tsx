"use client";

import { useState, useRef, useEffect } from "react";
import {
  X, Send, AlertCircle, Calendar, Sparkles,
  FlaskConical, ShoppingBag, Tags, BookOpen, Bot, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface Message {
  sender: "bot" | "user";
  text: string;
  ctaLink?: string;
  ctaLabel?: string;
  ctaIcon?: "offer" | "booking" | "beauty" | "labs" | "marketplace" | "blog";
  doctors?: any[];
  chips?: { label: string; q: string }[];
}

const SERVICE_PILLS = [
  { label: "🦷 أسنان",    q: "أسنان وتقويم" },
  { label: "👁️ عيون",    q: "مشاكل العيون والنظر" },
  { label: "🧴 بشرة",    q: "مشاكل البشرة والجلد" },
  { label: "✨ تجميل",   q: "خدمات التجميل والفيلر" },
  { label: "👂 أنف وأذن", q: "أنف وأذن وحنجرة" },
  { label: "🔬 مختبر",   q: "فحوصات مختبر" },
  { label: "🏷️ عروض",   q: "عروض وخصومات متاحة" },
  { label: "📅 حجز",     q: "أريد حجز موعد مع طبيب" },
];

const QUICK_CHIPS = [
  { label: "🦷 ألم أسنان",   q: "عندي ألم شديد في أسناني" },
  { label: "👁️ مشاكل العيون", q: "عندي مشكلة في نظري وعيوني" },
  { label: "🧴 مشاكل البشرة", q: "عندي مشكلة في البشرة والجلد" },
  { label: "✨ تجميل وفيلر", q: "أريد الاستفسار عن خدمات التجميل والفيلر" },
  { label: "👂 أنف وأذن",   q: "أنف وأذن وحنجرة" },
  { label: "🔬 فحوصات",     q: "أريد إجراء تحاليل وفحوصات مخبرية" },
  { label: "🏷️ عروض",      q: "ما هي العروض والخصومات المتاحة؟" },
  { label: "📅 احجز موعد",  q: "أريد حجز موعد" },
];

const CTA_STYLES: Record<string, string> = {
  offer:       "from-amber-400 to-orange-400 text-slate-950",
  booking:     "from-slate-800 to-slate-950 text-white",
  beauty:      "from-fuchsia-500 to-violet-500 text-white",
  labs:        "from-sky-500 to-indigo-500 text-white",
  marketplace: "from-emerald-500 to-teal-500 text-white",
  blog:        "from-violet-500 to-purple-600 text-white",
};

function getBotResponse(text: string): Omit<Message, "sender"> {
  const t = text;

  if (/ألم|وجع|عصب|بوجعني|موجوع|ضرس/.test(t))
    return { text: "شفاك الله! 😔\n\nألم الأسنان الحاد غالباً مؤشر على:\n🔹 التهاب عصب → حشو جذور\n🔹 تسوس عميق → حشوة فورية\n🔹 تورم → فحص عاجل\n\nأنصحك بحجز موعد عاجل.", ctaLink: "/#doctors", ctaLabel: "ابحث عن طبيب أسنان", ctaIcon: "booking" };

  if (/تقويم|اعوجاج|فراغ بين|إطباق|الفك/.test(t))
    return { text: "تقويم الأسنان يصحح الاصطفاف والإطباق! 😁\n\n🔹 تقويم معدني — الأكثر فاعلية\n🔹 تقويم شفاف — أقل ظهوراً\n🔹 مدة 12–24 شهراً\n\nزُر أخصائي تقويم لخطة مخصصة.", ctaLink: "/#doctors", ctaLabel: "ابحث عن أخصائي تقويم", ctaIcon: "booking" };

  if (/تبييض|ابتسامة|فينير|زيركون|ليمينيت/.test(t))
    return { text: "ابتسامة ناصعة في متناول يدك! ✨\n\n🔹 تبييض ليزر — نتيجة فورية\n🔹 تبييض منزلي — آمن وتدريجي\n🔹 فينير/زيركون — لإخفاء التشقق الدائم\n\nتوجد عروض حصرية الآن!", ctaLink: "/offers", ctaLabel: "تصفح عروض التجميل", ctaIcon: "offer" };

  if (/زراعة|مفقود|زرع|بدوني سن/.test(t))
    return { text: "زراعة الأسنان الحل الأمثل! 🦷\n\n🔹 جذر تيتانيوم يندمج مع العظم\n🔹 تاج خزفي طبيعي المظهر\n🔹 يدوم مدى الحياة مع العناية\n\nيحتاج تقييم عظم الفك أولاً.", ctaLink: "/#doctors", ctaLabel: "ابحث عن أخصائي زراعة", ctaIcon: "booking" };

  if (/أسنان الأطفال|ابني|بنتي|طفل|بيبي/.test(t))
    return { text: "العناية بأسنان الأطفال أساسية! 🧸\n\n🔹 أول زيارة عند ظهور أول سن\n🔹 حماية من التسوس المبكر\n🔹 أطباء مدربون على التعامل مع الأطفال", ctaLink: "/#doctors", ctaLabel: "ابحث عن طبيب أطفال", ctaIcon: "booking" };

  if (/عيون|نظر|ليزك|ليزر عيون|ضعف بصر|تشوش|حول|ماء أبيض|ماء أزرق|قطارة|عدسة/.test(t))
    return { text: "رعاية العين أولوية قصوى! 👁️\n\n🔹 ضعف النظر → فحص نظر وتصحيح\n🔹 الليزك → تصحيح دائم بالليزر\n🔹 الكتاراكت → عملية يومية آمنة\n🔹 الجلوكوما → متابعة منتظمة\n\nراجع أخصائي عيون الأقرب.", ctaLink: "/#doctors", ctaLabel: "ابحث عن طبيب عيون", ctaIcon: "booking" };

  if (/بشرة|جلد|حب الشباب|حبوب|أكنيه|تساقط شعر|فراغات شعر|صدفية|إكزيما|تصبغات|مسام/.test(t))
    return { text: "مشاكل البشرة لها حلول فعّالة! 🧴\n\n🔹 حب الشباب → ليزر + كريمات علاجية\n🔹 تساقط الشعر → حقن البلازما\n🔹 التصبغات → ليزر كربون\n🔹 الصدفية → علاج متخصص مستمر\n\nعروض مميزة على الجلدية!", ctaLink: "/beauty", ctaLabel: "تصفح مراكز الجلدية", ctaIcon: "beauty" };

  if (/تجميل|فيلر|بوتوكس|شد وجه|تخسيس|تجميل أنف|حقن|ريستيلان|مزوثيرابي/.test(t))
    return { text: "خدمات التجميل تطورت كثيراً! ✨\n\n🔹 فيلر الشفاه والوجه — فوري وطبيعي\n🔹 البوتوكس — لإزالة التجاعيد\n🔹 شفط الدهون الموضعي\n🔹 تجميل الأنف بلا جراحة\n🔹 مزوثيرابي لتجديد البشرة", ctaLink: "/beauty", ctaLabel: "تصفح مراكز التجميل", ctaIcon: "beauty" };

  if (/أذن|أنف|حنجرة|لوزتين|سمع|طنين|حساسية أنف|جيوب أنفية|بحة|شخير|انزلاق حاجز/.test(t))
    return { text: "أخصائي الأنف والأذن والحنجرة يساعدك! 👂\n\n🔹 التهاب اللوزتين → علاج أو استئصال\n🔹 الجيوب الأنفية → بخاخ أو تدخل بسيط\n🔹 انزلاق الحاجز → عملية لتحسين التنفس\n🔹 ضعف السمع والطنين → فحص متخصص", ctaLink: "/#doctors", ctaLabel: "ابحث عن أخصائي أنف وأذن", ctaIcon: "booking" };

  if (/تحاليل|فحوصات|مختبر|دم|سكر|كوليسترول|غدة درقية|فيتامين|هرمونات|بول/.test(t))
    return { text: "الفحوصات أساس التشخيص الدقيق! 🔬\n\n🔹 صورة دم كاملة (CBC)\n🔹 سكر صيامي وتراكمي\n🔹 وظائف كبد وكلى\n🔹 هرمونات الغدة الدرقية\n🔹 فيتامينات D, B12, حديد\n\nاحجز في مختبراتنا المعتمدة.", ctaLink: "/labs", ctaLabel: "تصفح المختبرات", ctaIcon: "labs" };

  if (/سوق|أدوات|منتجات|أجهزة طبية|معدات|مستلزمات/.test(t))
    return { text: "سوق ملامح للمستلزمات الطبية! 🛒\n\n🔹 أجهزة وكراسي طب أسنان\n🔹 مستلزمات عيادات وعمليات\n🔹 أدوات تجميل وليزر\n🔹 منتجات العناية والصحة", ctaLink: "/marketplace", ctaLabel: "تصفح سوق ملامح", ctaIcon: "marketplace" };

  if (/عروض|خصومات|تخفيضات|أوفر/.test(t))
    return { text: "عروض ملامح تُحدَّث باستمرار! 🏷️\n\n🔹 خصومات تبييض أسنان وتجميل\n🔹 باقات علاج شاملة بأسعار مخفضة\n🔹 عروض موسمية حصرية\n🔹 بطاقة خصم ملامح الدائمة", ctaLink: "/offers", ctaLabel: "تصفح جميع العروض", ctaIcon: "offer" };

  if (/مجلة|مقالات|نصائح|صحة/.test(t))
    return { text: "مجلة ملامح — محتوى طبي موثوق! 📖\n\n🔹 مقالات مراجعة من أطباء متخصصين\n🔹 نصائح وقاية وعناية يومية\n🔹 أخبار الطب والجمال في فلسطين", ctaLink: "/blog", ctaLabel: "اقرأ مجلة ملامح", ctaIcon: "blog" };

  if (/احجز|حجز|موعد|متاح|متى/.test(t))
    return { text: "حجز موعدك سهل وسريع! 📅\n\n1️⃣ ابحث عن الطبيب حسب التخصص والمدينة\n2️⃣ افتح ملف الطبيب واطلع على المواعيد\n3️⃣ تواصل عبر الهاتف أو الواتساب\n4️⃣ أو استخدم نموذج الحجز الإلكتروني\n\nجميع الأطباء موثقون ومعتمدون.", ctaLink: "/booking", ctaLabel: "نظام الحجز الإلكتروني", ctaIcon: "booking" };

  if (/مرحبا|سلام|هلا|هلو|مساء|صباح/.test(t))
    return { text: "أهلاً وسهلاً! أنا الحكيم اللبيب 🧠🩺\n\nمساعدك الطبي الذكي في منصة ملامح.ps\n\nيمكنني مساعدتك في:\n🦷 أسنان • 👁️ عيون • 🧴 جلدية\n✨ تجميل • 👂 أنف وأذن • 🔬 مختبرات\n🏷️ عروض • 📅 حجز موعد\n\nما الذي تحتاجه اليوم؟" };

  return {
    text: "شكراً لاستفسارك! 🩺\n\nيمكنني مساعدتك في:\n🦷 أسنان • 👁️ عيون • 🧴 جلدية\n✨ تجميل • 👂 أنف وأذن • 🔬 مختبرات\n🏷️ عروض • 📅 حجز موعد\n\nاختر من الأزرار السريعة أو اكتب سؤالك.",
    ctaLink: "/#doctors", ctaLabel: "تصفح جميع الأطباء", ctaIcon: "booking",
  };
}

const PALESTINIAN_CITIES = [
  "رام الله", "نابلس", "الخليل", "جنين", "بيت لحم", "طولكرم", "قلقيلية", "أريحا", "غزة", "القدس", "سلفيت", "طوباس"
];

const medicalCategories = [
  { keywords: [/أسنان|ضرس|تقويم|زراعة|حشو|طواحين|خلع/i], category: "أسنان", label: "طب الأسنان" },
  { keywords: [/عيون|نظر|ليزك|بصر|عدسات/i], category: "عيون", label: "طب وجراحة العيون" },
  { keywords: [/أنف|أذن|حنجرة|سمع|بلعوم|طنين|جيوب/i], category: "أنف وأذن وحنجرة", label: "أنف وأذن وحنجرة" },
  { keywords: [/جلدية|حبوب|بشرة|اكزيما|شعر|صدفية/i], category: "جلدية", label: "أمراض الجلدية وبشرة" },
  { keywords: [/تجميل|فيلر|بوتوكس|بلازما|تخسيس/i], category: "تجميل", label: "التجميل والليزر" },
];

const SPECIALTY_CHIPS = [
  { label: "🦷 أسنان", q: "أريد طبيب أسنان" },
  { label: "👁️ عيون", q: "أريد طبيب عيون" },
  { label: "🧴 بشرة وجلدية", q: "أريد طبيب جلدية وبشرة" },
  { label: "✨ تجميل وفيلر", q: "أريد مركز تجميل وفيلر" },
  { label: "👂 أنف وأذن", q: "أريد طبيب أنف وأذن وحنجرة" }
];

const CITY_CHIPS = [
  { label: "📍 رام الله", q: "في رام الله" },
  { label: "📍 نابلس", q: "في نابلس" },
  { label: "📍 الخليل", q: "في الخليل" },
  { label: "📍 القدس", q: "في القدس" },
  { label: "📍 جنين", q: "في جنين" },
  { label: "📍 بيت لحم", q: "في بيت لحم" },
  { label: "📍 طولكرم", q: "في طولكرم" }
];

async function getBotResponseAsync(
  text: string,
  chatContext: { city?: string; category?: string },
  setChatContext: (ctx: { city?: string; category?: string }) => void
): Promise<Omit<Message, "sender">> {
  const t = text;

  // 1. Detect parameters
  const detectedCity = PALESTINIAN_CITIES.find(city => t.includes(city));
  const detectedCatObj = medicalCategories.find(item => item.keywords.some(rx => rx.test(t)));

  const currentCity = detectedCity || chatContext.city;
  const currentCategory = detectedCatObj?.category || chatContext.category;
  const currentCategoryLabel = detectedCatObj?.label || (currentCategory ? medicalCategories.find(c => c.category === currentCategory)?.label : undefined);

  // Update context if anything detected
  if (detectedCity || detectedCatObj) {
    setChatContext({
      city: currentCity,
      category: currentCategory
    });
  }

  // Case A: We have both parameters!
  if (currentCity && currentCategory) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("doctors")
          .select("id, name, specialty, city, image_url, whatsapp, phone")
          .eq("verified", true)
          .eq("city", currentCity)
          .eq("category", currentCategory)
          .limit(3);

        if (!error && data && data.length > 0) {
          // Clear context since search is successful
          setChatContext({});
          return {
            text: `لقد وجدت لك ${data.length} من أطباء/عيادات (${currentCategoryLabel}) المعتمدين في مدينة (${currentCity}). يمكنك التواصل معهم أو حجز موعد مباشرة:`,
            doctors: data
          };
        }
      } catch (err) {
        console.error("Supabase query error:", err);
      }
    }
    
    // Fallback if no database or zero results
    setChatContext({});
    return {
      text: `لم أجد حالياً أطباء معتمدين في تخصص (${currentCategoryLabel}) بمدينة (${currentCity}) في قاعدة البيانات. يمكنك البحث في مدينة أخرى أو تصفح الأطباء.`,
      ctaLink: "/#doctors",
      ctaLabel: "تصفح جميع الأطباء",
      ctaIcon: "booking"
    };
  }

  // Case B: We have city but need category
  if (currentCity && !currentCategory) {
    return {
      text: `لقد حددت مدينة (${currentCity}) 📍. ما هو التخصص الطبي أو التجميلي الذي تبحث عنه؟`,
      chips: SPECIALTY_CHIPS
    };
  }

  // Case C: We have category but need city
  if (!currentCity && currentCategory) {
    return {
      text: `لقد حددت تخصص (${currentCategoryLabel}) 🩺. في أي مدينة فلسطينية تبحث عن الطبيب؟`,
      chips: CITY_CHIPS
    };
  }

  // Default: Use static responses from fallback getBotResponse
  return getBotResponse(t);
}

export default function AIChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    sender: "bot",
    text: "أهلاً! أنا الحكيم اللبيب 🧠🩺\n\nمساعدك الطبي الذكي في منصة ملامح.ps\n\nيمكنني مساعدتك في:\n🦷 أسنان • 👁️ عيون • 🧴 جلدية\n✨ تجميل • 👂 أنف وأذن • 🔬 مختبرات\n🏷️ عروض • 📅 حجز موعد\n\nما الذي تحتاجه اليوم؟",
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  const [chatContext, setChatContext] = useState<{ city?: string; category?: string }>({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Animate window in
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setMessages(prev => [...prev, { sender: "user", text: textToSend }]);
    setInput("");
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const response = await getBotResponseAsync(textToSend, chatContext, setChatContext);
        setMessages(prev => [...prev, { sender: "bot", ...response }]);
      } catch (error) {
        console.error("Error in async bot response:", error);
        const fallback = getBotResponse(textToSend);
        setMessages(prev => [...prev, { sender: "bot", ...fallback }]);
      } finally {
        setIsTyping(false);
      }
    }, 800 + Math.random() * 400);
  };

  // Scroll pills container via button
  const scrollPills = (dir: "left" | "right") => {
    if (pillsRef.current) {
      pillsRef.current.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
    }
  };

  const currentPath = pathname || "";
  const isPortalRoute =
    currentPath === "/admin" ||
    currentPath.startsWith("/admin/") ||
    currentPath === "/doctor" ||
    currentPath.startsWith("/doctor/");
  if (isPortalRoute) return null;

  return (
    <>
      {/* ============ GLOBAL STYLES ============ */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes btnPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        .chat-window-enter { animation: chatSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .msg-enter         { animation: msgIn 0.28s ease-out forwards; }
        .btn-pop           { animation: btnPop 0.4s ease; }
        .pills-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 2px 0;
        }
        .pills-scroll::-webkit-scrollbar { display: none; }
        .pills-scroll > * { flex-shrink: 0; }
        .chips-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 2px 0;
        }
        .chips-scroll::-webkit-scrollbar { display: none; }
        .chips-scroll > * { flex-shrink: 0; }
      `}</style>

      <div className="fixed bottom-24 left-5 z-[999] sm:bottom-5 sm:left-5 md:bottom-7 md:left-7" dir="rtl">

        {/* ======= FLOATING BUTTON ======= */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="افتح الحكيم اللبيب"
            className="group relative flex h-[56px] w-[56px] items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_8px_32px_rgba(15,23,42,0.4)] border border-white/10 transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_40px_rgba(15,23,42,0.5)] hover:border-amber-500/30"
          >
            {/* Ping badge */}
            <span className="absolute -top-1.5 -right-1.5 flex h-[22px] w-[22px] items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-50" />
              <span className="relative flex h-[22px] w-[22px] items-center justify-center rounded-full bg-amber-400 shadow-md">
                <span className="text-[9px] font-black text-slate-950 leading-none select-none">AI</span>
              </span>
            </span>

            {/* Bot icon */}
            <Bot className="h-6 w-6 text-amber-400 transition-transform group-hover:rotate-6" />

            {/* Tooltip */}
            <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-950 border border-white/10 px-3.5 py-2 text-xs font-black text-white opacity-0 shadow-2xl transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-1/2 group-hover:translate-x-0 translate-x-2">
              الحكيم اللبيب 🧠
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-950" />
            </span>
          </button>
        )}

        {/* ======= CHAT WINDOW ======= */}
        {isOpen && (
          <div
            className={`fixed bottom-24 left-4 right-4 sm:relative sm:bottom-auto sm:left-auto sm:right-auto flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_32px_80px_rgba(9,13,22,0.22)] border border-slate-200/60 w-auto sm:w-[400px] h-[480px] max-h-[70vh] sm:h-[620px] sm:max-h-[620px] ${isVisible ? "chat-window-enter" : "opacity-0"}`}
          >

            {/* === HEADER === */}
            <div className="relative flex items-center justify-between overflow-hidden bg-slate-950 px-5 py-4 select-none">
              {/* Ambient glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.15),transparent_60%)]" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

              <div className="relative flex items-center gap-3">
                {/* Avatar */}
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/25 to-amber-600/10 border border-amber-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <Bot className="h-5 w-5 text-amber-400" />
                  {/* Online dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-sm" />
                </div>

                <div className="text-right">
                  <h4 className="flex items-center gap-2 font-black text-white text-sm leading-tight">
                    الحكيم اللبيب
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-black text-emerald-400 tracking-wide">
                      مجاني
                    </span>
                  </h4>
                  <p className="mt-0.5 text-[11px] text-slate-400 font-semibold">
                    مستشارك الطبي الذكي • ملامح.ps
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* === SERVICE PILLS (with scroll arrows) === */}
            <div className="relative border-b border-slate-900 bg-slate-950 px-3 py-2.5">
              {/* Left arrow */}
              <button
                onClick={() => scrollPills("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-full w-7 items-center justify-center bg-gradient-to-r from-slate-950 to-transparent"
                aria-label="scroll right"
              >
                <ChevronRight className="h-3.5 w-3.5 text-slate-500 rotate-180" />
              </button>

              {/* Pills */}
              <div ref={pillsRef} className="pills-scroll px-5">
                {SERVICE_PILLS.map((pill) => (
                  <button
                    key={pill.label}
                    onClick={() => sendMessage(pill.q)}
                    className="rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-[12px] font-black text-slate-300 transition-all duration-200 hover:border-amber-500 hover:bg-amber-950/30 hover:text-amber-400 hover:shadow-sm active:scale-95"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Right arrow */}
              <button
                onClick={() => scrollPills("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-full w-7 items-center justify-center bg-gradient-to-l from-slate-950 to-transparent"
                aria-label="scroll left"
              >
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>

            {/* === MESSAGES === */}
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
              style={{ background: "linear-gradient(to bottom, #090d16, #0f172a)" }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`msg-enter flex flex-col ${msg.sender === "user" ? "items-start" : "items-end"}`}
                  style={{ animationDelay: `${Math.min(idx * 30, 150)}ms` }}
                >
                  {/* Bot label */}
                  {msg.sender === "bot" && (
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <div className="flex h-[18px] w-[18px] items-center justify-center rounded-md bg-slate-950">
                        <Bot className="h-2.5 w-2.5 text-amber-400" />
                      </div>
                      <span className="text-[10px] font-black text-slate-500">الحكيم اللبيب</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-[13px] leading-relaxed font-semibold shadow-sm ${
                      msg.sender === "user"
                        ? "rounded-tl-sm bg-amber-500 text-slate-950 text-right border border-amber-600/30"
                        : "rounded-tr-sm bg-slate-900 text-slate-100 text-right border border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
                    }`}
                  >
                    {msg.text}

                    {/* Dynamic Doctor Cards */}
                    {msg.doctors && msg.doctors.length > 0 && (
                      <div className="mt-3 space-y-2.5">
                        {msg.doctors.map((doc: any) => (
                          <div key={doc.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 flex items-stretch gap-3 text-right">
                            {doc.image_url ? (
                              <img src={doc.image_url} alt={doc.name} className="w-12 h-12 rounded-lg object-cover bg-slate-800 flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 text-sm">🧑‍⚕️</div>
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h5 className="text-[12px] font-black text-slate-100 truncate">{doc.name}</h5>
                              <p className="text-[9px] text-emerald-400 font-bold truncate">{(doc.specialty || []).join(" · ")}</p>
                              <p className="text-[9px] text-slate-500 font-bold truncate">📍 {doc.city}</p>
                            </div>
                            <div className="flex flex-col gap-1 flex-shrink-0 justify-center">
                              <Link
                                href={`/doctors/${doc.id}`}
                                onClick={() => setIsOpen(false)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-black text-center"
                              >
                                الملف
                              </Link>
                              {doc.whatsapp && (
                                <a
                                  href={`https://wa.me/${doc.whatsapp.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 text-[9px] font-black text-center"
                                >
                                  واتساب
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    {msg.ctaLink && msg.ctaLabel && msg.ctaIcon && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
                        <Link
                          href={msg.ctaLink}
                          onClick={() => setIsOpen(false)}
                          className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r px-4 py-2 text-[12px] font-black transition-all hover:scale-[1.03] hover:shadow-md active:scale-95 shadow-sm ${CTA_STYLES[msg.ctaIcon]}`}
                        >
                          {msg.ctaIcon === "offer"       && <Tags         className="h-3.5 w-3.5" />}
                          {msg.ctaIcon === "booking"     && <Calendar      className="h-3.5 w-3.5 text-amber-400" />}
                          {msg.ctaIcon === "beauty"      && <Sparkles      className="h-3.5 w-3.5" />}
                          {msg.ctaIcon === "labs"        && <FlaskConical  className="h-3.5 w-3.5" />}
                          {msg.ctaIcon === "marketplace" && <ShoppingBag   className="h-3.5 w-3.5" />}
                          {msg.ctaIcon === "blog"        && <BookOpen      className="h-3.5 w-3.5" />}
                          {msg.ctaLabel}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="msg-enter flex flex-col items-end">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <div className="flex h-[18px] w-[18px] items-center justify-center rounded-md bg-slate-950">
                      <Bot className="h-2.5 w-2.5 text-amber-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 animate-pulse">يكتب...</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tr-sm bg-slate-900 border border-slate-800 px-5 py-3.5 shadow-sm">
                    {[0, 140, 280].map((delay) => (
                      <span
                        key={delay}
                        className="h-2 w-2 rounded-full bg-slate-700 animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* === QUICK CHIPS === */}
            <div className="border-t border-slate-900 bg-slate-950 px-4 py-2.5">
              <div className="chips-scroll">
                {((messages[messages.length - 1]?.sender === "bot" && messages[messages.length - 1]?.chips)
                  ? messages[messages.length - 1].chips
                  : QUICK_CHIPS
                )?.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => sendMessage(chip.q)}
                    className="rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-[12px] font-black text-slate-300 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800 hover:text-white active:scale-95"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* === INPUT === */}
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex items-center gap-2.5 border-t border-slate-900 bg-slate-950 px-4 py-3"
            >
              <input
                type="text"
                placeholder="اكتب سؤالك الطبي هنا..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-[13px] font-semibold text-slate-100 outline-none placeholder:text-slate-500 transition-all focus:border-amber-500 focus:bg-slate-950 focus:ring-2 focus:ring-amber-950/50"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-md transition-all duration-200 hover:bg-amber-400 hover:shadow-amber-500/30 hover:shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 -rotate-90" />
              </button>
            </form>

            {/* === DISCLAIMER === */}
            <div className="flex items-center gap-1.5 border-t border-slate-900 bg-slate-950 px-4 py-2">
              <AlertCircle className="h-3 w-3 flex-shrink-0 text-slate-500" />
              <span className="text-[10px] font-medium text-slate-500">
                إرشاد طبي أولي فقط، لا يغني عن الفحص السريري المباشر.
              </span>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
