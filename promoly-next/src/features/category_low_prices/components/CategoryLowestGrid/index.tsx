import ProductCard from "@/components/ProductCard";
import type { EnrichedProduct } from "@/types";

type Props = {
  products: EnrichedProduct[];
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
              preco_atual: "preco_atual" in p ? p.preco_atual : null,
              preco_anterior: "preco_anterior" in p ? p.preco_anterior : null,
              desconto_pct: "desconto_pct" in p ? p.desconto_pct : null,
              isBelowAverage: p.priceDiffPercent < 0,
              priceDiffPercent: p.priceDiffPercent,
            }}
          />
        ))}
      </div>
    </section>
  );
}
