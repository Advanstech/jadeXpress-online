import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL("https://jadexpressgh.com"),
  title: {
    default: "JadeXpress — The Vitamin Shop & Beauty Care | Ghana & Worldwide",
    template: "%s | JadeXpress",
  },
  description:
    "Welcome to JadeXpress — Ghana's premier health, wellness, and beauty store. Shop 100% genuine vitamins, clinical-grade supplements, herbal botanicals, dermatological skincare, and wellness essentials delivered swiftly across Accra, Ghana, and worldwide.",
  keywords: [
    "JadeXpress",
    "The Vitamin Shop Ghana",
    "Vitamins and Minerals",
    "Supplements and Wellness",
    "Skincare and Lotions",
    "Beauty and Skin",
    "Herbal and Botanicals",
    "Digestive Health Probiotics",
    "Omega 3 Fish Oils",
    "Protein and Sports Nutrition",
    "Immune Support",
    "Weight Management",
    "NOW Foods Ghana",
    "21st Century Supplements",
    "Dzorwulu Wellness Store",
    "Accra Health Store",
    "Genuine supplements Ghana",
  ],
  authors: [{ name: "JadeXpress Enterprise", url: "https://jadexpressgh.com" }],
  creator: "JadeXpress Enterprise",
  publisher: "JadeXpress Enterprise",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://jadexpressgh.com",
    title: "JadeXpress — The Vitamin Shop & Beauty Care",
    description:
      "Welcome to JadeXpress. Explore our curated selection of 500+ premium vitamins, clinical supplements, luxury skincare, and wellness remedies delivered to your doorstep.",
    siteName: "JadeXpress",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "JadeXpress — The Vitamin Shop & Beauty Care",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JadeXpress — The Vitamin Shop & Beauty Care",
    description:
      "Welcome to JadeXpress. Genuine vitamins, clinical-strength supplements, and beauty essentials delivered across Ghana and worldwide.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    build: "concierge-v2",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f4d38",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  name: "JadeXpress",
  legalName: SITE.legalName,
  alternateName: "JadeXpress The Vitamin Shop & Beauty Care",
  description:
    "Ghana's premier destination for genuine vitamins, supplements, organic cosmetics, and wellness therapeutics.",
  url: "https://jadexpressgh.com",
  telephone: SITE.phone,
  email: SITE.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.addressLine,
    addressLocality: "Dzorwulu, Accra",
    addressRegion: "Greater Accra",
    addressCountry: "GH",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE.latitude,
    longitude: SITE.longitude,
  },
  priceRange: "$$",
  currenciesAccepted: "GHS, USD",
  paymentAccepted: "Mobile Money (MTN, Telecel, AT), Debit Cards, Credit Cards, Cash",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "20:00",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
