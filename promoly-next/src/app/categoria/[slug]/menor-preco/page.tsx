import { notFound } from "next/navigation";
import type { Metadata } from "next";

import ProductCard from "@/components/ProductCard";
import ProductHistory from "@/components/product/ProductHistory";
import { fetchPrices } from "@/lib/api";
import { fetchProductsWithMetrics } from "@/lib/api";
import Image from "next/image";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://promoly-core.vercel.app";

type Props = {
  params: Promise<{ slug: string }>;
};

type ProductWithMetrics = {
  produto_id: number;
  slug: string;
  titulo: string;
  imagem_url: string | null;
  url_afiliada: string | null;
  categoria_slug: string;
  categoria_nome: string;
  current_price: number;
  previous_price: number | null;
  avg_price: number;
  min_price: number;
  max_price: number;
  diff_percent: number;
  variation_vs_last: number | null;
  history: {
    preco: number;
    created_at: string;
  }[];
};

export const revalidate = 300;

/* ===============================================
   METADATA
=============================================== */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const categoriaNome = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `Menor preço em ${categoriaNome} hoje | Produtos abaixo da média`,
    description: `Veja os produtos da categoria ${categoriaNome} que estão abaixo da média histórica.`,
    alternates: {
      canonical: `${BASE_URL}/categoria/${slug}/menor-preco`,
    },
  };
}

/* ===============================================
   PAGE
=============================================== */

