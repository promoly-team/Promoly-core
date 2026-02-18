import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { fetchProductsWithMetrics } from "@/lib/api";
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

  const products = await fetchProductsWithMetrics({
    category: slug,
    below_average: true,
    limit: 100,
  });

  if (!products?.length) {
    notFound();
  }

  return (
    <CategoryLowestPriceView
      slug={slug}
      products={products}
      baseUrl={BASE_URL}
    />
  );
}
