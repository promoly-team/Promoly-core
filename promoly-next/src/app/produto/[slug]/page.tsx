import { notFound } from "next/navigation";
import { fetchProductById, fetchPrices } from "@/lib/api";
import ProductView from "@/features/product/components/ProductView";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://promoly-core.vercel.app";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

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
