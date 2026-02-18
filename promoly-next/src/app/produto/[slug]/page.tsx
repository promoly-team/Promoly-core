import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { fetchProductById, fetchPrices } from "@/lib/api";
import { calculatePriceMetrics } from "@/utils/priceMetrics";

import ProductDetails from "@/components/product/ProductDetails";
import ProductHistory from "@/components/product/ProductHistory";
import SimilarProducts from "@/components/product/SimilarProducts";

type Props = {
  params: Promise<{ slug: string }>;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https//promoly-core.vercel.app";

/* =====================================================
   🔥 METADATA
===================================================== */

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { slug } = await params;
  const id = Number(slug.split("-").pop());

  if (isNaN(id)) {
    return { title: "Produto não encontrado", robots: { index: false } };
  }

  const productData = await fetchProductById(id);
  if (!productData?.produto) {
    return { title: "Produto não encontrado", robots: { index: false } };
  }

  const produto = productData.produto;
  const imageUrl = produto.imagem_url ?? "/placeholder.png";

  const shortTitle =
    produto.titulo.length > 55
      ? produto.titulo.slice(0, 55) + "..."
      : produto.titulo;

  return {
    title: `${shortTitle} – Histórico de preço`,
    description:
      `Veja o histórico de preços do ${produto.titulo}, menor valor registrado e análise se vale a pena comprar hoje.`,
    alternates: {
      canonical: `${BASE_URL}/produto/${slug}`,
    },
    openGraph: {
      type: "website",
      title: produto.titulo,
      description:
        "Confira o histórico de preços e descubra se está barato hoje.",
      url: `${BASE_URL}/produto/${slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: produto.titulo,
      description: "Histórico de preços e análise completa.",
      images: [imageUrl],
    },
  };
}

/* =====================================================
   🔥 PAGE
===================================================== */

export default async function ProductPage({ params }: Props) {

  const { slug } = await params;
  const id = Number(slug.split("-").pop());

  if (isNaN(id)) notFound();

  const productData = await fetchProductById(id);
  if (!productData?.produto) notFound();

  const prices = await fetchPrices(id);

  const priceHistory = prices
    .map((p) => ({
      preco: Number(p.preco),
      data: new Date(p.created_at).getTime(),
    }))
    .sort((a, b) => a.data - b.data);

  const metrics = calculatePriceMetrics(priceHistory);
  const isLowestEver = metrics.currentPrice <= metrics.minPrice;
  const produto = productData.produto;
  const diff = metrics.priceDiffPercent;
  const lastPrice =
    priceHistory.length >= 2
      ? priceHistory[priceHistory.length - 2].preco
      : null;

  const variationVsLast =
    lastPrice
      ? ((metrics.currentPrice - lastPrice) / lastPrice) * 100
      : 0;

  const diffVsLastValue =
    lastPrice ? metrics.currentPrice - lastPrice : 0;

  const diffVsAverageValue =
    metrics.currentPrice - metrics.avgPrice;


  /* =========================
     DECISÃO DE COMPRA
  ========================== */

  let decisionTitle = "";
  let decisionDescription = "";
  let decisionColor = "";
  let decisionBg = "";
  let decisionIcon = "";

  if (diff <= -20) {
    decisionTitle = "Excelente momento para comprar";
    decisionDescription =
      "O preço está muito abaixo da média histórica. Forte indicação de oportunidade.";
    decisionColor = "text-success";
    decisionBg = "bg-success-light border-success";
    decisionIcon = "🟢";
  } else if (diff < -5) {
    decisionTitle = "Bom momento para comprar";
    decisionDescription =
      "O preço está abaixo da média histórica.";
    decisionColor = "text-success";
    decisionBg = "bg-success-light border-success";
    decisionIcon = "🟢";
  } else if (Math.abs(diff) <= 5) {
    decisionTitle = "Preço dentro da média";
    decisionDescription =
      "O preço está alinhado com a média histórica.";
    decisionColor = "text-gray-700";
    decisionBg = "bg-gray-100 border-gray-300";
    decisionIcon = "🟡";
  } else {
    decisionTitle = "Momento desfavorável para compra";
    decisionDescription =
      "O preço está acima da média histórica.";
    decisionColor = "text-danger";
    decisionBg = "bg-red-50 border-danger";
    decisionIcon = "🔴";
  }

  /* =========================
     STRUCTURED DATA
  ========================== */

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produto.titulo,
    image: produto.imagem_url,
    description: produto.descricao,
    sku: produto.produto_id,
    url: `${BASE_URL}/produto/${slug}`,
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/produto/${slug}`,
      priceCurrency: "BRL",
      price: metrics.currentPrice.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: "2026-12-31",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Vale a pena comprar ${produto.titulo}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: decisionDescription,
        },
      },
    ],
  };

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
        name: "Ofertas",
        item: `${BASE_URL}/ofertas`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: produto.titulo,
        item: `${BASE_URL}/produto/${slug}`,
      },
    ],
  };
