import { notFound } from "next/navigation";
import { fetchProductById, fetchPrices } from "@/lib/api";
import ProductView from "@/features/product/components/ProductView";
import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://promoly-core.vercel.app";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!params?.slug) {
    return {};
  }

  const slug = params.slug;

  const id = Number(slug.split("-").pop());

  if (isNaN(id)) {
    return {};
  }

  const productData = await fetchProductById(id);

  if (!productData?.produto) {
    return {};
  }

  const produto = productData.produto;

  const price = produto.preco?.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return {
    title: produto.titulo,
    description: `Veja histórico de preço e descubra se vale a pena comprar por ${price}.`,
    openGraph: {
      title: produto.titulo,
      description: `Atualmente por ${price}. Veja histórico completo no Promoly.`,
      url: `${BASE_URL}/produto/${slug}`,
      images: [
        {
          url: produto.imagem_url ?? "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: produto.titulo,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: produto.titulo,
      description: `Atualmente por ${price}. Veja histórico completo.`,
      images: [produto.imagem_url ?? "/og-image.jpg"],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = params;

  const id = Number(slug.split("-").pop());

  if (isNaN(id)) notFound();

  const [productData, prices] = await Promise.all([
    fetchProductById(id),
    fetchPrices(id),
  ]);

  if (!productData?.produto) notFound();

  const priceHistory = prices
    .map((p) => ({
      preco: Number(p.preco),
      data: new Date(p.created_at).getTime(),
    }))
    .sort((a, b) => a.data - b.data);

  return (
    <ProductView
      productData={productData}
      priceHistory={priceHistory}
      slug={slug}
      baseUrl={BASE_URL}
    />
  );
}
