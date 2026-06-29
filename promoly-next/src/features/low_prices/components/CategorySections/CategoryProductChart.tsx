import ProductHistory from "@/features/product/components/ProductHistory";
import type { EnrichedProduct } from "@/types";

type Props = {
  product: EnrichedProduct;
};

export default function CategoryProductChart({ product }: Props) {
  return (
    <ProductHistory
      data={product.history.map((h) => ({
        preco: h.preco,
        data: new Date(h.created_at).getTime(),
      }))}
      lowerDomain={product.lowerDomain}
      upperDomain={product.upperDomain}
    />
  );
}
