"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-9795267028504854";
const CONSENT_KEY = "malamih_cookie_consent";
const CONSENT_EVENT = "malamih-cookie-consent";

function hasAdConsent() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

function isAdFreePath(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/doctor") ||
    pathname.startsWith("/booking") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/doctors/register") ||
    pathname.startsWith("/doctors/") ||
    pathname.startsWith("/doctors/search") ||
    pathname === "/doctors/search" ||
    pathname.startsWith("/beauty") ||
    pathname.startsWith("/labs") ||
    pathname.startsWith("/consultations") ||
    pathname.startsWith("/discount-card") ||
    pathname.startsWith("/trust")
  );
}

export default function GoogleAdSense() {
  const pathname = usePathname() || "";
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(hasAdConsent());

    const onConsent = () => setEnabled(true);
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  if (!ADSENSE_CLIENT || !enabled || isAdFreePath(pathname)) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
