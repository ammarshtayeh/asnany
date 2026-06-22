import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";

const cairoFont = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-cairo",
});

function siteBaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.malamih.ps").replace(/\/$/, "");
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
}

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl()),
  title: "ملامح | دليل صحة وجمال الوجه والأسنان في فلسطين",
  description: "ابحث عن أفضل أطباء الأسنان، العيون، الجلدية، التجميل، والأنف والأذن والحنجرة في فلسطين، واحجز موعدك بسهولة.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "ar_PS",
    siteName: "ملامح",
    url: siteBaseUrl(),
    title: "ملامح | دليل صحة وجمال الوجه في فلسطين",
    description: "ابحث عن أطباء موثقين، احجز موعدك، وتابع العروض الطبية في فلسطين.",
    images: [{ url: "/brand/og-share.png", width: 1200, height: 630, alt: "ملامح — دليل صحة وجمال الوجه في فلسطين" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ملامح | دليل صحة وجمال الوجه في فلسطين",
    description: "ابحث عن أطباء موثقين، احجز موعدك، وتابع العروض الطبية في فلسطين.",
    images: ["/brand/og-share.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1628",
};

import Navbar from "@/components/Navbar";
import NewsTicker from "@/components/NewsTicker";
import AIChatbot from "@/components/AIChatbot";
import SiteFooter from "@/components/SiteFooter";
import PWARegister from "@/components/PWARegister";
import ConnectivityBanner from "@/components/ConnectivityBanner";
import CookieBanner from "@/components/CookieBanner";
import SiteBodyWrapper from "@/components/SiteBodyWrapper";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairoFont.variable} font-sans aurora-bg bg-grid-pattern text-slate-900 min-h-screen flex flex-col pb-28 lg:pb-0`}>
        <GoogleAnalytics />
        <Navbar />
        <NewsTicker />
        <ConnectivityBanner />
        <SiteBodyWrapper>
          {children}
        </SiteBodyWrapper>
        <SiteFooter />
        <AIChatbot />
        <CookieBanner />
        <PWARegister />
      </body>
    </html>
  );
}
