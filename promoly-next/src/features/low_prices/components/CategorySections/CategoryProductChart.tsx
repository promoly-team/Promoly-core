import ProductHistory from "@/features/product/components/ProductHistory";

type Props = {
  product: any;
};

export default function CategoryProductChart({ product }: Props) {
  return (
    <ProductHistory
      data={product.history.map((h: any) => ({
        preco: h.preco,
        data: new Date(h.created_at).getTime(),
      }))}
      lowerDomain={product.lowerDomain}
      upperDomain={product.upperDomain}
    />
  );
}
