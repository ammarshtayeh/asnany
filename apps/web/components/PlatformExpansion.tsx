import Link from "next/link";
import {
  Activity,
  BadgeDollarSign,
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
    text: "أطباء أسنان، عيادات، مراكز تجميل، مختبرات طبية، وموردون طبيون ضمن دليل قابل للبحث والفلترة حسب المدينة والتخصص والتقييم والسعر.",
    icon: Hospital,
    href: "#smart-directory",
  },
  {
    title: "الحجز والاستشارات",
    text: "حجز مواعيد، طلب استشارة كتابية أو مرئية، رفع صور أشعة وتقارير، وتذكيرات عبر الإشعارات والرسائل.",
    icon: CalendarCheck2,
    href: "/booking",
  },
  {
    title: "الإعلام الطبي",
    text: "أخبار، مقالات، فيديوهات توعوية، دراسات وأبحاث، وتغطيات مؤتمرات طب الأسنان والتجميل.",
    icon: BookOpenCheck,
    href: "/media",
  },
  {
    title: "التسويق الطبي",
    text: "إعلانات بانر وفيديو، مقالات ممولة، عروض موسمية، ظهور مميز، وحملات للشركات والعيادات.",
    icon: Megaphone,
    href: "/advertise",
  },
];

const serviceHubs = [
  { title: "أطباء وعيادات الأسنان", icon: Stethoscope, href: "#doctors", meta: "ملفات، تقييمات، صور، دوام، حجز" },
  { title: "مراكز التجميل", icon: Sparkles, href: "/beauty", meta: "ليزر، فيلر، بوتوكس، قبل وبعد" },
  { title: "المختبرات الطبية", icon: Microscope, href: "/labs", meta: "تحاليل، أسعار، فحص منزلي، نتائج" },
  { title: "الشركات والمنتجات", icon: Store, href: "/partners", meta: "أجهزة، مواد، مستحضرات، عروض" },
];

const patientValue = [
  "الوصول السريع للطبيب أو المركز المناسب",
  "معرفة الخدمات والأسعار التقريبية مسبقاً",
  "سهولة الحجز وتقليل وقت البحث",
  "محتوى صحي موثوق وتوعية مستمرة",
];

const providerValue = [
  "ظهور أقوى للعيادات والمراكز",
  "تسويق رقمي منظم واحترافي",
  "إدارة حجوزات ومرضى بصورة أسهل",
  "تقارير أداء وفرص رعاية وإعلانات",
];

const roadmap = [
  { phase: "01", title: "تثبيت الدليل والحجز", text: "تحسين البحث، الملفات، الحجز السريع، لوحة الطبيب، وتأكيد المواعيد." },
  { phase: "02", title: "إطلاق الإعلام الطبي", text: "أخبار، فيديوهات، مقابلات، مقالات موثوقة، ودراسات قابلة للأرشفة." },
  { phase: "03", title: "توسيع الشركاء", text: "مختبرات، مراكز تجميل، شركات منتجات طبية، وحزم إعلانية مدفوعة." },
  { phase: "04", title: "الذكاء الاصطناعي", text: "فرز أولي للأعراض، اقتراح الطبيب المناسب، وتحليل صور الأسنان كمرحلة مستقبلية." },
];