export default async function CategoriaMenorPrecoPage({ params }: Props) {
  const { slug } = await params;

  const products: ProductWithMetrics[] = await fetchProductsWithMetrics({
    category: slug,
    below_average: true,
    limit: 100,
  });

  if (!products?.length) notFound();

  const sorted = [...products].sort((a, b) => a.diff_percent - b.diff_percent);

  const hero = sorted[0];

  const heroRawHistory = await fetchPrices(hero.produto_id);

  const heroHistory =
    heroRawHistory
      ?.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      .map((h) => ({
        preco: h.preco,
        data: new Date(h.created_at).getTime(),
      })) ?? [];

  const currentPrice = hero.current_price;
  const avgPrice = hero.avg_price;
  const lastPrice = hero.previous_price;

  const diffVsAverageValue = currentPrice - avgPrice;

  const diffVsLastValue = lastPrice !== null ? currentPrice - lastPrice : null;

  const variationVsLast =
    lastPrice !== null ? ((currentPrice - lastPrice) / lastPrice) * 100 : null;

  const categoriaNome = slug.charAt(0).toUpperCase() + slug.slice(1);

  const today = new Date().toLocaleDateString("pt-BR");
  /* ================= SCHEMAS ================= */

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoriaNome,
        item: `${BASE_URL}/categoria/${slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Menor Preço",
        item: `${BASE_URL}/categoria/${slug}/menor-preco`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Vale a pena comprar ${categoriaNome} agora?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Os produtos exibidos nesta página estão abaixo da média histórica.`,
        },
      },
      {
        "@type": "Question",
        name: "Como saber se o preço está realmente baixo?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Comparamos o valor atual com registros históricos anteriores.",
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
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: sorted.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.titulo,
        image: product.imagem_url,
        offers: {
          "@type": "Offer",
          priceCurrency: "BRL",
          price: product.current_price,
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/produto/${product.slug}-${product.produto_id}`,
        },
      },
    })),
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* HEADER */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🔥 Menor preço em {categoriaNome} hoje
          </h1>

          <p className="text-gray-500">
            Produtos abaixo da média histórica. Atualizado em {today}
          </p>
        </header>
        {/* ================= EXPLICAÇÃO SEO ================= */}

        <section className="max-w-3xl mx-auto mb-16 bg-white rounded-2xl shadow-soft border border-gray-100 p-8 md:p-12 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl bg-primary/10 rounded-lg p-2">💡</span>
            <h2 className="text-2xl md:text-3xl font-bold">
              Como identificamos o menor preço?
            </h2>
          </div>
          <p className="text-gray-700 text-lg mb-2">
            Só mostramos produtos de{" "}
            <span className="font-semibold text-primary">{categoriaNome}</span>{" "}
            que estão{" "}
            <span className="font-semibold text-success">
              abaixo da média histórica
            </span>{" "}
            de preço.
          </p>
          <p className="text-gray-600 mb-2">
            O sistema monitora valores automaticamente e destaca apenas quedas
            reais, não promoções comuns.
          </p>
          <p className="text-gray-500 text-sm">
            Atualização várias vezes ao dia para garantir oportunidades reais.
          </p>
        </section>

        {/* HERO */}
        <section className="bg-white rounded-2xl p-6 md:p-10 shadow border mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            🏆 Maior queda da categoria
          </h2>

          {/* GRID IMAGEM + CONTEÚDO */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* IMAGEM */}
            <div>
              <Image
                src={hero.imagem_url ?? "/placeholder.png"}
                alt={hero.titulo}
                width={600}
                height={600}
                className="w-full rounded-xl object-contain"
                priority
              />
            </div>

            {/* CONTEÚDO */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">
                {hero.titulo}
              </h3>

              {/* PREÇO ATUAL */}
              <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                {hero.current_price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>

              {/* BLOCO MÉTRICAS */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                {/* MÉDIA HISTÓRICA */}
                <div>
                  <p className="text-xs text-muted uppercase mb-1">
                    Média histórica
                  </p>
                  <p className="font-semibold text-lg">
                    {avgPrice.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                  <p className="text-success font-bold">
                    {hero.diff_percent.toFixed(1)}% (
                    {diffVsAverageValue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                    )
                  </p>
                </div>

                {/* ÚLTIMO PREÇO */}
                {lastPrice !== null &&
                  variationVsLast !== null &&
                  diffVsLastValue !== null && (
                    <div>
                      <p className="text-xs text-muted uppercase mb-1">
                        Último preço
                      </p>
                      <p className="font-semibold text-lg">
                        {lastPrice.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <p
                        className={`font-bold ${
                          variationVsLast > 0 ? "text-danger" : "text-success"
                        }`}
                      >
                        {variationVsLast > 0 ? "+" : ""}
                        {variationVsLast.toFixed(1)}% (
                        {diffVsLastValue.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                        )
                      </p>
                    </div>
                  )}
              </div>

              {/* INFORMATIVO */}
              <h4 className="text-lg md:text-xl font-bold mb-2">
                Histórico de preço
              </h4>

              {variationVsLast !== null && diffVsLastValue !== null && (
                <p
                  className={`text-sm mb-6 font-medium ${
                    variationVsLast > 0 ? "text-danger" : "text-success"
                  }`}
                >
                  {variationVsLast > 0 ? "⬆" : "⬇"}{" "}
                  {Math.abs(variationVsLast).toFixed(1)}% (
                  {Math.abs(diffVsLastValue).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                  ) comparado ao último registro
                </p>
              )}
            </div>
          </div>

          {/* 🔥 GRÁFICO FORA DO GRID (AGORA FICA LARGO NO MOBILE) */}
          <div className="mt-8 max-w-3xl mx-auto">
            <ProductHistory
              data={heroHistory}
              lowerDomain={hero.min_price * 0.9}
              upperDomain={hero.max_price * 1.1}
            />
          </div>

          {/* BOTÕES */}
          <div className="flex gap-4 mt-8">
            <a
              href={`/produto/${hero.slug}-${hero.produto_id}`}
              className="flex-1 bg-surface-subtle hover:bg-gray-200 text-gray-800 py-3 rounded-xl text-center transition"
            >
              Detalhes
            </a>

            {hero.url_afiliada && (
              <a
                href={hero.url_afiliada}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl text-center transition"
              >
                Comprar
              </a>
            )}
          </div>
        </section>

        {/* GRID */}
        <section>
          <h2 className="text-2xl font-bold mb-10">Todos abaixo da média</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sorted.map((p) => (
              <ProductCard
                key={p.produto_id}
                product={{
                  produto_id: p.produto_id,
                  slug: p.slug,
                  titulo: p.titulo,
                  imagem_url: p.imagem_url,
                  url_afiliada: p.url_afiliada,

                  // 👇 ESSENCIAL
                  preco_atual: p.current_price,
                  preco_anterior: p.previous_price,
                  desconto_pct: Math.abs(p.diff_percent),

                  // opcional se quiser mostrar badge abaixo da média
                  isBelowAverage: p.diff_percent < 0,
                  priceDiffPercent: p.diff_percent,
                }}
              />
            ))}
          </div>
        </section>
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
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

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
