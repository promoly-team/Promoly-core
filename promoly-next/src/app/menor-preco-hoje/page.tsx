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

  const grouped: Record<
    string,
    { slug: string; items: EnrichedProduct[] }
  > = enriched.reduce((acc, product) => {
    const nome = product.categoria_nome || "Outros";
    const slug = product.categoria_slug || "outros";

    if (!acc[nome]) {
      acc[nome] = { slug, items: [] };
    }

    acc[nome].items.push(product);
    return acc;
  }, {} as Record<
    string,
    { slug: string; items: EnrichedProduct[] }
  >);


  const today = new Date().toLocaleDateString("pt-BR");

  const heroHistory = heroProduct.history.map((h) => ({
    preco: h.preco,
    data: new Date(h.created_at).getTime(),
  }));


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

<section className="bg-white rounded-2xl p-10 shadow border mb-20">

  <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
    🏆 Maior Queda do Dia
  </h2>

  <div className="grid md:grid-cols-2 gap-12">

    {/* IMAGEM */}
    <div>
      <img
        src={heroProduct.imagem_url ?? "/placeholder.png"}
        alt={heroProduct.titulo}
        className="w-full rounded-xl"
      />
    </div>

    {/* CONTEÚDO */}
    <div>

      <h3 className="text-lg font-semibold mb-4">
        {heroProduct.titulo}
      </h3>

      {/* PREÇO ATUAL */}
      <p className="text-4xl font-bold text-gray-900 mb-8">
        {heroProduct.currentPrice.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>

      {/* BLOCO MÉTRICAS */}
      <div className="grid grid-cols-2 gap-10 mb-10">

        {/* MÉDIA HISTÓRICA */}
        <div>
          <p className="text-xs text-muted uppercase mb-1">
            Média histórica
          </p>
          <p className="font-semibold text-lg">
            {heroProduct.avgPrice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p className="text-success font-bold">
            {heroProduct.priceDiffPercent.toFixed(1)}% (
            {(
              heroProduct.currentPrice - heroProduct.avgPrice
            ).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            )
          </p>
        </div>

        {/* ÚLTIMO PREÇO */}
        {heroProduct.lastPrice && (
          <div>
            <p className="text-xs text-muted uppercase mb-1">
              Último preço
            </p>
            <p className="font-semibold text-lg">
              {heroProduct.lastPrice.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p
              className={`font-bold ${
                heroProduct.variationVsLast &&
                heroProduct.variationVsLast > 0
                  ? "text-danger"
                  : "text-success"
              }`}
            >
              {heroProduct.variationVsLast &&
              heroProduct.variationVsLast > 0
                ? "+"
                : ""}
              {heroProduct.variationVsLast?.toFixed(1)}% (
              {(
                heroProduct.currentPrice -
                (heroProduct.lastPrice ?? 0)
              ).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              )
            </p>
          </div>
        )}

      </div>

      {/* HISTÓRICO TEXTO */}
      <h4 className="text-xl font-bold mb-2">
        Histórico de preço
      </h4>

      {heroProduct.variationVsLast !== null && (
        <p
          className={`text-sm mb-6 font-medium ${
            heroProduct.variationVsLast > 0
              ? "text-danger"
              : "text-success"
          }`}
        >
          {heroProduct.variationVsLast > 0 ? "⬆" : "⬇"}{" "}
          {Math.abs(heroProduct.variationVsLast).toFixed(1)}% (
          {Math.abs(
            heroProduct.currentPrice -
              (heroProduct.lastPrice ?? 0)
          ).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          ) comparado ao último registro
        </p>
      )}

      {/* GRÁFICO */}
      <ProductHistory
        data={heroHistory}
        lowerDomain={heroProduct.lowerDomain}
        upperDomain={heroProduct.upperDomain}

      />

      {/* BOTÕES */}
      <div className="flex gap-4 mt-8 justify-start">

        <a
          href={`/produto/${heroProduct.slug}-${heroProduct.produto_id}`}
          className="
            flex-1
            bg-surface-subtle
            hover:bg-gray-200
            text-gray-800
            py-3
            rounded-xl
            text-center
            transition
          "
        >
          Detalhes
        </a>

        {heroProduct.url_afiliada && (
          <a
            href={heroProduct.url_afiliada}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="
              flex-1
              bg-primary
              hover:bg-primary-hover
              text-white
              py-3
              rounded-xl
              text-center
              transition
            "
          >
            Comprar
          </a>
        )}

      </div>

    </div>

  </div>
</section>


        {/* ================= CATEGORIAS ================= */}

        {Object.entries(grouped).map(([categoria, group]) => {
          
          const { slug, items } = group;

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

                    <div className="flex gap-4 mt-6">

                      <a
                        href={`/produto/${topProduct.slug}-${topProduct.produto_id}`}
                        className="
                          flex-1
                          bg-surface-subtle
                          hover:bg-gray-200
                          text-gray-800
                          text-sm
                          font-medium
                          py-3
                          rounded-xl
                          transition
                          text-center
                        "
                      >
                        Detalhes
                      </a>

                      {topProduct.url_afiliada && (
                        <a
                          href={topProduct.url_afiliada}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="
                            flex-1
                            bg-primary
                            hover:bg-primary-hover
                            text-white
                            text-sm
                            font-semibold
                            py-3
                            rounded-xl
                            transition
                            text-center
                          "
                        >
                          Comprar
                        </a>
                      )}

                    </div>


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

          <div className="mt-8 text-left">
            <a
              href={`/categoria/${slug}/menor-preco`}
              className="
                inline-block
                text-primary
                font-semibold
                hover:underline
                transition
              "
            >
              Ver mais em {categoria} →
            </a>
          </div>

            </section>
          );
        })}

      </div>
    </div>
  );
}
