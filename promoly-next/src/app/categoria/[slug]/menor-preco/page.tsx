import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { fetchProducts } from "@/lib/api";
import { enrichProducts } from "@/features/low_prices/utils/enrichProducts";
import CategoryLowestPriceView from "@/features/category_low_prices/CategoryLowPricesView";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://promoly-core.vercel.app";

type Props = {
  params: Promise<{ slug: string }>;
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
    openGraph: {
      title: `Menor preço em ${categoriaNome} hoje`,
      description: `Produtos da categoria ${categoriaNome} abaixo da média histórica.`,
      url: `${BASE_URL}/categoria/${slug}/menor-preco`,
      type: "website",
    },
  };
}

/* ===============================================
   PAGE
=============================================== */

export default async function CategoriaMenorPrecoPage({ params }: Props) {
  const { slug } = await params;

  // 🔥 Igual à página principal
  const products = await fetchProducts({
    category: slug,
    order: "desconto",
    limit: 100,
  });

  const enriched = await enrichProducts(products);

  if (!enriched?.length) {
    notFound();
  }

  // 🎯 Hero igual à lógica da página principal
  const heroProduct = [...enriched].sort(
    (a, b) => a.priceDiffPercent - b.priceDiffPercent,
  )[0];

  return (
    <CategoryLowestPriceView
      slug={slug}
      enriched={enriched}
      heroProduct={heroProduct}
      baseUrl={BASE_URL}
    />
  );
}
