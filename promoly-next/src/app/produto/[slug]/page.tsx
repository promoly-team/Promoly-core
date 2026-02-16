import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { fetchProductById, fetchPrices } from "@/lib/api";
import { calculatePriceMetrics } from "@/utils/priceMetrics";

import ProductDetails from "@/components/product/ProductDetails";
import ProductHistory from "@/components/product/ProductHistory";
import SimilarProducts from "@/components/product/SimilarProducts";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

/* ==================================================
   METADATA DINÂMICA (NEXT 15 FIX)
================================================== */

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { slug } = await params;

  
  const parts = slug.split("-");
  const id = Number(parts[parts.length - 1]);

  if (isNaN(id)) {
    return {
      title: "Produto não encontrado",
      robots: { index: false },
    };
  }

  try {
    const productData = await fetchProductById(id);

    if (!productData?.produto) {
      return {
        title: "Produto não encontrado",
        robots: { index: false },
      };
    }

    const produto = productData.produto;
    const imageUrl = produto.imagem_url ?? "/placeholder.png";
    const title = `${produto.titulo} com menor preço hoje`;
    const description =
      produto.descricao?.slice(0, 155) ||
      `Veja histórico de preços, ofertas e onde comprar ${produto.titulo} pelo menor valor.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/produto/${slug}`,
      },
      openGraph: {
        title,
        description,
        url: `https://promoly.com.br/produto/${slug}`,
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 600,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "Erro ao carregar produto",
      robots: { index: false },
    };
  }
}

/* ==================================================
   PAGE (NEXT 15 FIX)
================================================== */

export default async function ProductPage({ params }: Props) {

  const { slug } = await params;

  const parts = slug.split("-");
  const id = Number(parts[parts.length - 1]);

  if (isNaN(id)) {
    notFound();
  }

  const productData = await fetchProductById(id);

  if (!productData?.produto) {
    notFound();
  }

  const prices = await fetchPrices(id);

  const priceHistory = prices
    .map((p) => ({
      preco: Number(p.preco),
      data: new Date(p.created_at).getTime(),
    }))
    .sort((a, b) => a.data - b.data);

  const metrics = calculatePriceMetrics(priceHistory);
  const produto = productData.produto;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produto.titulo,
    image: produto.imagem_url,
    description: produto.descricao,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: metrics?.currentPrice ?? undefined,
      availability: "https://schema.org/InStock",
      url: `https://promoly.com.br/produto/${slug}`,
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[2fr_1fr] gap-10">

        <section className="space-y-8">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <ProductDetails product={produto} />
          </div>

          {priceHistory.length > 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Análise de preço
              </h3>

              <div className="grid sm:grid-cols-3 gap-5">
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
                  <p className="text-sm text-emerald-700 mb-2 font-medium">
                    📉 Menor preço histórico
                  </p>
                  <p className="text-xl font-bold text-emerald-800">
                    {metrics.minPrice.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>

                <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
                  <p className="text-sm text-red-600 mb-2 font-medium">
                    📈 Maior preço histórico
                  </p>
                  <p className="text-xl font-bold text-red-700">
                    {metrics.maxPrice.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>

                <div
                  className={`rounded-2xl p-5 border ${
                    metrics.isBelowAverage
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <p
                    className={`text-sm mb-2 font-medium ${
                      metrics.isBelowAverage
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    💰 Preço atual vs média
                  </p>

                  <p
                    className={`text-xl font-bold ${
                      metrics.isBelowAverage
                        ? "text-emerald-800"
                        : "text-red-700"
                    }`}
                  >
                    {metrics.isBelowAverage
                      ? "Abaixo da média"
                      : "Acima da média"}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Média:{" "}
                    {metrics.avgPrice.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {priceHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <ProductHistory
                data={priceHistory}
                lowerDomain={metrics.lowerDomain}
                upperDomain={metrics.upperDomain}
              />
            </div>
          )}
        </section>

        <aside>
          <div className="sticky top-24">
            <SimilarProducts products={productData.similares} />
          </div>
        </aside>

      </div>
    </div>
  );
}
