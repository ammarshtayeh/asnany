import Link from "next/link";
import {
  Activity,
  Beaker,
  BookOpenCheck,
  Bot,
  CalendarCheck2,
  Camera,
  ChevronLeft,
  GraduationCap,
  HeartHandshake,
  Hospital,
  Megaphone,
  Microscope,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Store,
  Video,
} from "lucide-react";

const platformPillars = [
  {
    title: "الدليل الطبي الذكي",
    text: "بحث منظم عن الأطباء والعيادات والمراكز حسب المدينة والتخصص والتقييم والخدمات المتاحة.",
    icon: Hospital,
    href: "#smart-directory",
    tone: "bg-sky-50 text-sky-700 border-sky-100 group-hover:bg-sky-600",
    shadow: "hover:shadow-sky-100/70",
  },
  {
    title: "الحجز والاستشارات",
    text: "تجربة واضحة تبدأ باختيار مقدم الخدمة ثم إرسال الطلب وتأكيد الموعد بأبسط شكل.",
    icon: CalendarCheck2,
    href: "/booking",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100 group-hover:bg-emerald-600",
    shadow: "hover:shadow-emerald-100/70",
  },
  {
    title: "الميديا الطبية",
    text: "مقالات وأخبار وفيديوهات توعوية تساعد الزائر على اتخاذ قرار صحي أكثر وعيًا.",
    icon: BookOpenCheck,
    href: "/media",
    tone: "bg-indigo-50 text-indigo-700 border-indigo-100 group-hover:bg-indigo-600",
    shadow: "hover:shadow-indigo-100/70",
  },
  {
    title: "التسويق الطبي",
    text: "مساحات رعاية وإعلانات وعروض للشركات والعيادات ضمن بيئة طبية موثوقة.",
    icon: Megaphone,
    href: "/advertise",
    tone: "bg-amber-50 text-amber-700 border-amber-100 group-hover:bg-amber-500",
    shadow: "hover:shadow-amber-100/70",
  },
];

const serviceHubs = [
  {
    title: "أطباء وعيادات الأسنان",
    icon: Stethoscope,
    href: "#doctors",
    meta: "تخصصات، تقييمات، صور، دوام، وحجز",
    tone: "bg-sky-50 text-sky-700",
  },
  {
    title: "مراكز التجميل",
    icon: Sparkles,
    href: "/beauty",
    meta: "بشرة، ليزر، فيلر، بوتوكس، وعروض",
    tone: "bg-fuchsia-50 text-fuchsia-700",
  },
  {
    title: "المختبرات الطبية",
    icon: Microscope,
    href: "/labs",
    meta: "تحاليل، فحوصات، أسعار، وخدمات منزلية",
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "الشركات والمنتجات",
    icon: Store,
    href: "/partners",
    meta: "أجهزة، مواد طبية، مستحضرات، ورعايات",
    tone: "bg-amber-50 text-amber-700",
  },
];

const patientValue = [
  "الوصول السريع للطبيب أو المركز المناسب",
  "معرفة الخدمات والأسعار التقريبية قبل التواصل",
  "توفير وقت البحث وتقليل العشوائية في الاختيار",
  "محتوى صحي موثوق ومناسب للعائلات",
];

const providerValue = [
  "ظهور احترافي للعيادات والمراكز والشركات",
  "قنوات واضحة لاستقبال الحجوزات والاستفسارات",
  "إبراز العروض والخدمات الجديدة بطريقة منظمة",
  "بناء ثقة رقمية أقوى مع المرضى والجمهور",
];

const experienceSteps = [
  { phase: "01", title: "ابحث بذكاء", text: "اختار المدينة أو الخدمة وشاهد النتائج المناسبة بسرعة." },
  { phase: "02", title: "قارن بثقة", text: "راجع التخصصات والصور والتقييمات والمعلومات الأساسية." },
  { phase: "03", title: "تواصل واحجز", text: "انتقل مباشرة للحجز أو التواصل مع مقدم الخدمة المناسب." },
  { phase: "04", title: "تابع وتعلم", text: "استفد من المقالات والتنبيهات والعروض الصحية المتجددة." },
];

