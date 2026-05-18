"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, AlertCircle, Calendar } from "lucide-react";
import Link from "next/link";

interface Message {
  sender: "bot" | "user";
  text: string;
  isOfferCTA?: boolean;
  isBookingCTA?: boolean;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "مرحباً بك! أنا مساعد أسناني الذكي 🦷🤖. كيف يمكنني مساعدتك اليوم؟\n\nيمكنك إخباري بموقع الألم أو الاستفسار عن العلاجات والتقويم، وسأقوم بتوجيهك لأفضل أطباء الأسنان في فلسطين!"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleQuickOption = (text: string) => {
    handleSendMessage(text);
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking and response (100% Free Local Intelligent Matching)
    setTimeout(() => {
      setIsTyping(false);
      let botResponse = "";
      let isOfferCTA = false;
      let isBookingCTA = false;

      const cleanText = textToSend.toLowerCase();

      if (cleanText.includes("ألم") || cleanText.includes("وجع") || cleanText.includes("عصب") || cleanText.includes("بوجعني") || cleanText.includes("موجوع")) {
        botResponse = "شفاك الله وعافاك! 😔 ألم الأسنان الحاد أو النابض (خصوصاً عند النوم أو شرب البارد والساخن) عادة ما يكون مؤشراً على التهاب عصب السن.\n\nأنصحك بحجز موعد فوري مع أخصائي 'علاج عصب' أو 'حشو جذور' لتفادي تفاقم الالتهاب.";
        isBookingCTA = true;
      } else if (cleanText.includes("تقويم") || cleanText.includes("اعوجاج") || cleanText.includes("فراغ") || cleanText.includes("الفك")) {
        botResponse = "تقويم الأسنان هو الحل المثالي لتنسيق اصطفاف الأسنان ومعالجة مشاكل الإطباق والفكين.\n\nننصحك بحجز موعد استشارة مع 'أخصائي تقويم أسنان' لعمل فحص سريري وأخذ صور الأشعة اللازمة لتحديد الخطة المناسبة (سواء تقويم معدني أو شفاف).";
        isBookingCTA = true;
      } else if (cleanText.includes("تبييض") || cleanText.includes("تجميل") || cleanText.includes("ابتسامة") || cleanText.includes("فينير") || cleanText.includes("زيركون")) {
        botResponse = "للحصول على ابتسامة ناصعة وجذابة، تتوفر لدينا تقنيات رائعة مثل التبييض المنزلي، أو تبييض الليزر في العيادة، أو الفينير (عدسات الأسنان).\n\nبشرى سارة! تتوفر حالياً عروض وخصومات حصرية تصل لـ 30% على خدمات التبييض والتجميل في صفحة العروض لدينا.";
        isOfferCTA = true;
      } else if (cleanText.includes("زراعة") || cleanText.includes("مفقود") || cleanText.includes("زرع")) {
        botResponse = "زراعة الأسنان هي الحل الأكثر متانة وأماناً لتعويض الأسنان المفقودة، حيث يتم وضع جذر تيتانيوم صلب يلتحم مع الفك.\n\nننصحك بزيارة أخصائي 'زراعة وجراحة الفكين' لتقييم سماكة عظم الفك وتحديد موعد العملية الميسرة.";
        isBookingCTA = true;
      } else if (cleanText.includes("أطفال") || cleanText.includes("ابني") || cleanText.includes("بنتي") || cleanText.includes("طفل")) {
        botResponse = "العناية بأسنان الأطفال منذ الصغر ضرورية جداً لحماية الأسنان اللبنية وضمان نمو الأسنان الدائمة بشكل سليم.\n\nلدينا أطباء أسنان مختصون بلطف شديد في التعامل مع الأطفال وجعل الزيارة ممتعة وخالية من الخوف.";
        isBookingCTA = true;
      } else if (cleanText.includes("مرحبا") || cleanText.includes("سلام") || cleanText.includes("هلا")) {
        botResponse = "أهلاً وسهلاً بك! أنا مساعدك السني الذكي 🦷. يمكنك الاستفسار عن أي مشكلة في أسنانك وسأقترح عليك التخصص المناسب وأرشدك لأقرب الأطباء في فلسطين.";
      } else {
        botResponse = "شكراً لاستفسارك! كمساعد طبيب أسنان ذكي، أنصحك دائماً بالفحص المباشر في العيادة للحصول على تشخيص دقيق 100%.\n\nيمكنك استخدام محرك البحث الذكي في منصتنا لتحديد مدينتك وحجز موعد مع الطبيب الأقرب إليك بسهولة فائقة!";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botResponse,
          isOfferCTA,
          isBookingCTA
        }
      ]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]" dir="rtl">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 md:p-5 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center gap-2 group relative border border-slate-700/50"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[9px] font-black text-white items-center justify-center">AI</span>
          </span>
          <MessageSquare className="w-6 h-6 md:w-7 h-7" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap font-black text-sm">
            طبيبك الذكي
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] md:w-[400px] h-[550px] bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-slate-900 p-5 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-full bg-primary/20 blur-xl pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Sparkles className="w-6 h-6 text-yellow-400 fill-current animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-base flex items-center gap-1.5">أسناني AI <span className="text-[10px] bg-primary px-2 py-0.5 rounded-full text-white font-bold animate-pulse">مساعد مجاني</span></h4>
                <p className="text-xs text-slate-300 font-medium">مساعد التشخيص وتوجيه الحجز الفوري</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === "user" ? "items-start" : "items-end"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm leading-relaxed font-medium whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-slate-900 text-white rounded-tl-none shadow-md shadow-slate-900/10 text-right"
                      : "bg-white text-slate-800 rounded-tr-none border border-slate-100 shadow-sm text-right"
                  }`}
                >
                  {msg.text}

                  {/* Dynamic CTAs based on locally analyzed diagnosis */}
                  {msg.isOfferCTA && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                      <Link
                        href="/offers"
                        onClick={() => setIsOpen(false)}
                        className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> استعراض عروض التجميل
                      </Link>
                    </div>
                  )}

                  {msg.isBookingCTA && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                      <Link
                        href="/#booking-form"
                        onClick={() => {
                          setIsOpen(false);
                          setTimeout(() => {
                            document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
                          }, 300);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Calendar className="w-3.5 h-3.5" /> البحث وحجز موعد الآن
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-end">
                <div className="bg-white border border-slate-100 p-4 rounded-[1.5rem] rounded-tr-none flex items-center gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Option Suggestions */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
            <button
              onClick={() => handleQuickOption("عندي ألم شديد في السن")}
              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            >
              وجع عصب 💥
            </button>
            <button
              onClick={() => handleQuickOption("أبحث عن عروض تجميل وتبييض الأسنان")}
              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            >
              تبييض وتجميل ✨
            </button>
            <button
              onClick={() => handleQuickOption("كيف أختار طبيب لتقويم الأسنان؟")}
              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            >
              استفسار تقويم 🦷
            </button>
            <button
              onClick={() => handleQuickOption("علاج أسنان الأطفال")}
              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            >
              أسنان الأطفال 🧸
            </button>
          </div>

          {/* Input Panel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-4 bg-white border-t border-slate-100 flex gap-3 items-center"
          >
            <input
              type="text"
              placeholder="اكتب استفسارك الطبي هنا..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="w-11 h-11 rounded-2xl bg-slate-900 hover:bg-primary text-white flex items-center justify-center transition-all shadow-md"
            >
              <Send className="w-5 h-5 -rotate-90" />
            </button>
          </form>

          {/* Legal Notice */}
          <div className="bg-slate-100 px-5 py-2 text-[10px] text-slate-400 font-bold flex items-center gap-1.5 border-t border-slate-150">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>تشخيص المساعد هو تشخيص إرشادي فقط ولا يغني عن زيارة طبيب الأسنان المختص.</span>
          </div>
        </div>
      )}
    </div>
  );
}
