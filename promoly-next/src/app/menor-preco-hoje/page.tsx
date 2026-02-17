import ProductCard from "@/components/ProductCard";
import ProductHistory from "@/components/product/ProductHistory";
import { fetchProducts, fetchPrices } from "@/lib/api";
import { calculatePriceMetrics } from "@/utils/priceMetrics";
import type { PriceStatus } from "@/utils/priceMetrics";
import type { ProductCardData } from "@/types";

/* ==================================================
   TYPES
================================================== */

type PricePoint = {
  preco: number;
  created_at: string;
};

type EnrichedProduct = ProductCardData & {
  history: PricePoint[];
  maxPrice: number;
  minPrice: number;
  avgPrice: number;
  currentPrice: number;
  priceDiffPercent: number;
  priceStatus: PriceStatus;
  lowerDomain: number;
  upperDomain: number;
  hasThreeDrops: boolean;
};

/* ==================================================
   HELPERS
================================================== */

function hasThreeConsecutiveDrops(history: PricePoint[]) {
  if (!history || history.length < 2) return false;

  const sorted = [...history].sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  );

  let consecutive = 0;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].preco < sorted[i - 1].preco) {
      consecutive++;
      if (consecutive >= 3) return true;
    } else {
      consecutive = 0;
    }
  }

  return false;
}

function generateCategoryAnalysis(products: EnrichedProduct[]) {
  const withThreeDrops = products.filter(
    (p) => p.hasThreeDrops
  ).length;

  if (withThreeDrops >= 3) {
    return `${withThreeDrops} produtos registraram três ou mais quedas consecutivas, indicando tendência clara de baixa recente nesta categoria.`;
  }

  if (withThreeDrops > 0) {
    return `Alguns produtos apresentam sequência de quedas consecutivas, sugerindo possível continuação da redução de preços.`;
  }

  return `Os preços estão abaixo da média histórica, mas sem padrão consistente de queda contínua.`;
}

/* ==================================================
   PAGE
================================================== */

export const revalidate = 300;

export default async function MenorPrecoHojePage() {
  const products = await fetchProducts({
    order: "desconto",
    limit: 40,
  });

  const enriched: EnrichedProduct[] = (
    await Promise.all(
      products.map(async (product): Promise<EnrichedProduct | null> => {
        const history = await fetchPrices(product.produto_id);

        if (!history || history.length < 2) return null;

        const metrics = calculatePriceMetrics(history);

        if (metrics.priceDiffPercent > -2) return null;

        return {
          ...product,
          history,
          maxPrice: metrics.maxPrice,
          minPrice: metrics.minPrice,
          avgPrice: metrics.avgPrice,
          currentPrice: metrics.currentPrice,
          priceDiffPercent: metrics.priceDiffPercent,
          priceStatus: metrics.priceStatus,
          lowerDomain: metrics.lowerDomain,
          upperDomain: metrics.upperDomain,
          hasThreeDrops: hasThreeConsecutiveDrops(history),
        };
      })
    )
  ).filter((p): p is EnrichedProduct => p !== null);


  if (enriched.length === 0) {
    return (
      <div className="p-20 text-center">
        Nenhuma oportunidade encontrada.
      </div>
    );
  }

  /* ---------------- HERO ---------------- */

  const heroProduct: EnrichedProduct = [...enriched]
    .sort((a, b) => a.priceDiffPercent - b.priceDiffPercent)[0];

  /* ---------------- AGRUPAR POR CATEGORIA ---------------- */

  const grouped: Record<string, EnrichedProduct[]> =
    enriched.reduce((acc, product) => {
      const cat = product.categoria_nome || "Outros";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, EnrichedProduct[]>);

  const today = new Date().toLocaleDateString("pt-BR");
console.log(
  enriched.slice(0, 5).map(p => ({
    id: p.produto_id,
    categoria: p.categoria_nome
  }))
);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-14">

        <h1 className="text-4xl font-bold mb-2">
          🔥 Radar de Oportunidades – 40% Abaixo da Média
        </h1>

        <p className="text-sm text-gray-500 mb-10">
          Atualizado em {today}
        </p>

        {/* ================= HERO ================= */}

        <section className="bg-white rounded-2xl p-8 shadow mb-16">

          <h2 className="text-2xl font-bold mb-4">
            🏆 Maior Queda do Dia
          </h2>

          <div className="grid md:grid-cols-2 gap-8">

            <div>
              <img
                src={heroProduct.imagem_url ?? "/placeholder.png"}
                alt={heroProduct.titulo}
                className="w-full rounded-xl"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                {heroProduct.titulo}
              </h3>

              <p className="text-3xl font-bold text-green-600 mb-2">
                {heroProduct.priceDiffPercent.toFixed(1)}%
                abaixo da média
              </p>

              {heroProduct.hasThreeDrops && (
                <p className="text-sm text-gray-600 mb-4">
                  Este produto apresenta três ou mais quedas consecutivas,
                  indicando tendência de baixa recente.
                </p>
              )}

              <ProductHistory
                data={heroProduct.history.map((h) => ({
                  preco: h.preco,
                  data: new Date(h.created_at).getTime(),
                }))}
                lowerDomain={heroProduct.lowerDomain}
                upperDomain={heroProduct.upperDomain}
              />

              <a
                href={`/produto/${heroProduct.slug}-${heroProduct.produto_id}`}
                className="inline-block mt-6 bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                Ver histórico completo →
              </a>
            </div>
          </div>
        </section>

        {/* ================= CATEGORIAS ================= */}

        {Object.entries(grouped).map(
          ([categoria, items]) => {

            const topFive = [...items]
              .sort(
                (a, b) =>
                  a.priceDiffPercent - b.priceDiffPercent
              )
              .slice(0, 5);

            const analysis =
              generateCategoryAnalysis(topFive);

            return (
              <section key={categoria} className="mb-16">

                <h2 className="text-2xl font-bold mb-4">
                  {categoria}
                </h2>

                <p className="text-gray-600 mb-6">
                  {analysis}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {topFive.map((p) => (
                    <ProductCard
                      key={p.produto_id}
                      product={p}
                    />
                  ))}
                </div>

                <div className="mt-6">
                  <a
                    href={`/categoria/${categoria}/menor-preco`}
                    className="text-green-600 font-medium"
                  >
                    Ver mais em {categoria} →
                  </a>
                </div>
              </section>
            );
          }
        )}
      </div>
    </div>
  );
}
