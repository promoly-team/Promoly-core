import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  metadataBase: new URL("https://promoly.com.br"),
  title: {
    default: "Promoly - Compare preços e encontre o menor valor",
    template: "%s | Promoly",
  },
  description:
    "Compare preços, veja histórico e encontre as melhores promoções atualizadas.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://promoly-core.vercel.app/",
    siteName: "Promoly",
  },
  robots: {
    index: true,
    follow: true,
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
        <Navbar />
        {children}
      </body>
    </html>
  );
}
