import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import StructuredData from "@/components/StructuredData";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import "./globals.css";

const GOOGLE_TAG = "YFOTAGIpLnjCazAebuC9kywR7MxbP3Nt6aGosOGaDWU";

export const metadata: Metadata = {
  metadataBase: new URL("https://promoly-core.vercel.app/"),

  title: {
    default: "Promoly - Compare preços e encontre o menor valor",
    template: "%s | Promoly",
  },

  description:
    "Compare preços, veja histórico e encontre as melhores promoções atualizadas.",

  verification: {
    google: GOOGLE_TAG,
  },

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://promoly-core.vercel.app/",
    siteName: "Promoly",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large", // 🔥 CRÍTICO PARA DISCOVER
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <StructuredData />
        <Header />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
