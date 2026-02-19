import ProductCard from "@/components/ProductCard";

type Props = {
  products: any[];
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
