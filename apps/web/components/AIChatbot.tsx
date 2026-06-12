"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, AlertCircle, Calendar, Sparkles, FlaskConical, Microscope, Eye, Ear, HeartPulse, ShoppingBag, Tags, BookOpen, Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Message {
  sender: "bot" | "user";
  text: string;
  ctaLink?: string;
  ctaLabel?: string;
  ctaIcon?: "offer" | "booking" | "beauty" | "labs" | "marketplace" | "blog";
}

const QUICK_CHIPS = [
  { label: "🦷 ألم أسنان", q: "عندي ألم شديد في أسناني" },
  { label: "👁️ مشاكل العيون", q: "عندي مشكلة في نظري وعيوني" },
  { label: "🧴 مشاكل البشرة", q: "عندي مشكلة في البشرة والجلد" },
  { label: "✨ تجميل وفيلر", q: "أريد الاستفسار عن خدمات التجميل والفيلر" },
  { label: "👂 أنف وأذن وحنجرة", q: "عندي مشكلة في الأذن أو الأنف أو الحنجرة" },
  { label: "🔬 فحوصات مختبر", q: "أريد إجراء تحاليل وفحوصات مخبرية" },
  { label: "💊 احجز موعد", q: "أريد حجز موعد مع طبيب" },
  { label: "🏷️ عروض وخصومات", q: "ما هي العروض والخصومات المتاحة؟" },
];

