import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NeYisek - Türkiye'nin Yemek Sipariş Platformu",
    template: "%s | NeYisek",
  },
  description:
    "Binlerce restorandan kapınıza teslimat. Burger, pizza, kebap, ev yemekleri ve daha fazlası. Hemen sipariş verin!",
  keywords: [
    "yemek sipariş",
    "online yemek",
    "yemek teslimat",
    "restoran",
    "burger sipariş",
    "pizza sipariş",
    "neyisek",
  ],
  authors: [{ name: "NeYisek" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "NeYisek",
    title: "NeYisek - Türkiye'nin Yemek Sipariş Platformu",
    description: "Binlerce restorandan kapınıza teslimat.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeYisek",
    description: "Türkiye'nin Yemek Sipariş Platformu",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
