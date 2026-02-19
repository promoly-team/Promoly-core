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
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <JsonLd data={productSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-[2fr_1fr] gap-14">
        <section className="space-y-12">
          {/* PRODUTO */}
          <div className="bg-white rounded-3xl shadow-soft border border-gray-200 p-8">
            <ProductDetails product={produto} />
          </div>

          {/* ANÁLISE */}
          <div className="bg-white rounded-3xl shadow-soft border border-gray-200 p-8">
            <ProductPriceAnalysis analytics={analytics} decision={decision} />
          </div>

          {/* INDICADORES */}
          <div className="bg-white rounded-3xl shadow-soft border border-gray-200 p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              📊 Indicadores de preço
            </h2>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-success/10 rounded-2xl p-6 border border-success/30">
                <p className="text-sm text-success font-medium mb-2">
                  Menor preço histórico
                </p>
                <p className="text-2xl font-bold text-success">
                  {analytics.metrics.minPrice.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>

              <div className="bg-danger/10 rounded-2xl p-6 border border-danger/30">
                <p className="text-sm text-danger font-medium mb-2">
                  Maior preço histórico
                </p>
                <p className="text-2xl font-bold text-danger">
                  {analytics.metrics.maxPrice.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>

              <div className={`rounded-2xl p-6 border ${decision.bg}`}>
                <p className={`text-sm font-medium mb-2 ${decision.color}`}>
                  Comparação com a média
                </p>
                <p className={`text-xl font-bold ${decision.color}`}>
                  {decision.title}
                </p>
              </div>
            </div>
          </div>

          {/* HISTÓRICO */}
          <div className="bg-white rounded-3xl shadow-soft border border-gray-200 p-8">
            <ProductHistory
              data={priceHistory}
              lowerDomain={analytics.metrics.lowerDomain}
              upperDomain={analytics.metrics.upperDomain}
            />
          </div>
        </section>

        <aside>
          <div className="sticky top-28">
            <SimilarProducts products={productData.similares} />
          </div>
        </aside>
      </div>
    </div>
  );
}