return (
  <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">

    {/* JSON-LD */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(productSchema),
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
        __html: JSON.stringify(breadcrumbSchema),
      }}
    />

    <div className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-[2fr_1fr] gap-14">

      <section className="space-y-12">

        {/* PRODUTO */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-200 p-8">
          <ProductDetails product={produto} />
        </div>

        {/* DECISÃO AVANÇADA */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-200 p-10">

          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            💡 Análise inteligente de preço
          </h2>

          {/* PREÇO ATUAL */}
          <p className="text-4xl font-bold text-gray-900 mb-6">
            {metrics.currentPrice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>

          {/* GRID COMPARATIVO */}
          <div className="grid sm:grid-cols-2 gap-8 mb-8">

            {/* MÉDIA HISTÓRICA */}
            <div className="bg-surface-subtle rounded-2xl p-6 border border-gray-200">
              <p className="text-xs uppercase text-muted mb-2">
                Média histórica
              </p>
              <p className="font-semibold text-lg">
                {metrics.avgPrice.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              <p className="text-success font-bold mt-2">
                {diff.toFixed(1)}% (
                {diffVsAverageValue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
                )
              </p>
            </div>

            {/* ÚLTIMO PREÇO */}
            {lastPrice && (
              <div className="bg-surface-subtle rounded-2xl p-6 border border-gray-200">
                <p className="text-xs uppercase text-muted mb-2">
                  Último preço registrado
                </p>
                <p className="font-semibold text-lg">
                  {lastPrice.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
                <p
                  className={`font-bold mt-2 ${
                    variationVsLast > 0
                      ? "text-danger"
                      : "text-success"
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

          {/* STATUS ESTRATÉGICO */}
          <div className={`rounded-2xl p-6 border ${decisionBg}`}>
            <p className={`text-lg font-bold ${decisionColor}`}>
              {decisionIcon} {decisionTitle}
            </p>

            <p className="text-sm mt-3 text-gray-700">
              {decisionDescription}
            </p>

            {variationVsLast > 0 && diff < 0 && (
              <p className="text-sm mt-3 font-medium text-gray-800">
                📈 O preço subiu recentemente, mas ainda permanece abaixo da média histórica.
              </p>
            )}

            {isLowestEver && (
              <p className="text-sm mt-3 font-semibold text-success">
                🎯 Este é o menor preço já registrado para este produto.
              </p>
            )}
          </div>

        </div>

        {/* INDICADORES */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-200 p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            📊 Indicadores de preço
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">

            <div className="bg-success-light rounded-2xl p-6 border border-success">
              <p className="text-sm text-success font-medium mb-2">
                Menor preço histórico
              </p>
              <p className="text-2xl font-bold text-success">
                {metrics.minPrice.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>

            <div className="bg-red-50 rounded-2xl p-6 border border-danger">
              <p className="text-sm text-danger font-medium mb-2">
                Maior preço histórico
              </p>
              <p className="text-2xl font-bold text-danger">
                {metrics.maxPrice.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>

            <div className={`rounded-2xl p-6 border ${decisionBg}`}>
              <p className={`text-sm font-medium mb-2 ${decisionColor}`}>
                Comparação com a média
              </p>
              <p className={`text-xl font-bold ${decisionColor}`}>
                {decisionTitle}
              </p>
            </div>

          </div>
        </div>

        {/* HISTÓRICO */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-200 p-8">
          <ProductHistory
            data={priceHistory}
            lowerDomain={metrics.lowerDomain}
            upperDomain={metrics.upperDomain}
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
