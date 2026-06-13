import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Linking,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

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
  { label: "🦷 أسنان", q: "أسنان وتقويم" },
  { label: "👁️ عيون", q: "مشاكل العيون والنظر" },
  { label: "🧴 بشرة", q: "مشاكل البشرة والجلد" },
  { label: "✨ تجميل", q: "خدمات التجميل والفيلر" },
  { label: "👂 أنف وأذن", q: "أنف وأذن وحنجرة" },
  { label: "🔬 مختبر", q: "فحوصات مختبر" },
  { label: "🏷️ عروض", q: "عروض وخصومات متاحة" },
  { label: "📅 حجز", q: "أريد حجز موعد مع طبيب" },
];

const QUICK_CHIPS = [
  { label: "🦷 ألم أسنان", q: "عندي ألم شديد في أسناني" },
  { label: "👁️ مشاكل العيون", q: "عندي مشكلة في نظري وعيوني" },
  { label: "🧴 مشاكل البشرة", q: "عندي مشكلة في البشرة والجلد" },
  { label: "✨ تجميل وفيلر", q: "أريد الاستفسار عن خدمات التجميل والفيلر" },
  { label: "👂 أنف وأذن", q: "أنف وأذن وحنجرة" },
  { label: "🔬 فحوصات", q: "أريد إجراء تحاليل وفحوصات مخبرية" },
  { label: "🏷️ عروض", q: "ما هي العروض والخصومات المتاحة؟" },
  { label: "📅 احجز موعد", q: "أريد حجز موعد" },
];