const educationItems = [
  { title: "المفيد للأسنان", text: "أغذية مفيدة، عادات صحية، منتجات موثوقة، وفحوصات دورية.", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { title: "الضار للأسنان", text: "التدخين، المشروبات الغازية، أخطاء التفريش، والمنتجات غير المناسبة.", tone: "bg-rose-50 text-rose-700 border-rose-100" },
  { title: "اختبارات تفاعلية", text: "أسئلة قصيرة تساعد المستخدم على فهم عاداته ومتى يحتاج مراجعة طبيب.", tone: "bg-sky-50 text-sky-700 border-sky-100" },
];

const futureItems = [
  { title: "تشخيص أولي بالذكاء الاصطناعي", icon: Bot },
  { title: "تحليل صور الأسنان", icon: Camera },
  { title: "أكاديمية إلكترونية للأطباء والطلاب", icon: GraduationCap },
  { title: "نتائج مختبرية وخدمات منزلية", icon: Beaker },
];

export default function PlatformExpansion() {
  return (
    <section className="bg-white border-y border-slate-200" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 space-y-20">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 border border-sky-100 px-4 py-2 text-sm font-black">
              <ShieldCheck className="w-4 h-4" />
              منصة طبية إعلامية رقمية متكاملة
            </span>
            <h2 className="mt-5 text-3xl md:text-5xl font-black text-slate-950 leading-tight">
              أسناني ليست دليلاً فقط، بل بوابة صحية وتجارية وإعلامية للقطاع الطبي.
            </h2>
            <p className="mt-5 text-slate-600 text-lg leading-8 font-medium">
              الهدف أن تكون المنصة المرجع الأول في فلسطين والمنطقة لكل ما يتعلق بطب الأسنان، التجميل، المختبرات، التوعية، الحجز، الإعلانات، والشركات الداعمة.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {platformPillars.map((item) => (
              <Link key={item.title} href={item.href} className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-white hover:shadow-xl hover:shadow-sky-100/60 transition-all">
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-sky-600 flex items-center justify-center mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors">
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
              <h2 className="text-3xl font-black text-slate-950">أقسام المنصة الأساسية</h2>
              <p className="text-slate-500 mt-2 font-medium">كل قسم مصمم ليصبح خدمة مستقلة قابلة للاشتراك والإعلان والتحليل.</p>
            </div>
            <Link href="/join" className="inline-flex items-center justify-center gap-2 bg-slate-950 text-white px-5 py-3 rounded-xl font-black hover:bg-sky-600 transition-colors">
              انضم كمقدم خدمة
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {serviceHubs.map((hub) => (
              <Link key={hub.title} href={hub.href} className="rounded-2xl border border-slate-200 p-5 bg-white hover:border-sky-200 hover:shadow-lg transition-all">
                <hub.icon className="w-7 h-7 text-sky-600 mb-4" />
                <h3 className="font-black text-slate-900">{hub.title}</h3>
                <p className="text-sm text-slate-500 mt-2 font-semibold leading-6">{hub.meta}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-slate-950 text-white p-7 md:p-10 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-sky-400 via-amber-300 to-emerald-400" />
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <HeartHandshake className="w-9 h-9 text-emerald-300 mb-4" />
                <h3 className="text-2xl font-black mb-4">القيمة للمواطن</h3>
                <ul className="space-y-3">
                  {patientValue.map((item) => (
                    <li key={item} className="flex gap-3 text-slate-200 font-semibold leading-7">
                      <span className="mt-2 w-2 h-2 rounded-full bg-emerald-300 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Activity className="w-9 h-9 text-sky-300 mb-4" />
                <h3 className="text-2xl font-black mb-4">القيمة للقطاع الطبي</h3>
                <ul className="space-y-3">
                  {providerValue.map((item) => (
                    <li key={item} className="flex gap-3 text-slate-200 font-semibold leading-7">
                      <span className="mt-2 w-2 h-2 rounded-full bg-sky-300 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-7">
            <BadgeDollarSign className="w-9 h-9 text-amber-600 mb-4" />
            <h3 className="text-2xl font-black text-slate-950 mb-3">نموذج الربح</h3>
            <p className="text-slate-700 leading-7 font-semibold">
              اشتراكات للأطباء والعيادات والمختبرات، إعلانات للشركات الطبية والتجميلية، خدمات استشارات مميزة، ظهور مدفوع، وعمولات على الحجوزات والخدمات.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Video className="w-7 h-7 text-sky-600" />
              <h3 className="text-2xl font-black text-slate-950">الميديا الطبية والتوعية</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {educationItems.map((item) => (
                <div key={item.title} className={`rounded-2xl border p-4 ${item.tone}`}>
                  <h4 className="font-black mb-2">{item.title}</h4>
                  <p className="text-sm leading-6 font-semibold">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="w-7 h-7 text-sky-600" />
              <h3 className="text-2xl font-black text-slate-950">أفكار مستقبلية متقدمة</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {futureItems.map((item) => {
                const TypedIcon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex gap-3 items-center">
                    <TypedIcon className="w-5 h-5 text-sky-600 flex-shrink-0" />
                    <span className="font-black text-slate-800 text-sm">{item.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-black text-slate-950">خطة التنفيذ داخل المنتج</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {roadmap.map((step) => (
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