const educationItems = [
  { title: "المفيد للأسنان", text: "أغذية مفيدة، عادات صحية، منتجات موثوقة، وفحوصات دورية.", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { title: "الضار للأسنان", text: "التدخين، المشروبات الغازية، أخطاء التفريش، والمنتجات غير المناسبة.", tone: "bg-rose-50 text-rose-700 border-rose-100" },
  { title: "اختبارات تفاعلية", text: "أسئلة قصيرة تساعد الزائر على فهم عاداته ومتى يحتاج مراجعة طبيب.", tone: "bg-sky-50 text-sky-700 border-sky-100" },
];

const futureItems = [
  { title: "توجيه أولي بالذكاء الاصطناعي", icon: Bot },
  { title: "تحليل صور الأسنان مستقبلًا", icon: Camera },
  { title: "أكاديمية للأطباء والطلاب", icon: GraduationCap },
  { title: "خدمات مختبرية ومنزلية", icon: Beaker },
];

export default function PlatformExpansion() {
  return (
    <section className="bg-white border-y border-slate-200" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 space-y-20">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 text-sm font-black">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              مرجع طبي رقمي لفلسطين
            </span>
            <h2 className="mt-5 text-3xl md:text-5xl font-black text-slate-950 leading-tight">
              تجربة واحدة تجمع الرعاية، المعرفة، والحجز في مكان موثوق.
            </h2>
            <p className="mt-5 text-slate-600 text-lg leading-8 font-medium">
              أسناني منصة موجهة للمواطن والقطاع الطبي: تساعد الزائر على الوصول لمقدم الخدمة المناسب، وتمنح الأطباء والمراكز والشركات حضورًا رقميًا واضحًا واحترافيًا.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {platformPillars.map((item) => (
              <Link key={item.title} href={item.href} className={`group rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-xl ${item.shadow} transition-all`}>
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${item.tone} group-hover:text-white transition-colors`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-950 text-lg">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-7 mt-2 font-medium">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>

        <div id="smart-directory" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-950">أقسام تخدم احتياجك مباشرة</h2>
              <p className="text-slate-500 mt-2 font-medium">اختر القسم المناسب وابدأ البحث أو التواصل بخطوات قليلة.</p>
            </div>
            <Link href="/join" className="inline-flex items-center justify-center gap-2 bg-slate-950 text-white px-5 py-3 rounded-xl font-black hover:bg-sky-600 transition-colors">
              انضم كمقدم خدمة
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {serviceHubs.map((hub) => (
              <Link key={hub.title} href={hub.href} className="rounded-2xl border border-slate-200 p-5 bg-white hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${hub.tone}`}>
                  <hub.icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900">{hub.title}</h3>
                <p className="text-sm text-slate-500 mt-2 font-semibold leading-6">{hub.meta}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-slate-950 text-white p-7 md:p-10 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-sky-400 via-emerald-300 to-amber-300" />
            <HeartHandshake className="w-9 h-9 text-emerald-300 mb-4" />
            <h3 className="text-2xl font-black mb-4">القيمة للزائر</h3>
            <ul className="space-y-3">
              {patientValue.map((item) => (
                <li key={item} className="flex gap-3 text-slate-200 font-semibold leading-7">
                  <span className="mt-2 w-2 h-2 rounded-full bg-emerald-300 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 md:p-10">
            <Activity className="w-9 h-9 text-sky-600 mb-4" />
            <h3 className="text-2xl font-black text-slate-950 mb-4">القيمة لمقدمي الخدمات</h3>
            <ul className="space-y-3">
              {providerValue.map((item) => (
                <li key={item} className="flex gap-3 text-slate-700 font-semibold leading-7">
                  <span className="mt-2 w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Future Banner */}
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-950">تطوير مستمر للمنصة</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">نعمل دائماً على إضافة ميزات جديدة تعتمد على الذكاء الاصطناعي لتسهيل تجربتك.</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-3 w-full md:w-auto">
            {futureItems.map((item) => {
              const TypedIcon = item.icon;
              return (
                <div key={item.title} className="rounded-xl bg-white border border-slate-200 px-4 py-2.5 flex gap-2 items-center shadow-sm">
                  <TypedIcon className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-700 text-xs">{item.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-black text-slate-950">رحلة استخدام بسيطة</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {experienceSteps.map((step) => (
              <div key={step.phase} className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="text-sky-600 font-black text-sm">{step.phase}</span>
                <h3 className="font-black text-slate-950 mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-7 font-medium">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
