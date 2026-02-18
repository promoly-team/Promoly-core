import ProductCard from "@/components/ProductCard";
import ProductHistory from "@/components/product/ProductHistory";
import { fetchProducts, fetchPrices } from "@/lib/api";
import { calculatePriceMetrics } from "@/utils/priceMetrics";
import type { PriceStatus } from "@/utils/priceMetrics";
import type { ProductCardData } from "@/types";
import type { Metadata } from "next";
import Image from "next/image";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://promoly-core.vercel.app";

export const metadata: Metadata = {
  title:
    "Menor preço hoje (Atualizado diariamente) | Ofertas reais abaixo da média histórica",
  description:
    "Veja os produtos com maior queda real de preço hoje. Monitoramento automático do histórico para identificar oportunidades reais de compra.",
  alternates: {
    canonical: `${BASE_URL}/menor-preco-hoje`,
  },
  openGraph: {
    title: "Menor preço hoje | Produtos abaixo da média histórica",
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
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
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
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );

        const lastPrice =
          sortedHistory.length >= 2
            ? sortedHistory[sortedHistory.length - 2].preco
            : null;

        const variationVsLast = lastPrice
          ? ((metrics.currentPrice - lastPrice) / lastPrice) * 100
          : 0;

        const diffVsLastValue = lastPrice
          ? metrics.currentPrice - lastPrice
          : 0;

        const diffVsAverageValue = metrics.currentPrice - metrics.avgPrice;

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
      }),
    )
  ).filter((p): p is EnrichedProduct => p !== null);

  if (enriched.length === 0) {
    return (
      <div className="p-20 text-center">Nenhuma oportunidade encontrada.</div>
    );
  }

  const heroProduct = [...enriched].sort(
    (a, b) => a.priceDiffPercent - b.priceDiffPercent,
  )[0];

  const grouped: Record<string, { slug: string; items: EnrichedProduct[] }> =
    enriched.reduce(
      (acc, product) => {
        const nome = product.categoria_nome || "Outros";
        const slug = product.categoria_slug || "outros";

        if (!acc[nome]) {
          acc[nome] = { slug, items: [] };
        }

        acc[nome].items.push(product);
        return acc;
      },
      {} as Record<string, { slug: string; items: EnrichedProduct[] }>,
    );

  const today = new Date().toLocaleDateString("pt-BR");

  const heroHistory = heroProduct.history.map((h) => ({
    preco: h.preco,
    data: new Date(h.created_at).getTime(),
  }));

  /* ================= SCHEMAS ================= */

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Como saber se é uma queda real de preço?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Um produto só aparece nesta página quando o preço atual está abaixo da média histórica registrada no monitoramento do Promoly.",
        },
      },
      {
        "@type": "Question",
        name: "Com que frequência os preços são atualizados?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Os preços são monitorados várias vezes ao dia.",
        },
      },
      {
        "@type": "Question",
        name: "Como funciona a média histórica?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A média histórica é calculada com base nos preços anteriores registrados ao longo do tempo.",
        },
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: enriched.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.titulo,
        image: product.imagem_url,
        offers: {
          "@type": "Offer",
          priceCurrency: "BRL",
          price: product.currentPrice,
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/produto/${product.slug}-${product.produto_id}`,
          priceValidUntil: new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      },
    })),
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🔥 Radar de Oportunidades – Produtos abaixo da média histórica
          </h1>
          <p className="text-gray-500">Atualizado em {today}</p>
        </header>

        {/* ================= HERO GLOBAL ================= */}

        <section className="bg-white rounded-2xl p-10 shadow border mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            🏆 Maior Queda do Dia
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* IMAGEM */}
            <div>
              <Image
                src={heroProduct.imagem_url ?? "/placeholder.png"}
                alt={heroProduct.titulo}
                width={600}
                height={600}
                className="w-full rounded-xl object-contain"
                priority
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
                        heroProduct.currentPrice - (heroProduct.lastPrice ?? 0)
                      ).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                      )
                    </p>
                  </div>
                )}
              </div>

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

        {/* ================= EXPLICAÇÃO SEO ================= */}

        <section className="max-w-3xl mx-auto mb-16 bg-white rounded-2xl shadow-soft border border-gray-100 p-8 md:p-12 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl bg-primary/10 rounded-lg p-2">💡</span>
            <h2 className="text-2xl md:text-3xl font-bold">
              Como identificamos o menor preço?
            </h2>
          </div>
          <p className="text-gray-700 text-lg mb-2">
            Monitora-se automaticamente o histórico de{" "}
            <span className="font-semibold text-primary">
              milhares de produtos
            </span>
            . Só aparecem aqui com preço{" "}
            <span className="font-semibold text-success">
              abaixo da média histórica
            </span>
            .
          </p>
          <p className="text-gray-600 mb-2">
            Aqui você vê quedas reais, não promoções artificiais. Comparamos com
            dados anteriores.
          </p>
          <p className="text-gray-500 text-sm">
            Atualização várias vezes ao dia para garantir oportunidades reais de
            compra.
          </p>
        </section>

        {/* ================= CATEGORIAS ================= */}

        {Object.entries(grouped).map(([categoria, group]) => {
          const { slug, items } = group;

          const sorted = [...items].sort(
            (a, b) => a.priceDiffPercent - b.priceDiffPercent,
          );

          const topProduct = sorted[0];
          const others = sorted.slice(1, 6);

          return (
            <section key={categoria} className="mb-24">
              <h2 className="text-primary text-4xl font-bold mb-10">
                {categoria}
              </h2>

              <div className="bg-white rounded-2xl p-6 shadow border mb-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <div>
                    <Image
                      src={topProduct.imagem_url ?? "/placeholder.png"}
                      alt={topProduct.titulo}
                      width={500}
                      height={500}
                      className="w-full rounded-xl object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      {topProduct.titulo}
                    </h3>

                    {/* PREÇO ATUAL */}
                    <p className="text-3xl font-bold text-gray-900 mb-6">
                      {topProduct.currentPrice.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>

                    {/* BLOCO MÉTRICAS COMPLETO */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      {/* MÉDIA HISTÓRICA */}
                      <div>
                        <p className="text-xs text-muted uppercase mb-1">
                          Média histórica
                        </p>
                        <p className="font-semibold text-lg">
                          {topProduct.avgPrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                        <p className="text-success font-bold">
                          {topProduct.priceDiffPercent.toFixed(1)}% (
                          {(
                            topProduct.currentPrice - topProduct.avgPrice
                          ).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                          )
                        </p>
                      </div>

                      {/* ÚLTIMO PREÇO */}
                      {topProduct.lastPrice !== null && (
                        <div>
                          <p className="text-xs text-muted uppercase mb-1">
                            Último preço
                          </p>
                          <p className="font-semibold text-lg">
                            {topProduct.lastPrice.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                          <p
                            className={`font-bold ${
                              topProduct.variationVsLast > 0
                                ? "text-danger"
                                : "text-success"
                            }`}
                          >
                            {topProduct.variationVsLast > 0 ? "+" : ""}
                            {topProduct.variationVsLast.toFixed(1)}% (
                            {(
                              topProduct.currentPrice - topProduct.lastPrice
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
                    <h4 className="text-base font-bold mb-2">
                      Histórico de preço
                    </h4>

                    {topProduct.variationVsLast !== null && (
                      <p
                        className={`text-sm mb-6 font-medium ${
                          topProduct.variationVsLast > 0
                            ? "text-danger"
                            : "text-success"
                        }`}
                      >
                        {topProduct.variationVsLast > 0 ? "⬆" : "⬇"}{" "}
                        {Math.abs(topProduct.variationVsLast).toFixed(1)}% (
                        {Math.abs(
                          topProduct.currentPrice - (topProduct.lastPrice ?? 0),
                        ).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                        ) comparado ao último registro
                      </p>
                    )}

                    {/* GRÁFICO */}
                    <ProductHistory
                      data={topProduct.history.map((h) => ({
                        preco: h.preco,
                        data: new Date(h.created_at).getTime(),
                      }))}
                      lowerDomain={topProduct.lowerDomain}
                      upperDomain={topProduct.upperDomain}
                    />

                    {/* BOTÕES */}
                    <div className="flex gap-4 mt-8">
                      <a
                        href={`/produto/${topProduct.slug}-${topProduct.produto_id}`}
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
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {others.map((p) => (
                  <ProductCard key={p.produto_id} product={p} />
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
      {/* ================= FAQ VISÍVEL ================= */}

      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">❓ Perguntas Frequentes</h2>
          <p className="text-muted text-lg">
            Entenda como o Promoly identifica as melhores oportunidades
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FAQ Card 1 */}
          <div className="bg-white rounded-xl2 p-8 shadow-soft border border-gray-100 hover:shadow-medium transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                <span className="text-xl">🔍</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Como saber se é uma queda real?
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              O produto só aparece aqui quando o preço atual está{" "}
              <strong>significativamente abaixo da média histórica</strong> que
              monitoramos. Não é promoção artificial — são dados reais de
              mercado.
            </p>
          </div>

          {/* FAQ Card 2 */}
          <div className="bg-white rounded-xl2 p-8 shadow-soft border border-gray-100 hover:shadow-medium transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-success/10 rounded-lg p-3 flex-shrink-0">
                <span className="text-xl">⏰</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Com que frequência os preços são atualizados?
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Os preços são monitorados <strong>várias vezes ao dia</strong>,
              garantindo que você veja as oportunidades em tempo real. Os dados
              estão sempre frescos.
            </p>
          </div>

          {/* FAQ Card 3 */}
          <div className="bg-white rounded-xl2 p-8 shadow-soft border border-gray-100 hover:shadow-medium transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-accent/10 rounded-lg p-3 flex-shrink-0">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Como funciona a média histórica?
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Calculamos a média com base em{" "}
              <strong>todos os registros anteriores</strong> do produto. Quanto
              mais dados, mais precisa é a comparação. Mínimo 2 registros para
              aparecer aqui.
            </p>
          </div>

          {/* FAQ Card 4 */}
          <div className="bg-white rounded-xl2 p-8 shadow-soft border border-gray-100 hover:shadow-medium transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-danger/10 rounded-lg p-3 flex-shrink-0">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Por que alguns produtos não aparecem?
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Filtramos apenas produtos com{" "}
              <strong>queda real de pelo menos 2%</strong> em relação à média
              histórica. Isso garante que você vê apenas oportunidades genuínas.
            </p>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
    </div>
  );
}
