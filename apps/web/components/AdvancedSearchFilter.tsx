"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, XCircle, Search, Loader2 } from "lucide-react";

export default function AdvancedSearchFilter({
  onChange,
}: {
  onChange: (filters: Record<string, any>) => void;
}) {
  const [city, setCity] = useState("");
  const [isOpen, setIsOpen] = useState<"any" | "open" | "closed">("any");
  const [isActive, setIsActive] = useState<"any" | "active" | "inactive">("any");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [geoError, setGeoError] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos(pos),
      (err) => setGeoError(err.message),
    );
  }, []);

  const handleApplyFilter = () => {
    setLoading(true);
    const filters: any = {
      city: city.trim(),
      status: isOpen,
      active: isActive,
      keyword: keyword.trim(),
    };
    if (userPos) filters.myLocation = userPos.coords;
    onChange(filters);
    setTimeout(() => setLoading(false), 400); // UI visual feedback
  };

  useEffect(() => {
    handleApplyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, isOpen, isActive, keyword, userPos]);

  return (
    <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-5 md:p-6 border border-slate-200">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* كلمة مفتاحية */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="ابحث بالاسم أو التخصص..."
            className="w-full border border-slate-300 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/30 transition text-sm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>

        {/* المدينة */}
        <div className="relative">
          <input
            type="text"
            placeholder="المدينة (مثال: رام الله)"
            className="border border-slate-300 rounded-xl py-3 px-4 w-full md:w-44 focus:outline-none focus:ring-2 focus:ring-primary/30 transition text-sm"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        {/* فتح/إغلاق */}
        <select
          className="border border-slate-300 rounded-xl py-3 px-4 w-full md:w-36 focus:outline-none focus:ring-2 focus:ring-primary/30 transition text-sm bg-white"
          value={isOpen}
          onChange={(e) => setIsOpen(e.target.value as any)}
        >
          <option value="any">أوقات العمل</option>
          <option value="open">مفتوح الآن</option>
          <option value="closed">مغلق</option>
        </select>

        {/* نشط/غير نشط */}
        <select
          className="border border-slate-300 rounded-xl py-3 px-4 w-full md:w-36 focus:outline-none focus:ring-2 focus:ring-primary/30 transition text-sm bg-white"
          value={isActive}
          onChange={(e) => setIsActive(e.target.value as any)}
        >
          <option value="any">حالة الحساب</option>
          <option value="active">نشط وموثق</option>
          <option value="inactive">غير نشط</option>
        </select>

        {/* زر البحث المتقدم */}
        <button
          className="flex justify-center items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 w-full md:w-auto"
          disabled={loading}
          onClick={handleApplyFilter}
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5 hidden" />
          )}
          تحديث البحث
        </button>
      </div>

      {geoError && (
        <p className="mt-4 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg inline-flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {geoError} (يرجى تفعيل الموقع الجغرافي لترتيب النتائج الأقرب إليك)
        </p>
      )}
    </section>
  );
}
