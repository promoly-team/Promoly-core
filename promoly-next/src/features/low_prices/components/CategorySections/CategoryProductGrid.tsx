import ProductCard from "@/components/ProductCard";
import type { EnrichedProduct } from "@/types";

type Props = {
  products: EnrichedProduct[];
};

export default function CategoryProductGrid({ products }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
      {products.map((p) => (
        <ProductCard key={p.produto_id} product={p} />
      ))}
    </div>
  );
}
