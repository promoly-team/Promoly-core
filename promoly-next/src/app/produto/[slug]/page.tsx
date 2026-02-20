import { notFound } from "next/navigation";
import { fetchProductById, fetchPrices } from "@/lib/api";
import ProductView from "@/features/product/components/ProductView";
import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://promoly-core.vercel.app";

type Props = {
  params: Promise<{
    slug?: string;
  }>;
};

/* =========================
   Função utilitária segura
========================= */
function extractIdFromSlug(slug?: string): number | null {
  if (!slug) return null;

  const idPart = slug.split("-").pop();
  if (!idPart) return null;

  const id = Number(idPart);
  return isNaN(id) ? null : id;
}

/* =========================
   METADATA
========================= */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    const id = extractIdFromSlug(slug);

    if (!slug || !id) {
      return {};
    }

    const productData = await fetchProductById(id);

    if (!productData?.produto) {
      return {};
    }

    const produto = productData.produto;

    const price =
      produto.preco != null
        ? produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        : null;

    return {
      title: produto.titulo,
      description: price
        ? `Veja histórico de preço e descubra se vale a pena comprar por ${price}.`
        : "Veja histórico completo no Promoly.",
      openGraph: {
        title: produto.titulo,
        description: price
          ? `Atualmente por ${price}. Veja histórico completo no Promoly.`
          : "Veja histórico completo no Promoly.",
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
        description: price
          ? `Atualmente por ${price}. Veja histórico completo.`
          : "Veja histórico completo.",
        images: [produto.imagem_url ?? "/og-image.jpg"],
      },
    };
  } catch (error) {
    console.error("Erro em generateMetadata:", error);
    return {};
  }
}

/* =========================
   PAGE
========================= */
export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;

  const slug = resolvedParams?.slug;
  const id = extractIdFromSlug(slug);

  if (!slug || !id) {
    notFound();
  }

  let productData;
  let prices;

  try {
    [productData, prices] = await Promise.all([
      fetchProductById(id),
      fetchPrices(id),
    ]);
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    notFound();
  }

  if (!productData?.produto) {
    notFound();
  }

  const priceHistory = Array.isArray(prices)
    ? prices
        .map((p) => ({
          preco: Number(p.preco),
          data: new Date(p.created_at).getTime(),
        }))
        .sort((a, b) => a.data - b.data)
    : [];

  return (
    <ProductView
      productData={productData}
      priceHistory={priceHistory}
      slug={slug}
      baseUrl={BASE_URL}
    />
  );
}
