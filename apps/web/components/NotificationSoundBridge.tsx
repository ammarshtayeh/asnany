"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";

type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at?: string;
  data?: Record<string, unknown> | null;
};

type NotificationSoundBridgeProps = {
  href: string;
  pollMs?: number;
};

function getAudioContext() {
  const AudioContextConstructor = window.AudioContext || (window as any).webkitAudioContext;
  return AudioContextConstructor ? new AudioContextConstructor() : null;
}

function playTone(context: AudioContext) {
  const now = context.currentTime;
  const gain = context.createGain();
  const first = context.createOscillator();
  const second = context.createOscillator();

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

  first.type = "sine";
  first.frequency.setValueAtTime(880, now);
  first.frequency.exponentialRampToValueAtTime(1175, now + 0.12);

  second.type = "triangle";
  second.frequency.setValueAtTime(1320, now + 0.18);
  second.frequency.exponentialRampToValueAtTime(1568, now + 0.3);

  first.connect(gain);
  second.connect(gain);
  gain.connect(context.destination);

  first.start(now);
  first.stop(now + 0.2);
  second.start(now + 0.18);
  second.stop(now + 0.42);
}

export default function NotificationSoundBridge({ href, pollMs = 15000 }: NotificationSoundBridgeProps) {
  const router = useRouter();
  const audioContextRef = useRef<AudioContext | null>(null);
  const initializedRef = useRef(false);
  const latestIdRef = useRef<string | null>(null);
  const dismissedIdRef = useRef<string | null>(null);
  const [toast, setToast] = useState<NotificationRecord | null>(null);

  const ensureAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = getAudioContext();
    }

    const context = audioContextRef.current;
    if (context?.state === "suspended") {
      await context.resume().catch(() => null);
    }
    return context;
  }, []);

  useEffect(() => {
    const unlock = () => {
      void ensureAudio();
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      audioContextRef.current?.close().catch(() => null);
      audioContextRef.current = null;
    };
  }, [ensureAudio]);

  const notifyBrowser = useCallback(
    (item: NotificationRecord) => {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      if (document.visibilityState === "visible") return;

      const notification = new Notification(item.title, {
        body: item.body,
        tag: item.id,
        silent: false,
      });
      notification.onclick = () => {
        window.focus();
        router.push(href);
        notification.close();
      };
    },
    [href, router]
  );

  const triggerNotification = useCallback(
    async (item: NotificationRecord) => {
      setToast(item);
      notifyBrowser(item);

      const context = await ensureAudio();
      if (context && context.state === "running") {
        playTone(context);
      }

      window.setTimeout(() => {
        setToast((current) => (current?.id === item.id ? null : current));
      }, 9000);
    },
    [ensureAudio, notifyBrowser]
  );

  const poll = useCallback(async () => {
    const response = await fetch("/api/notifications?limit=5&unread=true", {
      cache: "no-store",
      credentials: "include",
    });
    if (!response.ok) return;

    const data = await response.json().catch(() => ({}));
    const notifications = Array.isArray(data?.notifications) ? (data.notifications as NotificationRecord[]) : [];
    const latest = notifications[0];

    if (!initializedRef.current) {
      latestIdRef.current = latest?.id || null;
      initializedRef.current = true;
      return;
    }

    if (!latest || latest.id === latestIdRef.current) return;

    const previousLatestId = latestIdRef.current;
    latestIdRef.current = latest.id;

    const newItems = previousLatestId ? notifications.slice(0, Math.max(notifications.findIndex((item) => item.id === previousLatestId), 0)) : [latest];
    const itemToShow = newItems[0] || latest;
    if (itemToShow.id !== dismissedIdRef.current) {
      await triggerNotification(itemToShow);
    }
  }, [triggerNotification]);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await poll().catch(() => null);
    };

    void tick();
    const interval = window.setInterval(tick, pollMs);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [poll, pollMs]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[70] w-[min(360px,calc(100vw-2rem))]" dir="rtl" aria-live="polite">
      <div className="rounded-2xl border border-sky-200 bg-white p-4 text-right shadow-2xl shadow-slate-950/15">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Bell className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={() => router.push(href)}
            className="min-w-0 flex-1 text-right"
          >
            <p className="text-xs font-black text-sky-600">إشعار جديد</p>
            <p className="mt-1 truncate text-sm font-black text-slate-950">{toast.title}</p>
            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{toast.body}</p>
          </button>
          <button
            type="button"
            onClick={() => {
              dismissedIdRef.current = toast.id;
              setToast(null);
            }}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="إغلاق التنبيه"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
