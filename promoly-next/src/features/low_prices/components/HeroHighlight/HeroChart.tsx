import ProductHistory from "@/features/product/components/ProductHistory";
import type { EnrichedProduct } from "@/types";

type Props = {
  product: EnrichedProduct;
};

export default function HeroChart({ product }: Props) {
  if (!product || !product.history || product.history.length === 0) {
    return (
      <div className="text-[#45C4B0] text-center py-8">
        Histórico de preço indisponível.
      </div>
    );
  }

  const historyData = product.history.map((h) => ({
    preco: h.preco,
    data: new Date(h.created_at).getTime(),
  }));

  return (
    <>
      <ProductHistory
        data={historyData}
        lowerDomain={product.lowerDomain}
        upperDomain={product.upperDomain}
      />
    </>
  );
}
