import ProductDetails from "./ProductDetails";
import ProductHistory from "./ProductHistory";
import SimilarProducts from "./SimilarProducts";
import ProductPriceAnalysis from "./ProductPriceAnalysis";
import JsonLd from "./JsonLd";

import { buildProductAnalytics } from "../utils/productAnalytics";
import { getPurchaseDecision } from "../utils/productDecision";
import { buildProductSchemas } from "../utils/productSchemas";

type Props = {
  productData: any;
  priceHistory: { preco: number; data: number }[];
  slug: string;
  baseUrl: string;
};

export default function ProductView({
  productData,
  priceHistory,
  slug,
  baseUrl,
}: Props) {
  const produto = productData.produto;

  const analytics = buildProductAnalytics(priceHistory);
  const decision = getPurchaseDecision(analytics.metrics.priceDiffPercent);

  const { productSchema, faqSchema, breadcrumbSchema } = buildProductSchemas({
    produto,
    slug,
    baseUrl,
    currentPrice: analytics.metrics.currentPrice,
    decisionDescription: decision.description,
  });

  return (
    <div className="bg-[#000D34] min-h-screen">
      <JsonLd data={productSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-[2fr_1fr] gap-12">
        {/* ================= CONTEÚDO PRINCIPAL ================= */}
        <section className="space-y-14">
          {/* ================= PRODUTO ================= */}
          <div className="bg-[#0a154a] rounded-3xl border border-[#45C4B0] p-8 shadow-lg">
            <ProductDetails product={produto} />
          </div>

          {/* ================= ANÁLISE ================= */}
          <div className="bg-[#0a154a] rounded-3xl border border-[#45C4B0] p-8 shadow-lg">
            <ProductPriceAnalysis analytics={analytics} decision={decision} />
          </div>

          {/* ================= INDICADORES ================= */}
          <div className="bg-[#0a154a] rounded-3xl border border-[#45C4B0] p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-8 text-[#9AEBA3]">
              📊 Indicadores de preço
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* MENOR PREÇO */}
              <div className="bg-[#000D34] rounded-2xl p-6 border border-[#45C4B0]">
                <p className="text-sm text-[#45C4B0] font-semibold mb-2">
                  Menor preço histórico
                </p>
                <p className="text-2xl font-extrabold text-[#F5F138]">
                  {analytics.metrics.minPrice.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>

              {/* MAIOR PREÇO */}
              <div className="bg-[#000D34] rounded-2xl p-6 border border-[#45C4B0]">
                <p className="text-sm text-[#45C4B0] font-semibold mb-2">
                  Maior preço histórico
                </p>
                <p className="text-2xl font-extrabold text-[#9AEBA3]">
                  {analytics.metrics.maxPrice.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>

              {/* DECISÃO */}
              <div className="bg-[#000D34] rounded-2xl p-6 border border-[#45C4B0]">
                <p className="text-sm text-[#45C4B0] font-semibold mb-2">
                  Comparação com a média
                </p>
                <p className="text-xl font-bold text-[#F5F138]">
                  {decision.title}
                </p>
              </div>
            </div>
          </div>

          {/* ================= HISTÓRICO ================= */}
          <div className="bg-[#0a154a] rounded-3xl border border-[#45C4B0] p-8 shadow-lg">
            <ProductHistory
              data={priceHistory}
              lowerDomain={analytics.metrics.lowerDomain}
              upperDomain={analytics.metrics.upperDomain}
            />
          </div>
        </section>

        {/* ================= SIDEBAR ================= */}
        <aside className="mt-12 lg:mt-0">
          <div className="lg:sticky lg:top-28 space-y-8">
            <div className="bg-[#0a154a] rounded-3xl border border-[#45C4B0] p-6 shadow-lg">
              <SimilarProducts products={productData.similares} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
