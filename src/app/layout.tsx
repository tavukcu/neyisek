import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import MobileBottomNav from '@/components/MobileBottomNav'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

// Sayfa meta verileri
export const metadata: Metadata = {
  title: 'Neyisek.com - Ahmetli\'nin Lezzetli Yemek Platformu',
  description: 'Neyisek.com ile restoranlardan lezzetli yemekleri hızlıca sipariş edin. AI destekli öneri sistemiyle kişisel menüler, kapınıza gelen tatlar.',
  robots: 'index, follow',
  keywords: 'yemek siparişi, online yemek, Ahmetli yemek, Manisa yemek siparişi, hızlı teslimat, AI menü önerisi',
  authors: [{ name: 'Neyisek.com' }],
  creator: 'Neyisek.com',
  publisher: 'Neyisek.com',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://www.neyisek.com',
    title: 'Neyisek.com - Lezzetli Yemekler Kapınızda',
    description: 'AI destekli yemek öneri sistemiyle kişiselleştirilmiş menüler. Ahmetli\'nin yeni nesil sipariş platformu.',
    siteName: 'Neyisek.com',
    images: [
      {
        url: 'https://www.neyisek.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'Neyisek.com - Yemek Sipariş Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neyisek.com - Lezzetli Yemekler Kapınızda',
    description: 'AI destekli yemek öneri sistemiyle kişiselleştirilmiş menüler. Ahmetli\'nin yeni nesil sipariş platformu.',
    images: ['https://www.neyisek.com/logo.png'],
    creator: '@neyisekcom',
    site: '@neyisekcom',
  },
  verification: {
    google: 'google-site-verification-code-here',
  },
  alternates: {
    canonical: 'https://www.neyisek.com',
    languages: {
      'tr-TR': 'https://www.neyisek.com/tr',
      'en-US': 'https://www.neyisek.com/en',
    },
  },
}

// Ana layout komponenti
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className="scroll-smooth">
      <head>
        {/* Viewport & PWA/Mobile meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#4caf50" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        {/* Favicon ve diğer meta taglar */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#4caf50" />
        
        {/* Google Analytics 4 - Enhanced Ecommerce */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-N5Q8RB9N9V"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              gtag('config', 'G-N5Q8RB9N9V', {
                send_page_view: true,
                enhanced_ecommerce: true,
                currency: 'TRY',
                country: 'TR',
                language: 'tr',
                custom_map: {
                  'custom_parameter_1': 'restaurant_id',
                  'custom_parameter_2': 'user_type'
                }
              });
              
              // Ecommerce events için özel konfigürasyon
              gtag('config', 'G-N5Q8RB9N9V', {
                'app_name': 'Neyisek.com',
                'app_version': '1.0.0'
              });
            `
          }}
        />
        
        {/* Enhanced Structured Data - LocalBusiness + FoodEstablishment */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["LocalBusiness", "FoodEstablishment"],
              "name": "Neyisek.com",
              "alternateName": "Ne Yisek - Online Yemek Sipariş Platformu",
              "description": "AI destekli yemek öneri sistemiyle kişiselleştirilmiş menüler. Ahmetli'nin yeni nesil sipariş platformu.",
              "image": [
                "https://www.neyisek.com/logo.png",
                "https://www.neyisek.com/NY-01.png"
              ],
              "@id": "https://www.neyisek.com",
              "url": "https://www.neyisek.com",
              "telephone": "+90-532-465-78-45",
              "email": "info@neyisek.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Hükümet Cd. No:47, Aliteyli Mah.",
                "addressLocality": "Ahmetli",
                "addressRegion": "Manisa",
                "postalCode": "45450",
                "addressCountry": "TR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 38.4946,
                "longitude": 27.9264
              },
              "openingHours": "Mo-Su 00:00-23:59",
              "priceRange": "₺₺",
              "servesCuisine": ["Türk Mutfağı", "Fast Food", "Ev Yemekleri", "Pizza", "Döner"],
              "paymentAccepted": ["Nakit", "Kredi Kartı", "Banka Kartı", "Online Ödeme"],
              "currenciesAccepted": "TRY",
              "hasMenu": "https://www.neyisek.com/menu",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "245",
                "bestRating": "5",
                "worstRating": "1"
              },
              "review": [
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Müşteri"
                  },
                  "reviewBody": "Hızlı teslimat ve lezzetli yemekler. AI önerileri çok başarılı!"
                }
              ],
              "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                  "@type": "GeoCoordinates",
                  "latitude": 38.4946,
                  "longitude": 27.9264
                },
                "geoRadius": "15000"
              },
              "areaServed": ["Ahmetli", "Manisa Merkez", "Akhisar", "Salihli"],
              "foundingDate": "2024",
              "slogan": "Favori yemeklerinizi tek tıkla sipariş edin",
              "logo": "https://www.neyisek.com/logo.png",
              "sameAs": [
                "https://www.instagram.com/neyisekcom",
                "https://www.facebook.com/neyisekcom",
                "https://x.com/neyisekcom",
                "https://www.linkedin.com/company/neyisekcom"
              ],
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+90-532-465-78-45",
                  "contactType": "Müşteri Hizmetleri",
                  "availableLanguage": "Turkish",
                  "areaServed": "TR",
                  "hoursAvailable": "Mo-Su 00:00-23:59"
                }
              ],
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Ücretsiz Teslimat",
                  "description": "50 TL üzeri siparişlerde ücretsiz teslimat",
                  "category": "Teslimat"
                },
                {
                  "@type": "Offer", 
                  "name": "İlk Sipariş İndirimi",
                  "description": "İlk siparişinizde %20 indirim",
                  "category": "İndirim"
                }
              ]
            })
          }}
        />
      </head>
      <body className={`antialiased ${inter.className}`}>
        {children}
        <MobileBottomNav />
      </body>
    </html>
  )
} 