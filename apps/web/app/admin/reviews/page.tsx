"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, Search, Calendar, User } from "lucide-react";
import { Review } from "@/lib/types";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews/list");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/reviews/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_approved: !currentStatus }),
      });
      if (res.ok) {
        setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: !currentStatus } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReviews = reviews.filter(rev => 
    rev.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rev.comment || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-500 fill-current" /> إدارة التقييمات والمراجعات
          </h1>
          <p className="text-slate-500 mt-1">مراجعة وتوثيق واعتماد تقييمات المرضى لأطباء الأسنان</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="البحث باسم المريض أو محتوى التقييم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-right font-medium text-sm"
        />
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <p className="p-12 text-center text-slate-400 font-medium">لم يتم العثور على أي تقييمات مطابخة حالياً.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div key={rev.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{rev.patient_name}</h4>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(rev.created_at || "").toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < rev.rating ? "fill-current" : "text-slate-200"}`} />
                    ))}
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed font-medium mb-6">
                  {rev.comment}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className="text-xs text-slate-400 font-bold">تقييم عيادة الطبيب</span>
                
                <button
                  onClick={() => handleToggleApprove(rev.id, rev.is_approved)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${rev.is_approved ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}
                >
                  {rev.is_approved ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> معتمد (إخفاء)
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> قيد المراجعة (اعتماد)
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
