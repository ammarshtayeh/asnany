import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_Arabic } from "next/font/google";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-sans-arabic",
});

export const metadata: Metadata = {
  title: "أسناني | دليل أطباء الأسنان في فلسطين",
  description: "ابحث عن أفضل أطباء الأسنان في فلسطين، تصفح التخصصات، واحجز موعدك بسهولة.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
};

import Navbar from "@/components/Navbar";
import AIChatbot from "@/components/AIChatbot";
import SiteFooter from "@/components/SiteFooter";
import PWARegister from "@/components/PWARegister";
import ConnectivityBanner from "@/components/ConnectivityBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${notoSansArabic.variable} font-sans bg-gray-50 text-slate-900 min-h-screen flex flex-col pt-20 pb-24 lg:pb-0 md:pt-20`}>
        <Navbar />
        <ConnectivityBanner />
        {children}
        <SiteFooter />
        <AIChatbot />
        <PWARegister />
      </body>
    </html>
  );
}
