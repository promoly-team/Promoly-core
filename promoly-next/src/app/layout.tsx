import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}



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
    url: "https://promoly.com.br",
    siteName: "Promoly",
  },
  robots: {
    index: true,
    follow: true,
  },
};
