import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";

const cairoFont = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://malamih.ps"),
  title: "ملامح | دليل صحة وجمال الوجه والأسنان في فلسطين",
  description: "ابحث عن أفضل أطباء الأسنان، العيون، الجلدية، التجميل، والأنف والأذن والحنجرة في فلسطين، واحجز موعدك بسهولة.",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "ar_PS",
    siteName: "ملامح",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairoFont.variable} font-sans mesh-bg bg-grid-pattern text-slate-900 min-h-screen flex flex-col pb-24 lg:pb-0`}>
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
