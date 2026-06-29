import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { fetchProducts } from "@/lib/api";
import { calculatePriceMetrics } from "@/utils/priceMetrics";
import { calculateOpportunityScore } from "@/utils/opportunityScore";
import type { ProductCardData } from "@/types";
import type { Metadata } from "next";

/* =====================================================
   🔥 METADATA COMPLETA
===================================================== */

export const metadata: Metadata = {
  title: "PromoLy – Compare preços e encontre o menor valor",
  description:
    "Compare preços, acompanhe o histórico e descubra quando um produto está realmente abaixo da média. PromoLy monitora milhares de ofertas diariamente.",
  keywords: [
    "menor preço",
    "comparador de preços",
    "histórico de preço",
    "promoções online",
    "ofertas hoje",
    "descontos reais",
  ],
  authors: [{ name: "PromoLy" }],
  creator: "PromoLy",
  publisher: "PromoLy",

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://promoly-core.vercel.app",
    siteName: "PromoLy",
    title: "PromoLy – Compare preços e encontre o menor valor",
    description:
      "Acompanhe histórico de preços e descubra oportunidades reais antes de comprar.",
    images: [
      {
        url: "https://promoly-core.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "PromoLy – Compare preços antes de comprar",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PromoLy – Compare preços e encontre o menor valor",
    description: "Descubra quando um produto está realmente barato.",
    images: ["https://promoly-core.vercel.app/og-image.png"],
  },

  alternates: {
    canonical: "https://promoly-core.vercel.app",
  },

  robots: {
    index: true,
    follow: true,
  },
};

/* =====================================================
   🔥 HOMEPAGE
===================================================== */

export const revalidate = 60;

export default async function HomePage() {
  const products: ProductCardData[] = await fetchProducts({
    order: "desconto",
    limit: 20,
  });

  const unique = Array.from(
    new Map(products.map((p) => [p.produto_id, p])).values(),
  );

  const enhanced = unique.map((product) => {
    if ("preco_atual" in product && product.preco_atual != null) {
      const priceHistory = [
        { preco: product.preco_anterior ?? product.preco_atual },
        { preco: product.preco_atual },
      ];

      const metrics = calculatePriceMetrics(priceHistory);

      const priceDiffPercent =
        metrics.avgPrice > 0
          ? ((metrics.currentPrice - metrics.avgPrice) / metrics.avgPrice) * 100
          : 0;

      const trend =
        priceDiffPercent < -0.5
          ? "queda"
          : priceDiffPercent > 0.5
            ? "alta"
            : "estabilidade";

      const opportunityScore = calculateOpportunityScore({
        priceDiffPercent,
        descontoPct: product.desconto_pct ?? 0,
        trend,
        historyLength: priceHistory.length,
      });

      return {
        ...product,
        opportunityScore,
      };
    }

    return product;
  });

  const ranked = enhanced.sort(
    (a, b) =>
      ("opportunityScore" in b ? (b.opportunityScore ?? 0) : 0) -
      ("opportunityScore" in a ? (a.opportunityScore ?? 0) : 0),
  );

  const categories = [
    { label: "Eletrônicos", slug: "eletronicos" },
    { label: "Casa", slug: "casa" },
    { label: "Pet", slug: "pet" },
    { label: "Games", slug: "games" },
    { label: "Fitness", slug: "fitness" },
    { label: "Automotivo", slug: "automotivo" },
  ];

  return (
    <>
      <div className="bg-[#000D34] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* HERO */}

          <section className="text-center mb-20">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#9AEBA3] mb-6">
              Compare preços e encontre o{" "}
              <span className="text-[#F5F138]">menor valor</span> antes de
              comprar
            </h1>

            <p className="text-[#45C4B0] max-w-2xl mx-auto text-lg mb-8">
              Acompanhe o histórico real de preços e descubra quando um produto
              está abaixo da média histórica.
            </p>

            <Link
              href="/menor-preco-hoje"
              className="inline-block bg-[#45C4B0] hover:bg-[#9AEBA3] text-[#000D34] font-semibold px-8 py-3 rounded-xl shadow-medium transition"
            >
              🔥 Ver melhores ofertas
            </Link>
          </section>

          {/* TOP OPORTUNIDADES */}

          <section className="mb-24">
            <h2 className="text-3xl font-bold text-[#9AEBA3] mb-10">
              🔥 Top oportunidades de hoje
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-8">
              {ranked.slice(0, 3).map((p) => (
                <ProductCard key={`${p.produto_id}-top`} product={p} />
              ))}
            </div>
          </section>

          {/* CATEGORIAS */}

          <section className="mb-24">
            <h2 className="text-2xl font-bold text-[#9AEBA3] mb-8">
              Navegue por categorias
            </h2>

            <div className="flex flex-wrap gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  className="px-6 py-2.5 bg-[#DAFDBA] text-[#000D34] rounded-full text-sm font-semibold hover:bg-[#45C4B0] transition shadow-soft"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </section>

          {/* GRID */}

          <section>
            <h2 className="text-3xl font-bold text-[#9AEBA3] mb-10">
              Ofertas em destaque
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {ranked.map((p) => (
                <ProductCard key={`${p.produto_id}-grid`} product={p} />
              ))}
            </div>
          </section>

          {/* SEO TEXT */}

          <section className="mt-24 text-[#45C4B0] max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 text-[#9AEBA3]">
              Como encontrar o menor preço online?
            </h2>
            <p>
              O PromoLy é um comparador de preços que analisa o histórico de
              valores e identifica oportunidades reais. Antes de comprar,
              verifique se o preço atual está abaixo da média histórica.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
