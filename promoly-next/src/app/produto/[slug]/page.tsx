import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { fetchProductById, fetchPrices } from "@/lib/api";
import { calculatePriceMetrics } from "@/utils/priceMetrics";

import ProductDetails from "@/components/product/ProductDetails";
import ProductHistory from "@/components/product/ProductHistory";
import SimilarProducts from "@/components/product/SimilarProducts";

type Props = {
  params: Promise<{ slug: string }>;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://promoly-core.vercel.app";

/* =========================
   METADATA
========================= */

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

  return {
    title: `${produto.titulo} | Histórico de preço e menor valor`,
    description:
      produto.descricao?.slice(0, 155) ||
      `Veja histórico de preços, menor valor e análise completa do ${produto.titulo}.`,
    alternates: {
      canonical: `${BASE_URL}/produto/${slug}`,
    },
    openGraph: {
      title: produto.titulo,
      description:
        produto.descricao?.slice(0, 155) ||
        `Confira o histórico de preços do ${produto.titulo}.`,
      url: `${BASE_URL}/produto/${slug}`,
      type: "website",
      images: [{ url: imageUrl, width: 800, height: 600 }],
    },
  };
}

/* =========================
   PAGE
========================= */

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
  const produto = productData.produto;

  /* ===== Status de preço ===== */

  const position = metrics.pricePosition;

  const statusText =
    position === "below"
      ? "📉 Abaixo da média histórica"
      : position === "above"
      ? "📈 Acima da média histórica"
      : "➖ Na média histórica";

  const statusColor =
    position === "below"
      ? "text-success"
      : position === "above"
      ? "text-danger"
      : "text-gray-700";

  const statusBg =
    position === "below"
      ? "bg-success-light border-success"
      : position === "above"
      ? "bg-red-50 border-danger"
      : "bg-gray-100 border-gray-300";

  /* ========================= */

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produto.titulo,
    image: produto.imagem_url,
    description: produto.descricao,
    sku: produto.produto_id,
    url: `${BASE_URL}/produto/${slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: metrics.currentPrice,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-[2fr_1fr] gap-14">

        <section className="space-y-12">

          {/* PRODUTO */}
          <div className="bg-white rounded-3xl shadow-soft border border-gray-200 p-8">
            <ProductDetails product={produto} />
          </div>

          {/* DECISÃO INTELIGENTE */}
          <div className="bg-surface-subtle rounded-3xl border border-gray-300 p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              💡 Vale a pena comprar hoje?
            </h2>

            <p className="text-gray-800 leading-relaxed">
              O preço atual é{" "}
              <strong className="text-primary">
                {metrics.currentPrice.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>.
            </p>

            <div className={`mt-6 rounded-2xl p-6 border ${statusBg}`}>
              <p className={`text-lg font-semibold ${statusColor}`}>
                {statusText}
              </p>

              <p className="text-sm mt-2 text-gray-700">
                Média histórica:{" "}
                {metrics.avgPrice.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
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

              <div className={`rounded-2xl p-6 border ${statusBg}`}>
                <p className={`text-sm font-medium mb-2 ${statusColor}`}>
                  Preço atual vs média
                </p>
                <p className={`text-xl font-bold ${statusColor}`}>
                  {statusText}
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
