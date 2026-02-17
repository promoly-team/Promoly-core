import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";
import { calculatePriceMetrics } from "@/utils/priceMetrics";
import { calculateOpportunityScore } from "@/utils/opportunityScore";
import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://promoly-core.vercel.app";

export const metadata: Metadata = {
  title: "Menor preço hoje – Produtos abaixo da média histórica",
  description:
    "Veja os produtos com menor preço hoje e descubra quais estão realmente abaixo da média histórica.",
  alternates: {
    canonical: `${BASE_URL}/menor-preco-hoje`,
  },
};

export const revalidate = 300; // atualiza a cada 5 minutos

export default async function MenorPrecoHojePage() {
  const products = await fetchProducts({
    order: "desconto",
    limit: 30,
  });

  const enhanced = products.map((product) => {
    if ("preco_atual" in product && product.preco_atual != null) {
      const priceHistory = [
        { preco: product.preco_anterior ?? product.preco_atual },
        { preco: product.preco_atual },
      ];

      const metrics = calculatePriceMetrics(priceHistory);

      const priceDiffPercent =
        metrics.avgPrice > 0
          ? ((metrics.currentPrice - metrics.avgPrice) /
              metrics.avgPrice) *
            100
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
        isBelowAverage: priceDiffPercent < 0,
        priceDiffPercent,
      };
    }

    return product;
  });

  const belowAverage = enhanced
    .filter((p: any) => p.isBelowAverage)
    .sort(
      (a: any, b: any) =>
        (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0)
    );

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Produtos com menor preço hoje",
    itemListElement: belowAverage.slice(0, 20).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${BASE_URL}/produto/${product.slug}-${product.produto_id}`,
    })),
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-14">

        <h1 className="text-4xl font-bold mb-6 text-gray-900">
          🔥 Produtos com menor preço hoje
        </h1>

        <p className="text-gray-700 mb-12 max-w-3xl">
          Selecionamos automaticamente os produtos que estão abaixo da média histórica.
          Esses são os melhores momentos para comprar com desconto real.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          {belowAverage.map((p: any) => (
            <ProductCard
              key={p.produto_id}
              product={p}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
