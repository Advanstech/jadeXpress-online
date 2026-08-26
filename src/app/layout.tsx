import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "JadeXpress — Vitamins, Supplements & Beauty Care",
  description:
    "JadeXpress — premium vitamins, supplements and cosmetics delivered across Ghana and worldwide. Shop The Vitamin Shop & Beauty Care collection online.",
  authors: [{ name: "JadeXpress Enterprise" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "JadeXpress — Vitamins, Supplements & Beauty Care",
    description:
      "Premium vitamins, supplements and cosmetics delivered across Ghana and worldwide.",
    type: "website",
  },
  other: {
    build: "concierge-v1",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f4d38",
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
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