function getBotResponse(text: string): Omit<Message, "sender"> {
  const t = text;

  // ===== أسنان =====
  if (/ألم|وجع|عصب|بوجعني|موجوع|ضرس/.test(t)) {
    return {
      text: "شفاك الله وعافاك! 😔\n\nألم الأسنان الحاد عادةً ما يكون مؤشراً على التهاب عصب السن أو تسوس عميق.\n\n🔹 إذا كان الألم نابضاً ليلاً → احتمال علاج جذور\n🔹 إذا كان الألم عند العض → قد يكون كسر أو حشوة مكسورة\n🔹 إذا كان مع تورم → يحتاج فحص فوري\n\nأنصحك بحجز موعد عاجل مع طبيب أسنان.",
      ctaLink: "/#doctors",
      ctaLabel: "ابحث عن طبيب أسنان",
      ctaIcon: "booking",
    };
  }

  if (/تقويم|اعوجاج|فراغ بين|إطباق|الفك/.test(t)) {
    return {
      text: "تقويم الأسنان هو الحل لتنسيق الأسنان وإصلاح مشاكل الإطباق. 😁\n\n🔹 تقويم معدني — الأكثر فاعلية\n🔹 تقويم شفاف (Invisalign) — أقل ظهوراً\n🔹 مدة العلاج من 12 إلى 24 شهراً\n\nأنصحك بزيارة أخصائي تقويم لعمل صور أشعة وتحديد الخطة.",
      ctaLink: "/#doctors",
      ctaLabel: "ابحث عن أخصائي تقويم",
      ctaIcon: "booking",
    };
  }

  if (/تبييض|ابتسامة|فينير|زيركون|ليمينيت/.test(t)) {
    return {
      text: "للحصول على ابتسامة ناصعة وجذابة! ✨\n\n🔹 تبييض ليزر — نتيجة فورية في جلسة واحدة\n🔹 تبييض منزلي — بتراكيب طبية آمنة\n🔹 فينير/زيركون — لإخفاء التشقق أو اللون الدائم\n\nتوجد عروض حصرية على التجميل الآن!",
      ctaLink: "/offers",
      ctaLabel: "تصفح عروض التجميل",
      ctaIcon: "offer",
    };
  }

  if (/زراعة|مفقود|زرع|بدوني سن/.test(t)) {
    return {
      text: "زراعة الأسنان هي الحل الأمثل والأكثر ثباتاً لتعويض السن المفقود! 🦷\n\n🔹 جذر تيتانيوم يندمج مع العظم\n🔹 تاج خزفي طبيعي المظهر\n🔹 يدوم مدى الحياة مع العناية الصحيحة\n\nيحتاج تقييم سماكة عظم الفك قبل البدء.",
      ctaLink: "/#doctors",
      ctaLabel: "ابحث عن أخصائي زراعة",
      ctaIcon: "booking",
    };
  }

  if (/أسنان الأطفال|ابني|بنتي|طفل|بيبي/.test(t)) {
    return {
      text: "العناية بأسنان الأطفال منذ الصغر أساسية جداً! 🧸\n\n🔹 أول زيارة عند ظهور أول سن أو قبل عمر السنة\n🔹 حماية الأسنان اللبنية من التسوس المبكر\n🔹 أطباء الأطفال مدربون على التعامل بلطف\n\nلدينا أطباء متخصصون بأسنان الأطفال.",
      ctaLink: "/#doctors",
      ctaLabel: "ابحث عن طبيب أطفال",
      ctaIcon: "booking",
    };
  }

  // ===== عيون =====
  if (/عيون|نظر|ليزك|ليزر عيون|ضعف بصر|تشوش|حول|ماء أبيض|ماء أزرق|قطارة|عدسة/.test(t)) {
    return {
      text: "رعاية صحة العين من أهم الأولويات! 👁️\n\n🔹 ضعف النظر → فحص نظر وصرف نظارة أو عدسات\n🔹 الليزك → تصحيح دائم لضعف النظر بالليزر\n🔹 الماء الأبيض (الكتاراكت) → عملية يومية آمنة\n🔹 الجلوكوما (الماء الأزرق) → يحتاج متابعة منتظمة\n🔹 التهاب الملتحمة → يعالج بالقطرات المناسبة\n\nراجع أخصائي العيون لفحص دقيق.",
      ctaLink: "/#doctors",
      ctaLabel: "ابحث عن طبيب عيون",
      ctaIcon: "booking",
    };
  }

  // ===== جلدية وبشرة =====
  if (/بشرة|جلد|حب الشباب|حبوب|أكنيه|تساقط شعر|فراغات شعر|صدفية|إكزيما|تصبغات|دوالي|وصمة|مسام/.test(t)) {
    return {
      text: "مشاكل البشرة والجلد لها حلول فعّالة! 🧴\n\n🔹 حب الشباب → بروتوكولات ليزر + كريمات علاجية\n🔹 تساقط الشعر → حقن البلازما + مكملات\n🔹 التصبغات → ليزر كربون أو بيلينج كيميائي\n🔹 الصدفية والإكزيما → علاج متخصص ومستمر\n\nعروض مميزة على خدمات الجلدية متوفرة.",
      ctaLink: "/beauty",
      ctaLabel: "تصفح مراكز الجلدية",
      ctaIcon: "beauty",
    };
  }

  // ===== تجميل =====
  if (/تجميل|فيلر|بوتوكس|شد وجه|تخسيس|بطن|أنف|تجميل أنف|حقن|ريستيلان|مزوثيرابي/.test(t)) {
    return {
      text: "خدمات التجميل الحديثة تطورت كثيراً! ✨\n\n🔹 فيلر الشفاه والوجه — نتيجة فورية طبيعية\n🔹 البوتوكس — لإزالة التجاعيد والخطوط\n🔹 شفط الدهون والتخسيس الموضعي\n🔹 تجميل الأنف بدون جراحة (فيلر)\n🔹 مزوثيرابي لتجديد شباب البشرة\n\nراجع مراكز التجميل المعتمدة لدينا.",
      ctaLink: "/beauty",
      ctaLabel: "تصفح مراكز التجميل",
      ctaIcon: "beauty",
    };
  }

  // ===== أنف وأذن وحنجرة =====
  if (/أذن|أنف|حنجرة|لوزتين|لوز|سمع|طنين|حساسية أنف|جيوب أنفية|بحة|صوت|شخير|انزلاق حاجز/.test(t)) {
    return {
      text: "تخصص الأنف والأذن والحنجرة يعالج طيفاً واسعاً! 👂\n\n🔹 التهاب اللوزتين — علاج أو استئصال إذا تكرر\n🔹 الجيوب الأنفية — بخاخات أو تدخل بسيط\n🔹 انزلاق الحاجز — عملية لتحسين التنفس\n🔹 ضعف السمع والطنين — فحص سمع متخصص\n🔹 الشخير — حلول متعددة منها الليزر\n\nابحث عن أخصائي أنف وأذن وحنجرة.",
      ctaLink: "/#doctors",
      ctaLabel: "ابحث عن أخصائي أنف وأذن",
      ctaIcon: "booking",
    };
  }

  // ===== مختبرات =====
  if (/تحاليل|فحوصات|مختبر|دم|سكر|ضغط|كوليسترول|غدة درقية|فيتامين|هرمونات|بول|صورة دم/.test(t)) {
    return {
      text: "الفحوصات المخبرية أساس التشخيص الدقيق! 🔬\n\n🔹 صورة دم كاملة (CBC)\n🔹 سكر صيامي وتراكمي\n🔹 وظائف كبد وكلى\n🔹 هرمونات الغدة الدرقية\n🔹 فيتامينات D, B12, حديد\n🔹 فحص البول والزرع\n\nيمكنك الحجز في مختبراتنا المعتمدة.",
      ctaLink: "/labs",
      ctaLabel: "تصفح المختبرات",
      ctaIcon: "labs",
    };
  }

  // ===== سوق وأدوات =====
  if (/سوق|أدوات|منتجات|أجهزة طبية|كرسي|معدات|مستلزمات/.test(t)) {
    return {
      text: "سوق ملامح متخصص في المستلزمات والأجهزة الطبية! 🛒\n\n🔹 أجهزة وكراسي طب أسنان\n🔹 مستلزمات عيادات وعمليات\n🔹 أدوات تجميل ومعدات ليزر\n🔹 منتجات العناية والصحة\n\nتصفح السوق للاطلاع على المنتجات والأسعار.",
      ctaLink: "/marketplace",
      ctaLabel: "تصفح سوق ملامح",
      ctaIcon: "marketplace",
    };
  }

  // ===== عروض =====
  if (/عروض|خصومات|تخفيضات|أوفر|عرض/.test(t)) {
    return {
      text: "عروض ملامح تُحدَّث باستمرار! 🏷️\n\n🔹 خصومات على تبييض الأسنان والتجميل\n🔹 باقات العلاج الشاملة بأسعار مخفضة\n🔹 عروض موسمية حصرية للأعضاء\n🔹 بطاقة خصم ملامح تمنحك خصماً دائماً\n\nلا تفوّت العروض الحالية!",
      ctaLink: "/offers",
      ctaLabel: "تصفح جميع العروض",
      ctaIcon: "offer",
    };
  }

  // ===== مجلة =====
  if (/مجلة|مقالات|مقال|معلومات|نصائح|صحة/.test(t)) {
    return {
      text: "مجلة ملامح الطبية تنشر محتوى موثوقاً ومفيداً! 📖\n\n🔹 مقالات صحية مراجعة من أطباء متخصصين\n🔹 نصائح الوقاية والعناية اليومية\n🔹 ترتيبات المستشفيات والعيادات\n🔹 أخبار الطب والجمال في فلسطين\n\nتصفح المجلة للاطلاع على أحدث المواضيع.",
      ctaLink: "/blog",
      ctaLabel: "اقرأ مجلة ملامح",
      ctaIcon: "blog",
    };
  }

  // ===== حجز موعد =====
  if (/احجز|حجز|موعد|متاح|متى/.test(t)) {
    return {
      text: "حجز موعدك مع الطبيب سهل وسريع! 📅\n\n1️⃣ ابحث عن الطبيب حسب التخصص والمدينة\n2️⃣ افتح ملف الطبيب واطلع على المواعيد المتاحة\n3️⃣ تواصل مباشرة عبر الهاتف أو الواتساب\n4️⃣ أو استخدم نموذج الحجز الإلكتروني\n\nجميع الأطباء موثقون ومعتمدون.",
      ctaLink: "/booking",
      ctaLabel: "نظام الحجز الإلكتروني",
      ctaIcon: "booking",
    };
  }

  // ===== ترحيب =====
  if (/مرحبا|سلام|هلا|هلو|مساء|صباح/.test(t)) {
    return {
      text: "أهلاً وسهلاً بك! أنا الحكيم اللبيب 🧠🩺\n\nمساعدك الطبي الذكي في منصة ملامح.ps\n\nيمكنني مساعدتك في:\n🦷 أسنان وتقويم\n👁️ عيون وليزك\n🧴 جلدية وبشرة\n✨ تجميل وفيلر\n👂 أنف وأذن وحنجرة\n🔬 مختبرات وفحوصات\n🏷️ عروض وخصومات\n\nما الذي تحتاجه اليوم؟",
    };
  }

  // ===== افتراضي =====
  return {
    text: "شكراً لاستفسارك! 🩺\n\nكمساعد طبي ذكي، أنصح دائماً بالفحص المباشر في العيادة للتشخيص الدقيق.\n\nيمكنني مساعدتك في:\n🦷 أسنان • 👁️ عيون • 🧴 جلدية\n✨ تجميل • 👂 أنف وأذن • 🔬 مختبرات\n\nجرّب اختر أحد الأزرار السريعة أدناه أو اكتب سؤالك بالتفصيل.",
    ctaLink: "/#doctors",
    ctaLabel: "تصفح جميع الأطباء",
    ctaIcon: "booking",
  };
}

