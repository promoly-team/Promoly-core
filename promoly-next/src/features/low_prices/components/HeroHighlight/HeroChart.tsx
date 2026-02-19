import ProductHistory from "@/features/product/components/ProductHistory";

type Props = {
  product: any;
};

export default function HeroChart({ product }: Props) {
  const historyData = product.history.map((h: any) => ({
    preco: h.preco,
    data: new Date(h.created_at).getTime(),
  }));

  return (
    <ProductHistory
      data={historyData}
      lowerDomain={product.lowerDomain}
      upperDomain={product.upperDomain}
    />
  );
}
