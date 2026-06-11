import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";

const cairoFont = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "ملامح | دليل صحة وجمال الوجه والأسنان في فلسطين",
  description: "ابحث عن أفضل أطباء الأسنان، العيون، الجلدية، التجميل، والأنف والأذن والحنجرة في فلسطين، واحجز موعدك بسهولة.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
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
      <body className={`${cairoFont.variable} font-sans mesh-bg bg-grid-pattern text-slate-900 min-h-screen flex flex-col pt-20 pb-24 lg:pb-0 md:pt-20`}>
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
