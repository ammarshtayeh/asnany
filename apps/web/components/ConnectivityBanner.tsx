"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function ConnectivityBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    const connection = (navigator as any).connection;

    updateStatus();
    setIsSlow(Boolean(connection && (connection.saveData || ["slow-2g", "2g"].includes(connection.effectiveType))));

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    connection?.addEventListener?.("change", () => {
      setIsSlow(Boolean(connection.saveData || ["slow-2g", "2g"].includes(connection.effectiveType)));
    });

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!isOffline && !isSlow) return null;

  return (
    <div className="fixed inset-x-3 top-20 z-[60] mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-right text-sm font-bold text-amber-900 shadow-lg" dir="rtl">
      <div className="flex items-center gap-3">
        <WifiOff className="h-5 w-5 flex-shrink-0 text-amber-600" />
        <span>
          {isOffline
            ? "أنت حالياً بدون اتصال. سنعرض آخر نسخة محفوظة قدر الإمكان."
            : "الاتصال يبدو ضعيفاً، لذلك قد تحتاج النتائج ثواني إضافية للتحميل."}
        </span>
      </div>
    </div>
  );
}