const CTA_COLORS = {
  offer: { bg: "#fef3c7", border: "#fde68a", text: "#92400e", icon: "pricetag-outline" as const },
  booking: { bg: "#0f172a", border: "#1e293b", text: "#ffffff", icon: "calendar-outline" as const },
  beauty: { bg: "#fdf2f8", border: "#fbcfe8", text: "#9d174d", icon: "sparkles-outline" as const },
  labs: { bg: "#f0f9ff", border: "#bae6fd", text: "#0369a1", icon: "flask-outline" as const },
  marketplace: { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46", icon: "cart-outline" as const },
  blog: { bg: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6", icon: "book-outline" as const },
};

function getBotResponse(text: string): Omit<Message, "sender"> {
  const t = text;

  if (/ألم|وجع|عصب|بوجعني|موجوع|ضرس/.test(t))
    return {
      text: "شفاك الله! 😔\n\nألم الأسنان الحاد غالباً مؤشر على:\n🔹 التهاب عصب ← حشو جذور\n🔹 تسوس عميق → حشوة فورية\n🔹 تورم → فحص عاجل\n\nأنصحك بحجز موعد عاجل.",
      ctaLink: "/#doctors",
      ctaLabel: "ابحث عن طبيب أسنان",
      ctaIcon: "booking",
    };

  if (/تقويم|اعوجاج|فراغ بين|إطباق|الفك/.test(t))
    return {
      text: "تقويم الأسنان يصحح الاصطفاف والإطباق! 😁\n\n🔹 تقويم معدني — الأكثر فاعلية\n🔹 تقويم شفاف — أقل ظهوراً\n🔹 مدة 12–24 شهراً\n\nزُر أخصائي تقويم لخطة مخصصة.",
      ctaLink: "/#doctors",
      ctaLabel: "ابحث عن أخصائي تقويم",
      ctaIcon: "booking",
    };

  if (/تبييض|ابتسامة|فينير|زيركون|ليمينيت/.test(t))
    return {
      text: "ابتسامة ناصعة في متناول يدك! ✨\n\n🔹 تبييض ليزر — نتيجة فورية\n🔹 تبييض منزلي — آمن وتدريجي\n🔹 فينير/زيركون — لإخفاء التشقق الدائم\n\nتوجد عروض حصرية الآن!",
      ctaLink: "/offers",
      ctaLabel: "تصفح عروض التجميل",
      ctaIcon: "offer",
    };

  if (/زراعة|مفقود|زرع|بدوني سن/.test(t))
    return {
      text: "زراعة الأسنان الحل الأمثل! 🦷\n\n🔹 جذر تيتانيوم يندمج مع العظم\n🔹 تاج خزفي طبيعي المظهر\n🔹 يدوم مدى الحياة مع العناية\n\nيحتاج تقييم عظم الفك أولاً.",
      ctaLink: "/#doctors",
      ctaLabel: "ابحث عن أخصائي زراعة",
      ctaIcon: "booking",
    };

  if (/أسنان الأطفال|ابني|بنتي|طفل|بيبي/.test(t))
    return {
      text: "العناية بأسنان الأطفال أساسية! 🧸\n\n🔹 أول زيارة عند ظهور أول سن\n🔹 حماية من التسوس المبكر\n🔹 أطباء مدربون على التعامل مع الأطفال",
      ctaLink: "/#doctors",
      ctaLabel: "ابحث عن طبيب أطفال",
      ctaIcon: "booking",
    };

  if (/عيون|نظر|ليزك|ليزر عيون|ضعف بصر|تشوش|حول|ماء أبيض|ماء أزرق|قطارة|عدسة/.test(t))
    return {
      text: "رعاية العين أولوية قصوى! 👁️\n\n🔹 ضعف النظر → فحص نظر وتصحيح\n🔹 الليزك → تصحيح دائم بالليزر\n🔹 الكتاراكت → عملية يومية آمنة\n🔹 الجلوكوما → متابعة منتظمة\n\nراجع أخصائي عيون الأقرب.",
      ctaLink: "/#doctors",
      ctaLabel: "ابحث عن طبيب عيون",
      ctaIcon: "booking",
    };

  if (/بشرة|جلد|حب الشباب|حبوب|أكنيه|تساقط شعر|فراغات شعر|صدفية|إكزيما|تصبغات|مسام/.test(t))
    return {
      text: "مشاكل البشرة لها حلول فعّالة! 🧴\n\n🔹 حب الشباب → ليزر + كريمات علاجية\n🔹 تساقط الشعر → حقن البلازما\n🔹 التصبغات → ليزر كربون\n🔹 الصدفية → علاج متخصص مستمر\n\nعروض مميزة على الجلدية!",
      ctaLink: "/beauty",
      ctaLabel: "تصفح مراكز الجلدية",
      ctaIcon: "beauty",
    };

  if (/تجميل|فيلر|بوتوكس|شد وجه|تخسيس|تجميل أنف|حقن|ريستيلان|مزوثيرابي/.test(t))
    return {
      text: "خدمات التجميل تطورت كثيراً! ✨\n\n🔹 فيلر الشفاه والوجه — فوري وطبيعي\n🔹 البوتوكس — لإزالة التجاعيد\n🔹 شفط الدهون الموضعي\n🔹 تجميل الأنف بلا جراحة\n🔹 مزوثيرابي لتجديد البشرة",
      ctaLink: "/beauty",
      ctaLabel: "تصفح مراكز التجميل",
      ctaIcon: "beauty",
    };

  if (/أذن|أنف|حنجرة|لوزتين|سمع|طنين|حساسية أنف|جيوب أنفية|بحة|شخير|انزلاق حاجز/.test(t))
    return {
      text: "أخصائي الأنف والأذن والحنجرة يساعدك! 👂\n\n🔹 التهاب اللوزتين → علاج أو استئصال\n🔹 الجيوب الأنفية → بخاخ أو تدخل بسيط\n🔹 انزلاق الحاجز → عملية لتحسين التنفس\n🔹 ضعف السمع والطنين → فحص متخصص",
      ctaLink: "/#doctors",
      ctaLabel: "ابحث عن أخصائي أنف وأذن",
      ctaIcon: "booking",
    };

  if (/تحاليل|فحوصات|مختبر|دم|سكر|كوليسترول|غدة درقية|فيتامين|هرمونات|بول/.test(t))
    return {
      text: "الفحوصات أساس التشخيص الدقيق! 🔬\n\n🔹 صورة دم كاملة (CBC)\n🔹 سكر صيامي وتراكمي\n🔹 وظائف كبد وكلى\n🔹 هرمونات الغدة الدرقية\n🔹 فيتامينات D, B12, حديد\n\nاحجز في مختبراتنا المعتمدة.",
      ctaLink: "/labs",
      ctaLabel: "تصفح المختبرات",
      ctaIcon: "labs",
    };

  if (/سوق|أدوات|منتجات|أجهزة طبية|معدات|مستلزمات/.test(t))
    return {
      text: "سوق ملامح للمستلزمات الطبية! 🛒\n\n🔹 أجهزة وكراسي طب أسنان\n🔹 مستلزمات عيادات وعمليات\n🔹 أدوات تجميل وليزر\n🔹 منتجات العناية والصحة",
      ctaLink: "/marketplace",
      ctaIcon: "marketplace",
      ctaLabel: "تصفح سوق ملامح",
    };

  if (/عروض|خصومات|تخفيضات|أوفر/.test(t))
    return {
      text: "عروض ملامح تُحدَّث باستمرار! 🏷️\n\n🔹 خصومات تبييض أسنان وتجميل\n🔹 باقات علاج شاملة بأسعار مخفضة\n🔹 عروض موسمية حصرية\n🔹 بطاقة خصم ملامح الدائمة",
      ctaLink: "/offers",
      ctaLabel: "تصفح جميع العروض",
      ctaIcon: "offer",
    };

  if (/مجلة|مقالات|نصائح|صحة/.test(t))
    return {
      text: "مجلة ملامح — محتوى طبي موثوق! 📖\n\n🔹 مقالات مراجعة من أطباء متخصصين\n🔹 نصائح وقاية وعناية يومية\n🔹 أخبار الطب والجمال في فلسطين",
      ctaLink: "/blog",
      ctaLabel: "اقرأ مجلة ملامح",
      ctaIcon: "blog",
    };

  if (/احجز|حجز|موعد|متاح|متى/.test(t))
    return {
      text: "حجز موعدك سهل وسريع! 📅\n\n1️⃣ ابحث عن الطبيب حسب التخصص والمدينة\n2️⃣ افتح ملف الطبيب واطلع على المواعيد\n3️⃣ تواصل عبر الهاتف أو الواتساب\n4️⃣ أو استخدم نموذج الحجز الإلكتروني\n\nجميع الأطباء موثقون ومعتمدون.",
      ctaLink: "/booking",
      ctaLabel: "نظام الحجز الإلكتروني",
      ctaIcon: "booking",
    };

  if (/مرحبا|سلام|هلا|هلو|مساء|صباح/.test(t))
    return {
      text: "أهلاً وسهلاً! أنا الحكيم اللبيب 🧠🩺\n\nمساعدك الطبي الذكي في منصة ملامح.ps\n\nيمكنني مساعدتك في:\n🦷 أسنان • 👁️ عيون • 🧴 جلدية\n✨ تجميل • 👂 أنف وأذن • 🔬 مختبرات\n🏷️ عروض • 📅 حجز موعد\n\nما الذي تحتاجه اليوم؟",
    };

  return {
    text: "شكراً لاستفسارك! 🩺\n\nيمكنني مساعدتك في:\n🦷 أسنان • 👁️ عيون • 🧴 جلدية\n✨ تجميل • 👂 أنف وأذن • 🔬 مختبرات\n🏷️ عروض • 📅 حجز موعد\n\nاختر من الأزرار السريعة أو اكتب سؤالك.",
    ctaLink: "/#doctors",
    ctaLabel: "تصفح جميع الأطباء",
    ctaIcon: "booking",
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
    if (supabase) {
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

interface AIChatbotProps {
  onNavigateTab?: (
    tab: "home" | "doctors" | "map" | "services" | "more",
    serviceFilter?: "all" | "booking" | "beauty" | "lab" | "consultation" | "partner" | "stores"
  ) => void;
}

export function AIChatbot({ onNavigateTab }: AIChatbotProps) {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "أهلاً! أنا الحكيم اللبيب 🧠🩺\n\nمساعدك الطبي الذكي في منصة ملامح.ps\n\nيمكنني مساعدتك في:\n🦷 أسنان • 👁️ عيون • 🧴 جلدية\n✨ تجميل • 👂 أنف وأذن • 🔬 مختبرات\n🏷️ عروض • 📅 حجز موعد\n\nما الذي تحتاجه اليوم؟",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Animations
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pingAnim = useRef(new Animated.Value(1)).current;

  const scrollViewRef = useRef<ScrollView>(null);

  // Auto scroll to end on message add
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messages, isTyping]);

  // Floating button pulsing animation
  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (!isOpen) {
      const pulse = () => {
        pingAnim.setValue(1);
        anim = Animated.sequence([
          Animated.timing(pingAnim, {
            toValue: 1.25,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pingAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]);
        anim.start(() => {
          if (!isOpen) pulse();
        });
      };
      pulse();
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
    });
  };

  const [chatContext, setChatContext] = useState<{ city?: string; category?: string }>({});

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setInput("");
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const response = await getBotResponseAsync(textToSend, chatContext, setChatContext);
        setMessages((prev) => [...prev, { sender: "bot", ...response }]);
      } catch (error) {
        console.error("Error in mobile bot async response:", error);
        const fallback = getBotResponse(textToSend);
        setMessages((prev) => [...prev, { sender: "bot", ...fallback }]);
      } finally {
        setIsTyping(false);
      }
    }, 800 + Math.random() * 400);
  };

  const handleCtaClick = (ctaLink: string, ctaIcon: string) => {
    handleClose();

    // Route transitions based on CTA
    if (ctaLink === "/#doctors" && onNavigateTab) {
      onNavigateTab("doctors");
    } else if (ctaLink === "/offers" && onNavigateTab) {
      onNavigateTab("more");
    } else if (ctaLink === "/marketplace" && onNavigateTab) {
      onNavigateTab("services", "stores");
    } else if (ctaLink === "/booking") {
      router.push("/booking" as any);
    } else if (ctaLink === "/beauty") {
      router.push("/beauty" as any);
    } else if (ctaLink === "/labs") {
      router.push("/labs" as any);
    } else if (ctaLink === "/blog") {
      router.push("/blog/index" as any);
    } else {
      // General path fallback
      if (ctaLink.startsWith("/")) {
        const cleanPath = ctaLink === "/blog" ? "/blog/index" : ctaLink;
        try {
          router.push(cleanPath as any);
        } catch (e) {
          console.error("Navigation error:", e);
        }
      }
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      {!isOpen && (
        <Pressable
          onPress={handleOpen}
          style={[
            styles.floatingBtn,
            { bottom: 84 + insets.bottom }, // Position above custom BottomNav
          ]}
        >
          {/* Pulsing ring outer */}
          <Animated.View
            style={[
              styles.floatingBtnPulse,
              {
                transform: [{ scale: pingAnim }],
                opacity: pingAnim.interpolate({
                  inputRange: [1, 1.25],
                  outputRange: [0.4, 0],
                }),
              },
            ]}
          />

          <View style={styles.floatingBtnContent}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#fbbf24" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AI</Text>
            </View>
          </View>
        </Pressable>
      )}

      {/* CHAT WINDOW OVERLAY */}
      {isOpen && (
        <View style={StyleSheet.absoluteFillObject}>
          {/* Backdrop */}
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <Pressable style={styles.backdropPressable} onPress={handleClose} />
          </Animated.View>

          {/* Bottom Sheet chat window */}
          <Animated.View
            style={[
              styles.chatContainer,
              {
                transform: [{ translateY: slideAnim }],
                paddingBottom: Platform.OS === "ios" ? insets.bottom + 8 : 12,
              },
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
              style={{ flex: 1 }}
            >
              {/* HEADER */}
              <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarIconBg}>
                      <Ionicons name="chatbubbles-outline" size={20} color="#fbbf24" />
                    </View>
                    <View style={styles.onlineDot} />
                  </View>

                  <View style={styles.headerTextContainer}>
                    <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
                      <Text style={styles.headerTitle}>الحكيم اللبيب</Text>
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>مجاني</Text>
                      </View>
                    </View>
                    <Text style={styles.headerSubtitle}>مستشارك الطبي الذكي • ملامح.ps</Text>
                  </View>
                </View>

                <Pressable onPress={handleClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color="#94a3b8" />
                </Pressable>
              </View>

              {/* SERVICE PILLS (Horizontal Swipe) */}
              <View style={styles.pillsContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillsScrollContent}
                  style={{ flexDirection: "row-reverse" }}
                >
                  {SERVICE_PILLS.map((pill) => (
                    <Pressable
                      key={pill.label}
                      onPress={() => sendMessage(pill.q)}
                      style={styles.pill}
                    >
                      <Text style={styles.pillText}>{pill.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* MESSAGES LIST */}
              <ScrollView
                ref={scrollViewRef}
                style={styles.messageScroll}
                contentContainerStyle={styles.messageScrollContent}
                showsVerticalScrollIndicator={true}
              >
                {messages.map((msg, idx) => {
                  const isUser = msg.sender === "user";
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.messageRow,
                        isUser ? styles.messageRowUser : styles.messageRowBot,
                      ]}
                    >
                      {!isUser && (
                        <View style={styles.msgBotHeader}>
                          <View style={styles.msgBotIconBg}>
                            <Ionicons name="chatbubble-ellipses-outline" size={10} color="#fbbf24" />
                          </View>
                          <Text style={styles.msgBotLabel}>الحكيم اللبيب</Text>
                        </View>
                      )}

                      <View
                        style={[
                          styles.messageBubble,
                          isUser ? styles.messageBubbleUser : styles.messageBubbleBot,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            isUser ? styles.messageTextUser : styles.messageTextBot,
                          ]}
                        >
                          {msg.text}
                        </Text>

                        {/* Dynamic Doctor Cards */}
                        {msg.doctors && msg.doctors.length > 0 && (
                          <View style={styles.doctorsContainer}>
                            {msg.doctors.map((doc: any) => (
                              <View key={doc.id} style={styles.doctorCardMini}>
                                {doc.image_url ? (
                                  <Image source={{ uri: doc.image_url }} style={styles.doctorAvatarMini} />
                                ) : (
                                  <View style={styles.doctorAvatarFallbackMini}>
                                    <Text style={{ fontSize: 16 }}>🧑‍⚕️</Text>
                                  </View>
                                )}
                                <View style={styles.doctorInfoMini}>
                                  <Text style={styles.doctorNameMini}>{doc.name}</Text>
                                  <Text style={styles.doctorSpecialtyMini}>{(doc.specialty || []).join(" · ")}</Text>
                                  <Text style={styles.doctorCityMini}>📍 {doc.city}</Text>
                                </View>
                                <View style={styles.doctorActionsMini}>
                                  <Pressable
                                    onPress={() => {
                                      handleClose();
                                      router.push(`/doctor/${doc.id}` as any);
                                    }}
                                    style={styles.doctorBtnMini}
                                  >
                                    <Text style={styles.doctorBtnTextMini}>الملف</Text>
                                  </Pressable>
                                  {doc.whatsapp && (
                                    <Pressable
                                      onPress={() => Linking.openURL(`https://wa.me/${doc.whatsapp.replace(/[^0-9]/g, '')}`)}
                                      style={[styles.doctorBtnMini, { backgroundColor: "#10b981", marginTop: 4 }]}
                                    >
                                      <Text style={styles.doctorBtnTextMini}>واتساب</Text>
                                    </Pressable>
                                  )}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* CTA BUTTON */}
                        {msg.ctaLink && msg.ctaLabel && msg.ctaIcon && (
                          <View style={styles.ctaWrapper}>
                            <Pressable
                              onPress={() => handleCtaClick(msg.ctaLink!, msg.ctaIcon!)}
                              style={({ pressed }) => [
                                styles.ctaButton,
                                {
                                  backgroundColor: CTA_COLORS[msg.ctaIcon!].bg,
                                  borderColor: CTA_COLORS[msg.ctaIcon!].border,
                                  opacity: pressed ? 0.86 : 1,
                                },
                              ]}
                            >
                              <Ionicons
                                name={CTA_COLORS[msg.ctaIcon!].icon}
                                size={14}
                                color={CTA_COLORS[msg.ctaIcon!].text}
                                style={{ marginLeft: 6 }}
                              />
                              <Text
                                style={[
                                  styles.ctaText,
                                  { color: CTA_COLORS[msg.ctaIcon!].text },
                                ]}
                              >
                                {msg.ctaLabel}
                              </Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}

                {/* TYPING INDICATOR */}
                {isTyping && (
                  <View style={[styles.messageRow, styles.messageRowBot]}>
                    <View style={styles.msgBotHeader}>
                      <View style={styles.msgBotIconBg}>
                        <Ionicons name="chatbubble-ellipses-outline" size={10} color="#fbbf24" />
                      </View>
                      <Text style={styles.msgBotLabel}>الحكيم اللبيب يكتب...</Text>
                    </View>
                    <View style={[styles.messageBubble, styles.messageBubbleBot, styles.typingBubble]}>
                      <ActivityIndicator size="small" color="#94a3b8" />
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* QUICK CHIPS */}
              <View style={styles.chipsContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsScrollContent}
                  style={{ flexDirection: "row-reverse" }}
                >
                  {((messages[messages.length - 1]?.sender === "bot" && messages[messages.length - 1]?.chips)
                    ? messages[messages.length - 1].chips
                    : QUICK_CHIPS
                  )?.map((chip) => (
                    <Pressable
                      key={chip.label}
                      onPress={() => sendMessage(chip.q)}
                      style={styles.chip}
                    >
                      <Text style={styles.chipText}>{chip.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* INPUT FORM */}
              <View style={styles.inputArea}>
                <Pressable
                  onPress={() => sendMessage(input)}
                  disabled={!input.trim()}
                  style={({ pressed }) => [
                    styles.sendBtn,
                    {
                      backgroundColor: input.trim() ? "#fbbf24" : "#1e293b",
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name="send"
                    size={16}
                    color={input.trim() ? "#0a0f1d" : "#475569"}
                    style={{ transform: [{ rotate: "180deg" }] }} // Point left for Arabic RTL
                  />
                </Pressable>

                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="اكتب سؤالك الطبي هنا..."
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  onSubmitEditing={() => sendMessage(input)}
                  returnKeyType="send"
                />
              </View>

              {/* DISCLAIMER FOOTER */}
              <View style={styles.disclaimer}>
                <Ionicons name="alert-circle-outline" size={12} color="#94a3b8" style={{ marginLeft: 4 }} />
                <Text style={styles.disclaimerText}>
                  إرشاد طبي أولي فقط، لا يغني عن الفحص السريري المباشر.
                </Text>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  floatingBtn: {
    position: "absolute",
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "#0a0f1d",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  floatingBtnPulse: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 28,
    backgroundColor: "#fbbf24",
    zIndex: -1,
  },
  floatingBtnContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fbbf24",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#0a0f1d",
    lineHeight: 11,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9, 13, 22, 0.55)",
    zIndex: 1000,
  },
  backdropPressable: {
    flex: 1,
  },
  chatContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.78,
    backgroundColor: "#0a0f1d",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 1001,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0a0f1d",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitleContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarIconBg: {
    justifyContent: "center",
    alignItems: "center",
  },
  onlineDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#0a0f1d",
  },
  headerTextContainer: {
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
  },
  freeBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 1.5,
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#34d399",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  pillsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    backgroundColor: "#0a0f1d",
    paddingVertical: 10,
  },
  pillsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#e2e8f0",
  },
  messageScroll: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  messageScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  messageRow: {
    width: "100%",
    marginVertical: 2,
  },
  messageRowUser: {
    alignItems: "flex-end",
  },
  messageRowBot: {
    alignItems: "flex-start",
  },
  msgBotHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  msgBotIconBg: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: "#0a0f1d",
    justifyContent: "center",
    alignItems: "center",
  },
  msgBotLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#64748b",
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageBubbleUser: {
    backgroundColor: "#fbbf24",
    borderTopRightRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  messageBubbleBot: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: "#334155",
  },
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "right",
  },
  messageTextUser: {
    color: "#0a0f1d",
  },
  messageTextBot: {
    color: "#ffffff",
  },
  ctaWrapper: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 8,
    alignItems: "flex-end",
  },
  ctaButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: "900",
  },
  chipsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    backgroundColor: "#0a0f1d",
    paddingVertical: 10,
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#cbd5e1",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a0f1d",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#1e293b",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "right",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  disclaimer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0f1d",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  disclaimerText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#64748b",
  },
  doctorsContainer: {
    marginTop: 10,
    gap: 8,
    width: "100%",
  },
  doctorCardMini: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  doctorAvatarMini: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  doctorAvatarFallbackMini: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  doctorInfoMini: {
    flex: 1,
    alignItems: "flex-end",
  },
  doctorNameMini: {
    fontSize: 11,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "right",
  },
  doctorSpecialtyMini: {
    fontSize: 9,
    fontWeight: "800",
    color: "#10b981",
    marginTop: 2,
    textAlign: "right",
  },
  doctorCityMini: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 1,
    textAlign: "right",
  },
  doctorActionsMini: {
    flexDirection: "column",
    gap: 4,
  },
  doctorBtnMini: {
    backgroundColor: "#334155",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 50,
    alignItems: "center",
  },
  doctorBtnTextMini: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
  },
});
