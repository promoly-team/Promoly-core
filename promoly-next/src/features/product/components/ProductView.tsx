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
      {/* JSON-LD */}
      <JsonLd data={productSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-[2fr_1fr] gap-14">
        <section className="space-y-12">
          {/* PRODUTO */}
          <div className="bg-white rounded-3xl shadow-soft border p-8">
            <ProductDetails product={produto} />
          </div>

          {/* ANÁLISE INTELIGENTE (modularizada) */}
          <ProductPriceAnalysis analytics={analytics} decision={decision} />

          {/* HISTÓRICO (continua client component) */}
          <div className="bg-white rounded-3xl shadow-soft border p-8">
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