const CTA_STYLES = {
  offer: "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950",
  booking: "bg-slate-950 text-white",
  beauty: "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white",
  labs: "bg-gradient-to-r from-indigo-500 to-sky-500 text-white",
  marketplace: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
  blog: "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
};

export default function AIChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "أهلاً! أنا الحكيم اللبيب 🧠🩺\n\nمساعدك الطبي الذكي في منصة ملامح.ps\n\nيمكنني مساعدتك في:\n🦷 أسنان • 👁️ عيون • 🧴 جلدية\n✨ تجميل • 👂 أنف وأذن • 🔬 مختبرات\n🏷️ عروض • 📅 حجز موعد\n\nما الذي تحتاجه اليوم؟",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response = getBotResponse(textToSend);
      setMessages((prev) => [...prev, { sender: "bot", ...response }]);
    }, 1000 + Math.random() * 600);
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[999] hidden sm:block md:bottom-7 md:left-7" dir="rtl">

      {/* ===== Floating Button ===== */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="افتح الحكيم اللبيب"
          className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_8px_30px_rgba(15,23,42,0.35)] border border-white/10 transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_40px_rgba(15,23,42,0.45)] hover:rounded-[1.2rem]"
        >
          {/* Ping badge */}
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex h-5 w-5 rounded-full bg-amber-400 items-center justify-center">
              <span className="text-[9px] font-black text-slate-950 leading-none">AI</span>
            </span>
          </span>

          {/* Brain icon */}
          <Bot className="h-6 w-6 text-amber-400" />

          {/* Tooltip on hover */}
          <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-xl bg-slate-950 border border-white/10 px-3 py-1.5 text-xs font-black text-white opacity-0 shadow-xl transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
            الحكيم اللبيب 🧠
          </span>
        </button>
      )}

      {/* ===== Chat Window ===== */}
      {isOpen && (
        <div
          className="flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white shadow-[0_24px_60px_rgba(9,13,22,0.18)] backdrop-blur-xl"
          style={{ width: 380, height: 600 }}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between overflow-hidden bg-slate-950 px-5 py-4 border-b border-slate-800">
            {/* glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-amber-500/10 via-transparent to-transparent" />
            <div className="relative flex items-center gap-3">
              {/* avatar */}
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/20 shadow-inner">
                <Bot className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-right">
                <h4 className="flex items-center gap-1.5 font-black text-white text-sm">
                  الحكيم اللبيب
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black text-emerald-400">
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
              className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Service Pills */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
            {[
              { label: "🦷 أسنان", q: "أسنان وتقويم" },
              { label: "👁️ عيون", q: "مشاكل العيون والنظر" },
              { label: "🧴 بشرة", q: "مشاكل البشرة والجلد" },
              { label: "✨ تجميل", q: "خدمات التجميل والفيلر" },
              { label: "👂 أنف وأذن", q: "أنف وأذن وحنجرة" },
              { label: "🔬 مختبر", q: "فحوصات مختبر" },
            ].map((pill) => (
              <button
                key={pill.label}
                onClick={() => sendMessage(pill.q)}
                className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black text-slate-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 flex-shrink-0"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/30 px-4 py-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-start" : "items-end"}`}>
                {msg.sender === "bot" && (
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-slate-950">
                      <Bot className="h-3 w-3 text-amber-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400">الحكيم اللبيب</span>
                  </div>
                )}
                <div
                  className={`max-w-[88%] whitespace-pre-line rounded-[1.4rem] px-4 py-3.5 text-xs leading-relaxed font-semibold shadow-sm ${
                    msg.sender === "user"
                      ? "rounded-tl-md bg-slate-950 text-white text-right border border-slate-800"
                      : "rounded-tr-md bg-white text-slate-800 text-right border border-slate-200/70"
                  }`}
                >
                  {msg.text}

                  {/* CTA Button */}
                  {msg.ctaLink && msg.ctaLabel && msg.ctaIcon && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                      <Link
                        href={msg.ctaLink}
                        onClick={() => setIsOpen(false)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all hover:scale-[1.02] shadow-sm ${CTA_STYLES[msg.ctaIcon]}`}
                      >
                        {msg.ctaIcon === "offer" && <Tags className="h-3.5 w-3.5" />}
                        {msg.ctaIcon === "booking" && <Calendar className="h-3.5 w-3.5 text-amber-400" />}
                        {msg.ctaIcon === "beauty" && <Sparkles className="h-3.5 w-3.5" />}
                        {msg.ctaIcon === "labs" && <FlaskConical className="h-3.5 w-3.5" />}
                        {msg.ctaIcon === "marketplace" && <ShoppingBag className="h-3.5 w-3.5" />}
                        {msg.ctaIcon === "blog" && <BookOpen className="h-3.5 w-3.5" />}
                        {msg.ctaLabel}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-end">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-slate-950">
                    <Bot className="h-3 w-3 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400">يكتب...</span>
                </div>
                <div className="rounded-[1.4rem] rounded-tr-md bg-white border border-slate-200/70 px-5 py-4 flex items-center gap-1.5 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "140ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "280ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips */}
          <div className="hide-scrollbar flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-4 py-2.5">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => sendMessage(chip.q)}
                className="flex-shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-black text-slate-600 transition-all hover:border-slate-950 hover:bg-slate-950 hover:text-white"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-2.5 border-t border-slate-100 bg-white px-4 py-3"
          >
            <input
              type="text"
              placeholder="اكتب سؤالك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
            />
            <button
              type="submit"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-md transition-all hover:bg-amber-500"
            >
              <Send className="h-4 w-4 -rotate-90" />
            </button>
          </form>

          {/* Disclaimer */}
          <div className="flex items-center gap-1.5 border-t border-slate-100 bg-slate-50 px-4 py-2">
            <AlertCircle className="h-3 w-3 flex-shrink-0 text-slate-400" />
            <span className="text-[10px] font-semibold text-slate-400">
              إرشاد طبي أولي فقط، لا يغني عن الفحص السريري.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
