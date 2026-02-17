import ProductCard from "@/components/ProductCard";
import ProductHistory from "@/components/product/ProductHistory";
import { fetchProducts, fetchPrices } from "@/lib/api";
import { calculatePriceMetrics } from "@/utils/priceMetrics";
import type { PriceStatus } from "@/utils/priceMetrics";
import type { ProductCardData } from "@/types";
import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://promoly-core.vercel.app";

export const metadata: Metadata = {
  title:
    "Menor preço hoje (Atualizado diariamente) | Ofertas reais abaixo da média histórica",
  description:
    "Veja os produtos com maior queda real de preço hoje. Monitoramento automático do histórico para identificar oportunidades reais de compra.",
  alternates: {
    canonical: `${BASE_URL}/menor-preco-hoje`,
  },
  openGraph: {
    title:
      "Menor preço hoje | Produtos abaixo da média histórica",
    description:
      "Descubra quais produtos estão realmente abaixo da média histórica e aproveite oportunidades reais.",
    url: `${BASE_URL}/menor-preco-hoje`,
    type: "website",
  },
};

/* ================= TYPES ================= */

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
  lastPrice: number | null;
  priceDiffPercent: number;
  variationVsLast: number;
  diffVsAverageValue: number;
  diffVsLastValue: number;
  priceStatus: PriceStatus;
  lowerDomain: number;
  upperDomain: number;
  hasThreeDrops: boolean;
};

/* ================= HELPERS ================= */

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

