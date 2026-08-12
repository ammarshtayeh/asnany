"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

type WebPushOptInProps = {
  patientPhone: string;
};

export default function WebPushOptIn({ patientPhone }: WebPushOptInProps) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );
  }, []);

  const enable = async () => {
    const cleanPhone = patientPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 9) return;

    setLoading(true);
    setMessage("");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("لم يتم منح إذن الإشعارات.");
        return;
      }

      const keyRes = await fetch("/api/notifications/vapid-public-key");
      const keyData = await keyRes.json();
      if (!keyData.enabled || !keyData.publicKey) {
        setMessage("إشعارات المتصفح غير مفعّلة على السيرفر حالياً.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });

      const json = subscription.toJSON();
      const res = await fetch("/api/notifications/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "patient",
          patient_phone: cleanPhone,
          platform: "web",
          web_push: {
            endpoint: json.endpoint,
            keys: json.keys,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر تفعيل الإشعارات");

      setEnabled(true);
      setMessage("تم تفعيل تنبيهات تحديث الحجز على هذا المتصفح.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر تفعيل الإشعارات");
    } finally {
      setLoading(false);
    }
  };

  if (!supported || patientPhone.replace(/[^0-9]/g, "").length < 9) return null;

  return (
    <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          {enabled ? <Bell className="mt-0.5 h-5 w-5 text-primary" /> : <BellOff className="mt-0.5 h-5 w-5 text-primary" />}
          <div>
            <p className="text-sm font-black text-slate-900">تنبيهات تحديث الحجز</p>
            <p className="mt-1 text-xs font-semibold leading-6 text-slate-600">
              فعّل إشعارات المتصفح لتصلك رسالة عند تأكيد أو إلغاء موعدك.
            </p>
          </div>
        </div>
        {!enabled ? (
          <button
            type="button"
            onClick={() => void enable()}
            disabled={loading}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-black text-white disabled:opacity-60"
          >
            {loading ? "جاري التفعيل..." : "تفعيل الإشعارات"}
          </button>
        ) : null}
      </div>
      {message ? <p className="mt-3 text-xs font-bold text-slate-600">{message}</p> : null}
    </div>
  );
}
