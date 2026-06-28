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
    <div className="bg-base min-h-screen">
      <JsonLd data={productSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 grid lg:grid-cols-[2fr_1fr] gap-8 lg:gap-14">
        {/* ================= CONTEÚDO PRINCIPAL ================= */}
        <section className="space-y-6 sm:space-y-8">
          {/* PRODUTO */}
          <div className="bg-panel rounded-2xl sm:rounded-3xl shadow-elevated border border-line p-4 sm:p-8">
            <ProductDetails product={produto} />
          </div>

          {/* ANÁLISE */}
          <div className="bg-panel rounded-2xl sm:rounded-3xl shadow-elevated border border-line p-4 sm:p-8">
            <ProductPriceAnalysis analytics={analytics} decision={decision} />
          </div>

          {/* INDICADORES */}
          <div className="bg-panel rounded-2xl sm:rounded-3xl shadow-elevated border border-line p-4 sm:p-8">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-ink">
              📊 Indicadores de preço
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-success/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-success/30">
                <p className="text-xs sm:text-sm text-success font-medium mb-1 sm:mb-2">
                  Menor preço histórico
                </p>
                <p className="text-lg sm:text-2xl font-bold text-success">
                  {analytics.metrics.minPrice.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>

              <div className="bg-danger/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-danger/30">
                <p className="text-xs sm:text-sm text-danger font-medium mb-1 sm:mb-2">
                  Maior preço histórico
                </p>
                <p className="text-lg sm:text-2xl font-bold text-danger">
                  {analytics.metrics.maxPrice.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>

              <div
                className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${decision.bg}`}
              >
                <p
                  className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${decision.color}`}
                >
                  Comparação com a média
                </p>
                <p
                  className={`text-base sm:text-xl font-bold ${decision.color}`}
                >
                  {decision.title}
                </p>
              </div>
            </div>
          </div>

          {/* HISTÓRICO */}
          <div className="bg-panel rounded-2xl sm:rounded-3xl shadow-elevated border border-line p-4 sm:p-8">
            <ProductHistory
              data={priceHistory}
              lowerDomain={analytics.metrics.lowerDomain}
              upperDomain={analytics.metrics.upperDomain}
            />
          </div>
        </section>

        {/* ================= SIDEBAR ================= */}
        <aside className="mt-12 lg:mt-0">
          <div className="lg:sticky lg:top-28">
            <SimilarProducts products={productData.similares} />
          </div>
        </aside>
      </div>
    </div>
  );
}
