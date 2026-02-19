import ProductCard from "@/components/ProductCard";

type Props = {
  products: any[];
};

export default function CategoryLowestGrid({ products }: Props) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-10">Todos abaixo da média</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <ProductCard
            key={p.produto_id}
            product={{
              produto_id: p.produto_id,
              slug: p.slug,
              titulo: p.titulo,
              imagem_url: p.imagem_url,
              url_afiliada: p.url_afiliada,
              preco_atual: p.current_price,
              preco_anterior: p.previous_price,
              desconto_pct: Math.abs(p.diff_percent),
              isBelowAverage: p.diff_percent < 0,
              priceDiffPercent: p.diff_percent,
            }}
          />
        ))}
      </div>
    </section>
  );
}