/* ================= PAGE ================= */

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

        const sortedHistory = [...history].sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        );

        const lastPrice =
          sortedHistory.length >= 2
            ? sortedHistory[sortedHistory.length - 2].preco
            : null;

        const variationVsLast =
          lastPrice
            ? ((metrics.currentPrice - lastPrice) / lastPrice) * 100
            : 0;

        const diffVsLastValue =
          lastPrice ? metrics.currentPrice - lastPrice : 0;

        const diffVsAverageValue =
          metrics.currentPrice - metrics.avgPrice;

        return {
          ...product,
          history,
          maxPrice: metrics.maxPrice,
          minPrice: metrics.minPrice,
          avgPrice: metrics.avgPrice,
          currentPrice: metrics.currentPrice,
          lastPrice,
          priceDiffPercent: metrics.priceDiffPercent,
          variationVsLast,
          diffVsAverageValue,
          diffVsLastValue,
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

  const heroProduct = [...enriched].sort(
    (a, b) => a.priceDiffPercent - b.priceDiffPercent
  )[0];

  const grouped: Record<string, EnrichedProduct[]> =
    enriched.reduce((acc, product) => {
      const cat = product.categoria_nome || "Outros";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, EnrichedProduct[]>);

  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-14">

        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🔥 Radar de Oportunidades – Produtos abaixo da média histórica
          </h1>
          <p className="text-gray-500">
            Atualizado em {today}
          </p>
        </header>

        {/* ================= HERO GLOBAL ================= */}

        <section className="bg-white rounded-2xl p-10 shadow mb-20 border">

          <h2 className="text-2xl font-bold mb-6">
            🏆 Maior Queda do Dia
          </h2>

          <div className="grid md:grid-cols-2 gap-12">

            <div>
              <img
                src={heroProduct.imagem_url ?? "/placeholder.png"}
                alt={heroProduct.titulo}
                className="w-full rounded-xl"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">
                {heroProduct.titulo}
              </h3>

              {/* PREÇO ATUAL */}
              <p className="text-4xl font-bold text-gray-900 mb-6">
                R$ {heroProduct.currentPrice.toFixed(2)}
              </p>

              <div className="grid grid-cols-2 gap-8 mb-6">

                {/* MÉDIA HISTÓRICA */}
                <div>
                  <span className="text-xs text-muted uppercase block mb-1">
                    Média histórica
                  </span>
                  <p className="font-semibold">
                    R$ {heroProduct.avgPrice.toFixed(2)}
                  </p>
                  <p className="text-success font-bold">
                    {heroProduct.priceDiffPercent.toFixed(1)}%
                    {" "}
                    ({heroProduct.diffVsAverageValue.toFixed(2)})
                  </p>
                </div>

                {/* ÚLTIMO PREÇO */}
                {heroProduct.lastPrice && (
                  <div>
                    <span className="text-xs text-muted uppercase block mb-1">
                      Último preço
                    </span>
                    <p className="font-semibold">
                      R$ {heroProduct.lastPrice.toFixed(2)}
                    </p>
                    <p
                      className={`font-bold ${
                        heroProduct.variationVsLast > 0
                          ? "text-danger"
                          : "text-success"
                      }`}
                    >
                      {heroProduct.variationVsLast > 0 ? "+" : ""}
                      {heroProduct.variationVsLast.toFixed(1)}%
                      {" "}
                      ({heroProduct.diffVsLastValue > 0 ? "+" : ""}
                      {heroProduct.diffVsLastValue.toFixed(2)})
                    </p>
                  </div>
                )}

              </div>

              {heroProduct.variationVsLast > 0 &&
                heroProduct.priceDiffPercent < 0 && (
                  <div className="bg-accent/20 border border-accent rounded-lg p-4 text-sm mb-6">
                    📈 Apesar da alta recente, o preço ainda está abaixo da média histórica.
                  </div>
                )}

              <ProductHistory
                data={heroProduct.history.map((h) => ({
                  preco: h.preco,
                  data: new Date(h.created_at).getTime(),
                }))}
                lowerDomain={heroProduct.lowerDomain}
                upperDomain={heroProduct.upperDomain}
              />
            </div>

          </div>
        </section>

        {/* ================= CATEGORIAS ================= */}

        {Object.entries(grouped).map(([categoria, items]) => {

          const sorted = [...items].sort(
            (a, b) => a.priceDiffPercent - b.priceDiffPercent
          );

          const topProduct = sorted[0];
          const others = sorted.slice(1, 6);

          return (
            <section key={categoria} className="mb-24">

              <h2 className="text-primary text-4xl font-bold mb-10">
                {categoria}
              </h2>

              <div className="bg-white rounded-2xl p-8 shadow border mb-10">

                <div className="grid md:grid-cols-2 gap-10">

                  <div>
                    <img
                      src={topProduct.imagem_url ?? "/placeholder.png"}
                      alt={topProduct.titulo}
                      className="w-full rounded-xl"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      {topProduct.titulo}
                    </h3>

                    <p className="text-3xl font-bold mb-4">
                      R$ {topProduct.currentPrice.toFixed(2)}
                    </p>

                    <div className="flex gap-8 mb-6">

                      <div>
                        <span className="text-xs text-muted uppercase block mb-1">
                          vs média
                        </span>
                        <span className="text-success font-bold">
                          {topProduct.priceDiffPercent.toFixed(1)}%
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-muted uppercase block mb-1">
                          vs último
                        </span>
                        <span
                          className={`font-bold ${
                            topProduct.variationVsLast > 0
                              ? "text-danger"
                              : "text-success"
                          }`}
                        >
                          {topProduct.variationVsLast > 0 ? "+" : ""}
                          {topProduct.variationVsLast.toFixed(1)}%
                        </span>
                      </div>

                    </div>

                    <ProductHistory
                      data={topProduct.history.map((h) => ({
                        preco: h.preco,
                        data: new Date(h.created_at).getTime(),
                      }))}
                      lowerDomain={topProduct.lowerDomain}
                      upperDomain={topProduct.upperDomain}
                    />
                  </div>

                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {others.map((p) => (
                  <ProductCard
                    key={p.produto_id}
                    product={p}
                  />
                ))}
              </div>

            </section>
          );
        })}

      </div>
    </div>
  );
}
